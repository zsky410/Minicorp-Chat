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

---

## resetAllData.js

Script để **RESET TOÀN BỘ** dữ liệu trong Firestore và Firebase Auth.

⚠️ **CẢNH BÁO**: Script này sẽ xóa **TẤT CẢ** dữ liệu bao gồm:
- Tất cả users trong Firestore và Firebase Auth
- Tất cả conversations và messages
- Tất cả departments và department messages
- Tất cả announcements
- Tất cả polls
- Tất cả pinned messages
- Tất cả tasks

**Sử dụng khi:**
- Bạn muốn reset toàn bộ project về trạng thái ban đầu
- Bạn muốn xóa hết dữ liệu test
- Bạn muốn bắt đầu lại từ đầu

### Cách sử dụng:

1. **Download Service Account Key** (nếu chưa có):
   - Vào Firebase Console → Project Settings → Service Accounts
   - Click "Generate new private key"
   - Lưu file JSON vào root project với tên `serviceAccountKey.json`

2. **Cài đặt dependencies** (nếu chưa có):
   ```bash
   npm install firebase-admin
   ```

3. **Chạy script:**
   ```bash
   node scripts/resetAllData.js
   ```

### Lưu ý:
- Script sẽ xóa **TẤT CẢ** dữ liệu, không thể hoàn tác!
- Đảm bảo bạn đã backup dữ liệu quan trọng trước khi chạy
- Sau khi reset, bạn cần:
  1. Tạo lại admin user từ web dashboard
  2. Tạo lại departments
  3. Tạo lại users cho tổ chức

