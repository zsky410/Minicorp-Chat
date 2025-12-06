# MiniCorp Chat - App Chat Nội Bộ

App chat nội bộ cho công ty nhỏ (20-50 người) được xây dựng với React Native (Expo) và Firebase.

## 🚀 Cài đặt và Chạy

### 1. Cài đặt dependencies

```bash
npm install
```

### 2. Setup Firebase (BẮT BUỘC - CẦN LÀM THỦ CÔNG)

Bạn cần tạo Firebase project và cấu hình:

1. **Tạo Firebase Project:**

   - Truy cập [Firebase Console](https://console.firebase.google.com)
   - Tạo project mới với tên "MiniCorpChat"
   - Chọn plan (có thể dùng Spark plan miễn phí)

2. **Enable Authentication:**

   - Vào Authentication > Sign-in method
   - Bật "Email/Password"

3. **Tạo Firestore Database:**

   - Vào Firestore Database
   - Tạo database (chọn "Start in production mode")
   - Chọn location (gần nhất với bạn)

4. **Tạo Storage Bucket (TÙY CHỌN):**

   - **LƯU Ý:** Storage yêu cầu Blaze plan (pay-as-you-go)
   - **Option A - Upgrade lên Blaze (Khuyến nghị):**
     - Vào Project Settings > Usage and billing
     - Upgrade to Blaze plan (có free tier: 5GB storage/tháng)
     - Sau đó vào Storage > Bắt đầu setup
   - **Option B - Bỏ qua Storage:**
     - App vẫn hoạt động bình thường, chỉ không có tính năng upload ảnh
     - Có thể thêm Storage sau khi upgrade

5. **Lấy Firebase Config:**
   - Vào Project Settings (biểu tượng bánh răng)
   - Scroll xuống "Your apps"
   - Chọn "Web" (biểu tượng </>)
   - Đăng ký app với nickname "MiniCorpChat Web"
   - Copy config và paste vào file `firebase.config.js`

**File `firebase.config.js` sẽ có dạng:**

```javascript
export const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "minicorpchat.firebaseapp.com",
  projectId: "minicorpchat",
  storageBucket: "minicorpchat.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
};
```

### 3. Tạo Firestore Index (QUAN TRỌNG!)

Khi chạy app lần đầu, bạn sẽ gặp lỗi "The query requires an index". Đây là bình thường!

**Cách tạo index:**

1. **Tự động (Khuyến nghị):**

   - Khi gặp lỗi, Firebase sẽ hiển thị link trong console/logs
   - Copy link và mở trong browser (link có dạng: `https://console.firebase.google.com/v1/r/project/...`)
   - Click "Create Index" - Firebase sẽ tự động tạo index

2. **Thủ công:**
   - Vào [Firebase Console](https://console.firebase.google.com) > Project của bạn
   - Vào Firestore Database > Indexes tab
   - Click "Create Index"
   - Điền thông tin:
     - Collection ID: `conversations`
     - Fields:
       - Field 1: `members` - Type: Array
       - Field 2: `updatedAt` - Type: Timestamp, Order: Descending
   - Click "Create"
   - Đợi vài phút để index được build (status: Building → Enabled)

**Lưu ý:** Index sẽ mất vài phút để build. Trong thời gian này, query sẽ fail. Sau khi index enabled, app sẽ hoạt động bình thường.

### 4. Chạy ứng dụng

```bash
# Start Expo development server
npm start

# Hoặc chạy trên platform cụ thể
npm run android  # Android
npm run ios      # iOS (cần macOS)
npm run web      # Web browser
```

## 📁 Cấu trúc Project

```
minicorp-chat/
├── App.js                    # Root component với navigation
├── firebase.config.js        # Firebase configuration (CẦN CẬP NHẬT)
├── src/
│   ├── components/          # Reusable components
│   ├── screens/            # Screen components
│   │   ├── auth/          # Auth screens (Login, Register, ForgotPassword)
│   │   ├── main/          # Main app screens
│   │   └── admin/         # Admin screens
│   ├── navigation/         # Navigation configs
│   ├── services/          # Firebase services
│   ├── context/           # React Context providers
│   ├── hooks/             # Custom hooks
│   └── utils/             # Helper functions
└── assets/                # Images, fonts, etc.
```

## ✅ Day 1 Checklist

- [x] Project setup xong
- [ ] Firebase connected (CẦN BẠN SETUP THỦ CÔNG)
- [x] Auth service hoạt động
- [x] Login/Register UI đẹp
- [x] Navigation chuyển đổi Auth/Main
- [ ] Test: Đăng ký → Logout → Login lại (SAU KHI SETUP FIREBASE)

## 🔥 Firebase Security Rules (Quan trọng!)

Sau khi setup Firebase, bạn cần cấu hình Security Rules:

### Firestore Rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }

    // Conversations
    match /conversations/{conversationId} {
      // Allow read if user is a member
      allow read: if request.auth != null &&
        request.auth.uid in resource.data.members;

      // Allow create if user is in the members array of the new document
      allow create: if request.auth != null &&
        request.auth.uid in request.resource.data.members;

      // Allow update if user is a member
      allow update: if request.auth != null &&
        request.auth.uid in resource.data.members;

      // Allow delete if user is a member
      allow delete: if request.auth != null &&
        request.auth.uid in resource.data.members;
    }

    // Messages subcollection
    match /conversations/{conversationId}/messages/{messageId} {
      // Allow read if user is a member of the parent conversation
      allow read: if request.auth != null &&
        request.auth.uid in get(/databases/$(database)/documents/conversations/$(conversationId)).data.members;

      // Allow create if user is authenticated
      allow create: if request.auth != null;

      // Allow update/delete if user is the sender
      allow update, delete: if request.auth != null &&
        request.auth.uid == resource.data.senderId;
    }

    // Departments
    match /departments/{departmentId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null;
    }

    // Announcements
    match /announcements/{announcementId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null &&
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /avatars/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    match /messages/{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 📝 Lưu ý

- Email đăng ký phải có đuôi `@minicorp.com`
- Mật khẩu tối thiểu 6 ký tự
- App sẽ tự động chuyển giữa Auth và Main navigator dựa trên trạng thái đăng nhập

## 🐛 Troubleshooting

- **Lỗi Firebase không kết nối:** Kiểm tra lại `firebase.config.js` đã đúng chưa
- **Lỗi "Permission denied":** Kiểm tra Firestore Security Rules
- **Lỗi navigation:** Đảm bảo đã cài đủ dependencies: `npm install`
- **Lỗi "The query requires an index":**
  - Khi chạy app lần đầu, Firestore sẽ yêu cầu tạo composite index
  - **Cách 1 (Tự động - Khuyến nghị):** Copy link từ error message và mở trong browser - Firebase sẽ tự động tạo index với đúng order
  - **Cách 2 (Thủ công):** Vào Firebase Console > Firestore Database > Indexes > Create Index:
    - Collection ID: `conversations`
    - Fields to index:
      - Field 1: `members` - Type: **Array**
      - Field 2: `updatedAt` - Type: **Timestamp**, Order: **Descending** ⬇️ (QUAN TRỌNG!)
    - Click "Create"
  - **Lưu ý:** Nếu đã có index với `updatedAt` là Ascending, phải xóa và tạo lại với Descending
  - Index sẽ mất vài phút để build, sau đó app sẽ hoạt động bình thường

## 📚 Tài liệu tham khảo

- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/)
- [Firebase Documentation](https://firebase.google.com/docs)
