# Scripts Utility

## cleanupAuthUsers.js

Script để cleanup users trong Firebase Auth mà không có trong Firestore.

### Cách sử dụng:

1. **Download Service Account Key:**
   - Vào Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Lưu file JSON vào root project với tên `serviceAccountKey.json`
   - ⚠️ **QUAN TRỌNG**: Thêm `serviceAccountKey.json` vào `.gitignore` để không commit lên git!

2. **Cài đặt dependencies:**
   ```bash
   npm install firebase-admin
   ```

3. **Chạy script:**
   ```bash
   node scripts/cleanupAuthUsers.js
   ```

### Lưu ý:
- Script sẽ so sánh users trong Firestore và Firebase Auth
- Xóa tất cả users trong Auth mà không có trong Firestore
- Hiển thị danh sách users sẽ bị xóa trước khi xóa

