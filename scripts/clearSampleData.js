const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Helper để xóa collection
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
      if (snapshot.size === 0) {
        resolve();
        return;
      }

      const batch = db.batch();
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

// Helper để xóa subcollection
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

// Main function
async function clearSampleData() {
  console.log('🗑️  Bắt đầu xóa dữ liệu mẫu...\n');
  console.log('⚠️  LƯU Ý: Script này sẽ xóa:');
  console.log('  - Tất cả conversations và messages (1-1)');
  console.log('  - Tất cả department messages');
  console.log('  - Tất cả announcements');
  console.log('  - Tất cả polls');
  console.log('  - Tất cả pinned_messages');
  console.log('\n✅ SẼ GIỮ LẠI:');
  console.log('  - Users (không xóa)');
  console.log('  - Departments (không xóa)\n');

  try {
    // 1. Xóa conversations và messages subcollection
    console.log('💬 Đang xóa conversations...');
    const conversationsSnapshot = await db.collection('conversations').get();
    console.log(`  Tìm thấy ${conversationsSnapshot.size} conversations`);

    // Xóa messages subcollection trước
    console.log('  Đang xóa messages trong conversations...');
    await deleteSubcollection('conversations', 'messages');
    console.log('  ✅ Đã xóa tất cả messages');

    // Xóa conversations
    await deleteCollection('conversations');
    console.log('  ✅ Đã xóa tất cả conversations\n');

    // 2. Xóa department messages (subcollection)
    console.log('🏢 Đang xóa department messages...');
    const departmentsSnapshot = await db.collection('departments').get();
    console.log(`  Tìm thấy ${departmentsSnapshot.size} departments`);

    // Xóa messages subcollection trong departments
    await deleteSubcollection('departments', 'messages');
    console.log('  ✅ Đã xóa tất cả department messages');

    // Reset lastMessage và unreadCount trong departments
    const batch = db.batch();
    departmentsSnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        lastMessage: null,
        unreadCount: {}
      });
    });
    await batch.commit();
    console.log('  ✅ Đã reset lastMessage và unreadCount trong departments\n');

    // 3. Xóa announcements
    console.log('📢 Đang xóa announcements...');
    const announcementsSnapshot = await db.collection('announcements').get();
    console.log(`  Tìm thấy ${announcementsSnapshot.size} announcements`);
    await deleteCollection('announcements');
    console.log('  ✅ Đã xóa tất cả announcements\n');

    // 4. Xóa polls
    console.log('📊 Đang xóa polls...');
    const pollsSnapshot = await db.collection('polls').get();
    console.log(`  Tìm thấy ${pollsSnapshot.size} polls`);
    await deleteCollection('polls');
    console.log('  ✅ Đã xóa tất cả polls\n');

    // 5. Xóa pinned_messages (nếu có)
    console.log('📌 Đang xóa pinned_messages...');
    try {
      const pinnedSnapshot = await db.collection('pinned_messages').get();
      console.log(`  Tìm thấy ${pinnedSnapshot.size} pinned messages`);
      await deleteCollection('pinned_messages');
      console.log('  ✅ Đã xóa tất cả pinned_messages\n');
    } catch (error) {
      if (error.code === 5) {
        console.log('  ℹ️  Collection pinned_messages không tồn tại, bỏ qua\n');
      } else {
        throw error;
      }
    }

    console.log('✅ Hoàn thành! Đã xóa tất cả dữ liệu mẫu.');
    console.log('📊 Thống kê:');
    console.log(`  - Conversations: ${conversationsSnapshot.size} đã xóa`);
    console.log(`  - Department messages: Đã xóa`);
    console.log(`  - Announcements: ${announcementsSnapshot.size} đã xóa`);
    console.log(`  - Polls: ${pollsSnapshot.size} đã xóa`);
    console.log('\n✨ Bạn có thể chạy pushSampleData.js để tạo lại dữ liệu mẫu!');

  } catch (error) {
    console.error('\n❌ Lỗi:', error);
    process.exit(1);
  }
}

// Chạy script
clearSampleData()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Lỗi:', error);
    process.exit(1);
  });

