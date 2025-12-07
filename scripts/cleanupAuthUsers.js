// Script để cleanup users trong Firebase Auth mà không có trong Firestore
// Chạy: node scripts/cleanupAuthUsers.js

const admin = require('firebase-admin');
const serviceAccount = require('../serviceAccountKey.json'); // Cần download từ Firebase Console

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function cleanupAuthUsers() {
  try {
    console.log('Đang lấy danh sách users từ Firestore...');
    const usersSnapshot = await db.collection('users').get();
    const firestoreUserIds = new Set();

    usersSnapshot.forEach(doc => {
      firestoreUserIds.add(doc.id);
    });

    console.log(`Tìm thấy ${firestoreUserIds.size} users trong Firestore`);

    console.log('Đang lấy danh sách users từ Firebase Auth...');
    const listUsersResult = await admin.auth().listUsers();
    const authUsers = listUsersResult.users;

    console.log(`Tìm thấy ${authUsers.length} users trong Firebase Auth`);

    const usersToDelete = [];
    authUsers.forEach(user => {
      if (!firestoreUserIds.has(user.uid)) {
        usersToDelete.push(user);
      }
    });

    console.log(`\nTìm thấy ${usersToDelete.length} users cần xóa trong Auth:`);
    usersToDelete.forEach(user => {
      console.log(`  - ${user.email} (${user.uid})`);
    });

    if (usersToDelete.length === 0) {
      console.log('\nKhông có user nào cần xóa!');
      process.exit(0);
    }

    console.log('\nBắt đầu xóa...');
    for (const user of usersToDelete) {
      try {
        await admin.auth().deleteUser(user.uid);
        console.log(`✓ Đã xóa: ${user.email}`);
      } catch (error) {
        console.error(`✗ Lỗi khi xóa ${user.email}:`, error.message);
      }
    }

    console.log('\nHoàn thành!');
    process.exit(0);
  } catch (error) {
    console.error('Lỗi:', error);
    process.exit(1);
  }
}

cleanupAuthUsers();

