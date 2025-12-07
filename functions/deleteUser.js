// Cloud Function để xóa user trong Firebase Auth khi xóa trong Firestore
const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Trigger khi user document bị xóa trong Firestore
exports.deleteUserAuth = functions.firestore
  .document('users/{userId}')
  .onDelete(async (snap, context) => {
    const userId = context.params.userId;

    try {
      // Xóa user trong Firebase Authentication
      await admin.auth().deleteUser(userId);
      console.log(`Successfully deleted user ${userId} from Auth`);
      return null;
    } catch (error) {
      console.error(`Error deleting user ${userId} from Auth:`, error);
      // Không throw error để không rollback việc xóa trong Firestore
      // Nếu user không tồn tại trong Auth, cũng không sao
      return null;
    }
  });

