const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Path to your service account key

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function deleteCollection(collectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const query = collectionRef.limit(batchSize);

  return new Promise((resolve, reject) => {
    deleteQueryBatch(query, resolve, reject);
  });
}

async function deleteQueryBatch(query, resolve, reject) {
  query.get()
    .then((snapshot) => {
      // When there are no documents left, we are done
      if (snapshot.size === 0) {
        resolve();
        return;
      }

      // Delete documents in a batch
      const batch = db.batch();
      snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      return batch.commit().then(() => {
        // Recurse on the next process tick, to avoid
        // exploding the stack.
        process.nextTick(() => {
          deleteQueryBatch(query, resolve, reject);
        });
      });
    })
    .catch(reject);
}

async function deleteSubcollection(collectionPath, subcollectionPath, batchSize = 100) {
  const collectionRef = db.collection(collectionPath);
  const snapshot = await collectionRef.get();

  const deletePromises = [];
  snapshot.docs.forEach((doc) => {
    const subcollectionRef = doc.ref.collection(subcollectionPath);
    deletePromises.push(deleteCollection(subcollectionRef.path, batchSize));
  });

  await Promise.all(deletePromises);
}

async function deleteAllUsersFromAuth() {
  console.log("Deleting all users from Firebase Auth...");

  try {
    let deletedCount = 0;
    let nextPageToken;

    do {
      const listUsersResult = await admin.auth().listUsers(1000, nextPageToken);

      const deletePromises = listUsersResult.users.map((userRecord) => {
        return admin.auth().deleteUser(userRecord.uid);
      });

      await Promise.all(deletePromises);
      deletedCount += listUsersResult.users.length;
      console.log(`Deleted ${listUsersResult.users.length} users from Auth. Total: ${deletedCount}`);

      nextPageToken = listUsersResult.pageToken;
    } while (nextPageToken);

    console.log(`Successfully deleted ${deletedCount} users from Firebase Auth.`);
  } catch (error) {
    console.error("Error deleting users from Auth:", error);
    throw error;
  }
}

async function resetAllData() {
  console.log("Starting full database reset...");
  console.log("⚠️  WARNING: This will delete ALL data in Firestore and ALL users in Firebase Auth!");
  console.log("");

  try {
    // 1. Delete all conversations and their messages
    console.log("1. Deleting conversations and messages...");
    await deleteSubcollection("conversations", "messages");
    await deleteCollection("conversations");
    console.log("   ✓ Conversations deleted");

    // 2. Delete all department messages
    console.log("2. Deleting department messages...");
    await deleteSubcollection("departments", "messages");
    console.log("   ✓ Department messages deleted");

    // 3. Delete all departments
    console.log("3. Deleting departments...");
    await deleteCollection("departments");
    console.log("   ✓ Departments deleted");

    // 4. Delete all announcements
    console.log("4. Deleting announcements...");
    await deleteCollection("announcements");
    console.log("   ✓ Announcements deleted");

    // 5. Delete all polls
    console.log("5. Deleting polls...");
    await deleteCollection("polls");
    console.log("   ✓ Polls deleted");

    // 6. Delete all pinned messages
    console.log("6. Deleting pinned messages...");
    await deleteCollection("pinned_messages");
    console.log("   ✓ Pinned messages deleted");

    // 7. Delete all tasks (if exists)
    console.log("7. Deleting tasks...");
    await deleteCollection("tasks");
    console.log("   ✓ Tasks deleted");

    // 8. Delete all users from Firestore
    console.log("8. Deleting users from Firestore...");
    await deleteCollection("users");
    console.log("   ✓ Users deleted from Firestore");

    // 9. Delete all users from Firebase Auth
    console.log("9. Deleting users from Firebase Auth...");
    await deleteAllUsersFromAuth();
    console.log("   ✓ Users deleted from Firebase Auth");

    console.log("");
    console.log("✅ Database reset completed successfully!");
    console.log("All collections and users have been deleted.");
    console.log("");
    console.log("Next steps:");
    console.log("1. Create a new admin user from the web dashboard");
    console.log("2. Create departments");
    console.log("3. Create users for your organization");

  } catch (error) {
    console.error("❌ Error during database reset:", error);
    throw error;
  }
}

// Run the reset
resetAllData()
  .then(() => {
    console.log("Reset script completed.");
    process.exit(0);
  })
  .catch((error) => {
    console.error("Reset script failed:", error);
    process.exit(1);
  });

