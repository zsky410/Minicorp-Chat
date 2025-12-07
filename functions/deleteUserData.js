// Cloud Function để tự động xóa tất cả dữ liệu liên quan khi user bị xóa
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Helper function để xóa collection
async function deleteCollection(collectionRef, batchSize = 100) {
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      if (snapshot.size === 0) {
        resolve();
        return;
      }

      const batch = admin.firestore().batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        process.nextTick(() => {
          deleteQueryBatch(query, resolve, reject);
        });
      });
    })
    .catch(reject);
}

// Trigger khi user document bị xóa trong Firestore
exports.onUserDelete = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const userId = context.params.userId;
    const db = admin.firestore();
    const batch = db.batch();

    console.log(`Starting cleanup for deleted user: ${userId}`);

    try {
      // 1. Xóa user trong Firebase Authentication
      try {
        await admin.auth().deleteUser(userId);
        console.log(`✓ Deleted user ${userId} from Auth`);
      } catch (authError) {
        // User có thể đã không tồn tại trong Auth
        if (authError.code !== 'auth/user-not-found') {
          console.error(`Error deleting user from Auth:`, authError);
        }
      }

      // 2. Xóa conversations mà user là member
      const conversationsQuery = await db.collection('conversations')
        .where('members', 'array-contains', userId)
        .get();

      const conversationPromises = [];
      conversationsQuery.forEach((conversationDoc) => {
        const conversationId = conversationDoc.id;

        // Xóa messages trong conversation
        const messagesRef = db.collection('conversations').doc(conversationId).collection('messages');
        conversationPromises.push(deleteCollection(messagesRef));

        // Xóa conversation document
        conversationPromises.push(conversationDoc.ref.delete());
      });

      await Promise.all(conversationPromises);
      console.log(`✓ Deleted ${conversationsQuery.size} conversations and their messages`);

      // 3. Xóa department messages của user
      const departmentsQuery = await db.collection('departments').get();
      const departmentMessagePromises = [];

      departmentsQuery.forEach((deptDoc) => {
        const messagesRef = deptDoc.ref.collection('messages')
          .where('senderId', '==', userId);

        departmentMessagePromises.push(
          messagesRef.get().then((messagesSnapshot) => {
            const deletePromises = [];
            messagesSnapshot.forEach((msgDoc) => {
              deletePromises.push(msgDoc.ref.delete());
            });
            return Promise.all(deletePromises);
          })
        );
      });

      await Promise.all(departmentMessagePromises);
      console.log(`✓ Deleted department messages for user`);

      // 4. Xóa announcements created by user
      const announcementsQuery = await db.collection('announcements')
        .where('createdBy', '==', userId)
        .get();

      const announcementPromises = [];
      announcementsQuery.forEach((announcementDoc) => {
        announcementPromises.push(announcementDoc.ref.delete());
      });

      await Promise.all(announcementPromises);
      console.log(`✓ Deleted ${announcementsQuery.size} announcements`);

      // 5. Xóa polls created by user
      const pollsQuery = await db.collection('polls')
        .where('createdBy', '==', userId)
        .get();

      const pollPromises = [];
      pollsQuery.forEach((pollDoc) => {
        pollPromises.push(pollDoc.ref.delete());
      });

      await Promise.all(pollPromises);
      console.log(`✓ Deleted ${pollsQuery.size} polls`);

      // 6. Xóa pinned messages pinned by user
      const pinnedMessagesQuery = await db.collection('pinned_messages')
        .where('pinnedBy', '==', userId)
        .get();

      const pinnedPromises = [];
      pinnedMessagesQuery.forEach((pinnedDoc) => {
        pinnedPromises.push(pinnedDoc.ref.delete());
      });

      await Promise.all(pinnedPromises);
      console.log(`✓ Deleted ${pinnedMessagesQuery.size} pinned messages`);

      // 7. Xóa tasks assigned to user
      const tasksQuery = await db.collection('tasks')
        .where('assignedTo', '==', userId)
        .get();

      const taskPromises = [];
      tasksQuery.forEach((taskDoc) => {
        taskPromises.push(taskDoc.ref.delete());
      });

      await Promise.all(taskPromises);
      console.log(`✓ Deleted ${tasksQuery.size} tasks`);

      // 8. Remove user from departments (members array)
      const allDepartmentsQuery = await db.collection('departments').get();
      const departmentUpdatePromises = [];

      allDepartmentsQuery.forEach((deptDoc) => {
        const deptData = deptDoc.data();
        if (deptData.members && deptData.members.includes(userId)) {
          const updatedMembers = deptData.members.filter(memberId => memberId !== userId);
          departmentUpdatePromises.push(
            deptDoc.ref.update({
              members: updatedMembers,
              // Nếu user là manager, xóa manager info
              ...(deptData.managerId === userId && {
                managerId: admin.firestore.FieldValue.delete(),
                managerName: admin.firestore.FieldValue.delete(),
              }),
            })
          );
        }
      });

      await Promise.all(departmentUpdatePromises);
      console.log(`✓ Removed user from departments`);

      // 9. Remove user votes from polls (update polls where user voted)
      const allPollsQuery = await db.collection('polls').get();
      const pollUpdatePromises = [];

      allPollsQuery.forEach((pollDoc) => {
        const pollData = pollDoc.data();
        let needsUpdate = false;
        const updatedOptions = pollData.options.map((option) => {
          if (option.votes && option.votes.includes(userId)) {
            needsUpdate = true;
            return {
              ...option,
              votes: option.votes.filter(voteId => voteId !== userId),
            };
          }
          return option;
        });

        if (needsUpdate) {
          pollUpdatePromises.push(
            pollDoc.ref.update({
              options: updatedOptions,
            })
          );
        }
      });

      await Promise.all(pollUpdatePromises);
      console.log(`✓ Removed user votes from polls`);

      // 10. Remove user from announcement readBy arrays
      const allAnnouncementsQuery = await db.collection('announcements').get();
      const announcementUpdatePromises = [];

      allAnnouncementsQuery.forEach((announcementDoc) => {
        const announcementData = announcementDoc.data();
        if (announcementData.readBy && announcementData.readBy.includes(userId)) {
          const updatedReadBy = announcementData.readBy.filter(readId => readId !== userId);
          announcementUpdatePromises.push(
            announcementDoc.ref.update({
              readBy: updatedReadBy,
            })
          );
        }
      });

      await Promise.all(announcementUpdatePromises);
      console.log(`✓ Removed user from announcement readBy arrays`);

      console.log(`✅ Successfully cleaned up all data for user ${userId}`);
      return null;

    } catch (error) {
      console.error(`❌ Error cleaning up user data for ${userId}:`, error);
      // Không throw error để không rollback việc xóa user document
      return null;
    }
  });

