# Firebase Cloud Functions

Cloud Functions để tự động xóa dữ liệu liên quan khi user bị xóa.

## Functions

### `onUserDelete`

Trigger tự động khi user document bị xóa trong Firestore. Function này sẽ:

1. **Xóa user trong Firebase Authentication**
2. **Xóa conversations và messages:**
   - Tìm tất cả conversations mà user là member
   - Xóa tất cả messages trong các conversations đó
   - Xóa conversation documents
3. **Xóa department messages:**
   - Xóa tất cả messages của user trong tất cả departments
4. **Xóa announcements:**
   - Xóa tất cả announcements được tạo bởi user
   - Remove user khỏi `readBy` arrays của các announcements khác
5. **Xóa polls:**
   - Xóa tất cả polls được tạo bởi user
   - Remove user votes khỏi các polls khác
6. **Xóa pinned messages:**
   - Xóa tất cả pinned messages được pin bởi user
7. **Xóa tasks:**
   - Xóa tất cả tasks được assign cho user
8. **Update departments:**
   - Remove user khỏi `members` array của các departments
   - Xóa `managerId` và `managerName` nếu user là manager

## Deploy

**Lưu ý:** Cloud Functions yêu cầu Firebase Blaze plan (pay-as-you-go).

```bash
cd functions
npm install
cd ..
firebase deploy --only functions
```

## Local Testing

```bash
cd functions
npm install
npm run serve
```

## Cách hoạt động

1. Admin xóa user từ web dashboard
2. `deleteUser()` trong `userService.ts` xóa user document trong Firestore
3. Cloud Function `onUserDelete` tự động trigger
4. Function xóa tất cả dữ liệu liên quan
5. User và tất cả dữ liệu liên quan đã được xóa hoàn toàn

## Lưu ý

- Function không throw error để không rollback việc xóa user document
- Nếu một số operations fail (ví dụ: user không tồn tại trong Auth), function vẫn tiếp tục xóa các dữ liệu khác
- Function sử dụng batch operations để tối ưu performance

