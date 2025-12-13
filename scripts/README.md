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

---

## pushSampleData.js

Script để **PUSH DỮ LIỆU MẪU** lên Firestore (conversations và messages) để demo nhanh.

**Tính năng:**
- Đọc tất cả users hiện có từ Firestore
- Tự động tạo conversations giữa các users (mỗi user chat với 2-3 users khác)
- Tạo messages mẫu trong mỗi conversation (5-10 messages/conversation)
- **CHỈ THÊM DỮ LIỆU**, không xóa hay chỉnh sửa dữ liệu hiện có
- Nếu conversation đã tồn tại, chỉ thêm messages mới (nếu chưa có)

**Sử dụng khi:**
- Bạn muốn có dữ liệu mẫu để demo UI
- Bạn muốn test tính năng chat mà không cần đăng nhập qua lại nhiều tài khoản
- Bạn cần dữ liệu để chụp ảnh cho báo cáo

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
   node scripts/pushSampleData.js
   ```

### Lưu ý:
- Script **CHỈ THÊM** dữ liệu, không xóa hay chỉnh sửa
- Nếu conversation đã tồn tại, script sẽ bỏ qua (không tạo lại)
- Nếu conversation đã có messages, script sẽ bỏ qua (không thêm messages mới)
- Mỗi user sẽ có conversation với 2-3 users khác
- Mỗi conversation sẽ có 5-10 messages mẫu
- Messages sẽ có timestamp cách nhau 2-5 phút để tạo lịch sử tự nhiên

---

## clearSampleData.js

Script để **XÓA DỮ LIỆU MẪU** (conversations, messages, announcements, polls) nhưng **GIỮ LẠI users và departments**.

**Tính năng:**
- Xóa tất cả conversations và messages (1-1)
- Xóa tất cả department messages
- Xóa tất cả announcements
- Xóa tất cả polls
- Xóa tất cả pinned_messages
- **GIỮ LẠI**: Users và Departments (không xóa)
- Reset lastMessage và unreadCount trong departments về null/empty

**Sử dụng khi:**
- Bạn muốn xóa dữ liệu mẫu cũ để tạo lại dữ liệu mới
- Bạn muốn test lại script pushSampleData
- Bạn muốn làm sạch dữ liệu test nhưng giữ lại users và departments

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
   node scripts/clearSampleData.js
   ```

### Lưu ý:
- Script **CHỈ XÓA** dữ liệu mẫu, **KHÔNG XÓA** users và departments
- Sau khi xóa, bạn có thể chạy `pushSampleData.js` để tạo lại dữ liệu mới
- Departments sẽ được reset lastMessage và unreadCount về null/empty
- Script an toàn, không ảnh hưởng đến users và departments

