# Thiết Kế Hệ Thống Role, Department và Logic Nghiệp Vụ

## 1. Tổng Quan

Tài liệu này mô tả chi tiết hệ thống phân quyền, phòng ban và logic nghiệp vụ cho ứng dụng chat nội bộ MiniCorp Chat.

---

## 2. Cấu Trúc Phòng Ban (Departments)

### 2.1. Định Nghĩa

**Department** là đơn vị tổ chức trong công ty, mỗi phòng ban có:

- **ID**: Mã định danh duy nhất (ví dụ: "sales", "hr", "it")
- **Tên**: Tên phòng ban (ví dụ: "Phòng Kinh Doanh", "Phòng Nhân Sự")
- **Mô tả**: Mô tả ngắn về chức năng của phòng ban
- **Icon**: Biểu tượng đại diện (emoji hoặc icon)
- **Loại**:
  - `public`: Phòng ban công khai (mọi người có thể xem)
  - `department`: Phòng ban riêng tư (chỉ thành viên mới xem được)
- **Manager**: Người quản lý phòng ban (có role `manager`)
- **Members**: Danh sách thành viên trong phòng ban

### 2.2. Danh Sách Phòng Ban Mẫu

```
1. Phòng Kinh Doanh (Sales)
   - ID: sales
   - Manager: Người quản lý phòng kinh doanh
   - Chức năng: Quản lý bán hàng, khách hàng

2. Phòng Nhân Sự (HR)
   - ID: hr
   - Manager: Người quản lý nhân sự
   - Chức năng: Tuyển dụng, quản lý nhân viên

3. Phòng IT (IT)
   - ID: it
   - Manager: Người quản lý IT
   - Chức năng: Quản lý hệ thống, công nghệ

4. Phòng Marketing (Marketing)
   - ID: marketing
   - Manager: Người quản lý marketing
   - Chức năng: Quảng bá, truyền thông

5. Phòng Tài Chính (Finance)
   - ID: finance
   - Manager: Người quản lý tài chính
   - Chức năng: Quản lý tài chính, kế toán

6. Phòng Ban Chung (General)
   - ID: general
   - Manager: Không có (admin quản lý)
   - Chức năng: Thông báo chung, không thuộc phòng ban nào
```

---

## 3. Hệ Thống Role (Vai Trò)

### 3.1. Cấu Trúc Phân Cấp

```
Admin (Quản trị viên)
  ↓
Director (Giám đốc)
  ↓
Manager (Quản lý)
  ↓
Employee (Nhân viên)
```

### 3.2. Chi Tiết Từng Role

#### 3.2.1. **Admin** (Quản trị viên)

**Mô tả**: Người quản lý toàn bộ hệ thống, có quyền cao nhất (tuy nhiên chỉ bao gồm các chức năng cơ bản để quản lý user) Admin là một vai trò mặc định không cần login hay gì cả (để demo nhanh chóng) không hiển thị trong app, admin chỉ khả dụng trên web

**Quyền hạn**:

- ✅ Xem và quản lý TẤT CẢ users (tạo, sửa, xóa)
- ✅ Xem và quản lý TẤT CẢ departments (tạo, sửa, xóa)
- ✅ Xem analytics user
- ✅ Quản lý settings hệ thống
- ✅ Gán role cho users
- ✅ Gán manager cho departments

**Giới hạn**:

- ❌ Không thể xóa chính mình
- ❌ Không thể thay đổi role của chính mình (phải có admin khác làm)

---

#### 3.2.2. **Director** (Giám đốc)

**Mô tả**: Lãnh đạo cấp cao, có quyền xem và quản lý toàn công ty (read-only cho các phòng ban khác).

**Quyền hạn**:

- ✅ Xem TẤT CẢ conversations (của mọi phòng ban) - **CHỈ ĐỌC**
- ✅ Xem TẤT CẢ departments - **CHỈ ĐỌC**
- ✅ Tạo thông báo công ty (company-wide announcements) trong phòng chung general
- ✅ Chat với bất kỳ ai (direct 1-1)

**Giới hạn**:

- ❌ Không thể tạo/sửa/xóa users
- ❌ Không thể tạo/sửa/xóa departments
- ❌ Không thể gán role cho users

**UI hiển thị**:

- Badge màu tím: "Giám đốc"
- Có thể xem tất cả phòng ban trong danh sách (với icon "read-only")
- Có thể chat với bất kỳ ai

---

#### 3.2.3. **Manager** (Quản lý)

**Mô tả**: Người chỉ quản lý "một" phòng ban cụ thể.

**Quyền hạn**:

- ✅ Quản lý phòng ban được gán (xem, sửa thông tin phòng ban)
- ✅ Xem danh sách members trong phòng ban của mình
- ✅ Tạo thông báo cho phòng ban của mình
- ✅ Tạo tasks, polls cho phòng ban của mình
- ✅ Pin/unpin messages trong conversation của phòng ban mình quản lý
- ✅ Chat với bất kỳ ai trong công ty
- ✅ Xem conversations của phòng ban mình quản lý

**Giới hạn**:

- ❌ Chỉ quản lý được phòng ban được gán làm manager
- ❌ Không thể tạo/sửa/xóa users
- ❌ Không thể tạo/sửa/xóa departments
- ❌ Không thể gán role cho users
- ❌ Không thể tạo thông báo công ty (chỉ thông báo phòng ban)

**UI hiển thị**:

- Badge màu xanh: "Quản lý"
- Chỉ thấy phòng ban mình quản lý trong danh sách quản lý

---

#### 3.2.4. **Employee** (Nhân viên)

**Mô tả**: Nhân viên thông thường, quyền hạn cơ bản nhất.

**Quyền hạn**:

- ✅ Chat với đồng nghiệp (1-1)
- ✅ Xem và tham gia conversations của phòng ban mình
- ✅ Xem thông báo của phòng ban mình và thông báo công ty
- ✅ Xem tasks được gán cho mình
- ✅ Tham gia polls của phòng ban mình
- ✅ Xem pinned messages trong conversations mình tham gia
- ✅ Cập nhật profile của chính mình (trừ email, role, department)
- ✅ Upload avatar

**Giới hạn**:

- ❌ Không thể tạo thông báo
- ❌ Không thể tạo tasks, polls
- ❌ Không thể pin messages
- ❌ Không thể xem conversations của phòng ban khác (trừ khi được mời)
- ❌ Không thể quản lý users, departments

**UI hiển thị**:

- Badge màu xám: "Nhân viên"
- Chỉ thấy phòng ban mình trong danh sách
- Không có menu quản lý

---

## 4. Logic Hiển Thị Theo Role

### 4.1. Home Screen (Danh Sách Conversations)

**Tất cả roles**:

- Thấy conversations mình tham gia (1-1)
- Còn những thứ như phòng ban, profile thì nó sẽ nằm ở tab chính của chức năng đó. Homescreen chỉ hiển thị list chat 1-1 của bản thân

---

### 4.2. Departments Screen

**Tất cả roles**:

- Thấy phòng ban mình thuộc về

**Director**:

- Thấy TẤT CẢ phòng ban
- Mỗi phòng ban có icon "👁️" (read-only) nếu không phải manager

**Manager**:

- Thấy phòng ban mình quản lý (có icon "⭐" hoặc "Quản lý")
- Thấy phòng ban mình thuộc về

**Employee**:

- Chỉ thấy phòng ban mình thuộc về

---

### 4.3. Department Chat Screen (Là tính năng trong department screen)

**Tất cả roles**:

- Có thể chat trong phòng ban mình

**Director**:

- Không thể chat trong các phòng ban nhưng có thể xem toàn bộ lịch sử conversations (read-only mode: có thể xem lịch sử)

**Manager**:

- Có thể chat và quản lý (pin messages, tạo tasks) trong phòng ban mình quản lý

**Employee**:

- Chỉ chat được trong phòng ban mình

---

### 4.4. Profile Screen

**Tất cả roles**:

- Xem profile của chính mình
- Có thể sửa: tên, số điện thoại, avatar
- Không thể sửa: email, role, department (chỉ admin mới sửa được)

**Hiển thị role badge**:

- Director: Badge tím "Giám đốc"
- Manager: Badge xanh "Quản lý"
- Employee: Badge xám "Nhân viên"

---

### 4.5. Notifications Screen

**Tất cả roles**:

- Thấy thông báo của phòng ban mình
- Thấy thông báo công ty (company-wide)

**Director**:

- Có thể tạo thông báo công ty

**Manager**:

- Có thể tạo thông báo cho phòng ban mình quản lý

**Employee**:

- Chỉ xem thông báo

---

### 4.6. Tasks Screen (Phần task screen này BỎ vì app tôi không có)

---

### 4.7. Polls Screen (Này sẽ là một tính năng trong department chat screen)

**Director**:

- không thể tạo

**Manager**:

- Chỉ tạo polls cho phòng ban mình quản lý

**Employee**:

- Chỉ được vote polls phòng ban mình thuộc về

---

## 5. Quy Tắc Gán Role và Department

### 5.1. Khi Tạo User Mới

1. **Admin** tạo user trên web dashboard
2. Mặc định role: `employee`
3. Phải chọn department (bắt buộc)
4. Có thể gán role ngay khi tạo hoặc sau này

### 5.2. Khi Thay Đổi Role

**Chỉ Admin mới có thể thay đổi role**:

- Employee → Manager: Cần gán làm manager của ít nhất 1 department
- Manager → Director: Tự động mất quyền quản lý departments (nếu có)
- Bất kỳ → Employee: Reset về nhân viên thông thường

### 5.3. Khi Thay Đổi Department

**Chỉ Admin mới có thể thay đổi department**:

- Khi đổi department, user tự động rời khỏi conversations của phòng ban cũ
- User bị xóa conversations đối với phòng ban đó, chỉ xóa UI còn những tin nhắn cũ vẫn hiển thị trong department để user khác vẫn xem được
- User tự động tham gia conversations của phòng ban mới (sau khi admin đổi)

### 5.4. Khi Gán Manager Cho Department

**Chỉ Admin mới có thể gán manager**:

- Một department có thể có 1 manager
- Một user chỉ có thể là manager của 1 departments

---

## 6. Logic Permissions Chi Tiết

### 6.1. Chat Permissions

| Action                    | Employee | Manager             | Director                                                                  |
| ------------------------- | -------- | ------------------- | ------------------------------------------------------------------------- |
| Chat 1-1 với bất kỳ ai    | ✅       | ✅                  | ✅                                                                        |
| Chat trong phòng ban mình | ✅       | ✅                  | ❌ (vì giám đốc chỉ có thể xem toàn bộ , chứ kh thuộc về 1 phòng ban nào) |
| Chat trong phòng ban khác | ❌       | ❌                  | ❌ (vì giám đốc chỉ có thể xem toàn bộ , chứ kh thuộc về 1 phòng ban nào) |
| Pin messages              | ❌       | ✅ (phòng ban mình) | ❌                                                                        |

---

### 6.2. Announcement Permissions

| Action                  | Employee | Manager             | Director      |
| ----------------------- | -------- | ------------------- | ------------- |
| Xem thông báo phòng ban | ✅       | ✅                  | ❌            |
| Xem thông báo công ty   | ✅       | ✅                  | ✅            |
| Tạo thông báo phòng ban | ❌       | ✅ (phòng ban mình) | ❌            |
| Tạo thông báo công ty   | ❌       | ❌                  | ✅            |
| Sửa/Xóa thông báo       | ❌       | ✅ (của mình)       | ✅ (của mình) |

---

### 6.3. Task Permissions (Bỏ)

---

### 6.4. Poll Permissions

| Action              | Employee | Manager             | Director           | Admin              |
| ------------------- | -------- | ------------------- | ------------------ | ------------------ |
| Xem polls phòng ban | ✅       | ✅                  | ✅                 | ✅                 |
| Vote polls          | ✅       | ✅                  | ✅                 | ✅                 |
| Tạo polls           | ❌       | ✅ (phòng ban mình) | ✅ (mọi phòng ban) | ✅ (mọi phòng ban) |
| Sửa/Xóa polls       | ❌       | ✅ (của mình)       | ✅ (của mình)      | ✅ (tất cả)        |

---

### 6.5. User Management Permissions

| Action                 | Employee | Manager | Director       | Admin |
| ---------------------- | -------- | ------- | -------------- | ----- |
| Xem profile người khác | ✅       | ✅      | ✅             | ✅    |
| Sửa profile mình       | ✅\*     | ✅\*    | ✅\*           | ✅\*  |
| Xem danh sách users    | ❌       | ❌      | ✅ (read-only) | ✅    |
| Tạo users              | ❌       | ❌      | ❌             | ✅    |
| Sửa users              | ❌       | ❌      | ❌             | ✅    |
| Xóa users              | ❌       | ❌      | ❌             | ✅    |
| Gán role               | ❌       | ❌      | ❌             | ✅    |
| Gán department         | ❌       | ❌      | ❌             | ✅    |

\*Chỉ sửa được: tên, số điện thoại, avatar. Không sửa được: email, role, department.

---

### 6.6. Department Management Permissions

| Action               | Employee | Manager             | Director       | Admin |
| -------------------- | -------- | ------------------- | -------------- | ----- |
| Xem phòng ban mình   | ✅       | ✅                  | ✅             | ✅    |
| Xem tất cả phòng ban | ❌       | ❌                  | ✅ (read-only) | ✅    |
| Tạo departments      | ❌       | ❌                  | ❌             | ✅    |
| Sửa departments      | ❌       | ✅ (phòng ban mình) | ❌             | ✅    |
| Xóa departments      | ❌       | ❌                  | ❌             | ✅    |
| Gán manager          | ❌       | ❌                  | ❌             | ✅    |

---

## 7. Quy Tắc Business Logic

### 7.1. Khi User Đổi Department

1. User tự động rời khỏi department chat của phòng ban cũ
2. User vẫn giữ conversations cá nhân (1-1 chat)
3. User tự động tham gia department chat của phòng ban mới (sau khi admin đổi)
4. **Quan trọng**: User bị xóa conversations đối với phòng ban đó (chỉ xóa UI, không xóa dữ liệu)
5. Tin nhắn cũ vẫn hiển thị trong department để user khác vẫn xem được
6. Polls của phòng ban cũ vẫn hiển thị (nhưng không thể vote nữa nếu đã đổi phòng ban)
7. Thông báo của phòng ban cũ không còn hiển thị cho user đó

### 7.2. Khi User Đổi Role

1. **Employee → Manager**:

   - Phải được gán làm manager của 1 department (chỉ 1 department)
   - Tự động có quyền quản lý phòng ban đó
   - Có thể tạo thông báo, tasks, polls cho phòng ban đó
   - Có thể pin messages trong phòng ban đó

2. **Manager → Director**:

   - Mất quyền quản lý department (không còn là manager)
   - Mất quyền chat trong phòng ban (chỉ xem read-only)
   - Mất quyền pin messages
   - Mất quyền tạo polls
   - Có quyền xem tất cả phòng ban (read-only)
   - Có quyền tạo thông báo công ty (chỉ trong phòng chung "general")
   - Có quyền chat 1-1 với bất kỳ ai

3. **Bất kỳ → Employee**:

   - Reset về nhân viên thông thường
   - Mất tất cả quyền quản lý
   - Chỉ có quyền chat 1-1 và chat trong phòng ban mình

4. **Manager → Employee**:
   - Mất quyền quản lý department
   - Department đó sẽ không còn manager (admin cần gán manager mới)

### 7.3. Khi Xóa User

1. User bị xóa khỏi Firestore
2. Conversations 1-1 của user vẫn giữ lại (để lưu lịch sử)
3. Messages của user vẫn hiển thị (nhưng hiển thị "Người dùng đã xóa")
4. User bị remove khỏi tất cả departments
5. Nếu user là manager của department, department đó sẽ không còn manager (admin cần gán manager mới)
6. Polls mà user đã vote vẫn giữ lại (nhưng không hiển thị tên user nữa)

### 7.4. Khi Xóa Department

1. Tất cả users trong department chuyển sang "General" (hoặc department mặc định)
2. Department chat conversations được archive (không xóa, để lưu lịch sử)
3. Polls của department vẫn giữ lại (nhưng không thể vote nữa)
4. Thông báo của department vẫn giữ lại (nhưng không hiển thị)
5. Nếu department có manager, manager đó mất quyền quản lý (role vẫn là manager nhưng không quản lý phòng ban nào)

### 7.5. Khi Gán Manager Cho Department

1. Một department chỉ có thể có 1 manager
2. Một user chỉ có thể là manager của 1 department
3. Khi gán manager, user phải có role `manager` (nếu chưa có, admin cần set role trước)
4. Nếu department đã có manager khác, manager cũ sẽ mất quyền (nhưng role vẫn là manager, chỉ không quản lý phòng ban nào)
5. Manager mới tự động có quyền:
   - Chat trong phòng ban đó
   - Tạo thông báo cho phòng ban đó
   - Tạo polls cho phòng ban đó
   - Pin messages trong phòng ban đó

### 7.6. Logic Director Xem Phòng Ban

1. Director không thuộc về phòng ban nào cụ thể
2. Director có thể xem TẤT CẢ phòng ban (read-only mode)
3. Director không thể chat trong phòng ban (chỉ xem lịch sử)
4. Director chỉ có thể tạo thông báo công ty (trong phòng chung "general")
5. Director không thể tạo polls
6. Director không thể pin messages
7. Director chỉ có thể chat 1-1 với bất kỳ ai

---

## 8. UI/UX Guidelines

### 8.1. Role Badges

- **Admin**: Không hiển thị trong app (chỉ có trên web dashboard)
- **Director**: Badge tím (#5856D6) - "Giám đốc"
- **Manager**: Badge xanh (#007AFF) - "Quản lý"
- **Employee**: Badge xám (#8E8E93) - "Nhân viên"

### 8.2. Department Icons

- Sales: 💼
- HR: 👥
- IT: 💻
- Marketing: 📢
- Finance: 💰
- General: 📁

### 8.3. Visual Indicators

- **Read-only mode** (Director xem phòng ban): Icon 👁️ hoặc text "Chỉ xem" ở header department chat
- **Manager badge**: Icon ⭐ hoặc text "Quản lý" trong department list
- **Locked features**: Disable button hoặc ẩn hoàn toàn
- **Director viewing department**: Hiển thị banner "Bạn đang xem phòng ban này ở chế độ chỉ đọc" ở đầu department chat screen
- **Chat input disabled** (Director): Input field bị disable với text "Giám đốc chỉ có thể xem lịch sử chat"

### 8.4. Navigation Structure

**Bottom Tabs:**

1. **Home** (Chat): Chỉ hiển thị list chat 1-1
2. **Departments**: Hiển thị phòng ban (theo role)
3. **Notifications**: Thông báo
4. **Profile**: Profile cá nhân

**Không có tab riêng cho:**

- Tasks (đã bỏ)
- Polls (nằm trong department chat screen)
- Users list (chỉ Director mới thấy trong một số màn hình)

---

## 9. Database Schema

### 9.1. User Document

```javascript
{
  uid: string,              // Firebase Auth UID
  email: string,            // Email (không thể sửa bởi user, chỉ admin)
  name: string,             // Tên (có thể sửa bởi user)
  phone: string,            // Số điện thoại (có thể sửa bởi user)
  department: string,       // Department ID (chỉ admin sửa)
  role: "employee" | "manager" | "director",  // Role (chỉ admin sửa, không có "admin" trong app)
  avatar: string,           // Base64 hoặc URL (có thể sửa bởi user)
  status: "online" | "offline" | "away",
  lastSeen: timestamp,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Lưu ý**:

- Role "admin" không tồn tại trong app, chỉ có trên web dashboard
- User không thể sửa email, role, department (chỉ admin trên web mới sửa được)

### 9.2. Department Document

```javascript
{
  id: string,               // Department ID (ví dụ: "sales", "general")
  name: string,              // Tên phòng ban
  description: string,       // Mô tả
  icon: string,             // Icon (emoji)
  type: "public" | "department",
  managerId: string | null,  // UID của manager (chỉ có 1 manager, có thể null)
  managerName: string | null, // Tên manager (để hiển thị nhanh)
  members: string[],        // Array of user UIDs (tự động update khi user đổi department)
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Lưu ý**:

- Một department chỉ có 1 manager (không phải array)
- Manager phải có role "manager"
- Khi gán manager mới, manager cũ tự động mất quyền

### 9.3. Conversation Document (1-1 Chat)

```javascript
{
  id: string,               // Auto-generated
  type: "direct",           // Chỉ có "direct" (1-1), không có "group"
  members: [string, string], // Array of 2 user UIDs
  memberDetails: {
    "uid1": { name: string, avatar: string, department: string },
    "uid2": { name: string, avatar: string, department: string }
  },
  lastMessage: {
    text: string,
    senderId: string,
    senderName: string,
    timestamp: timestamp
  },
  unreadCount: {
    "uid1": number,
    "uid2": number
  },
  updatedAt: timestamp,
  createdAt: timestamp
}
```

### 9.4. Department Conversation Document

```javascript
{
  id: string,               // Department ID (ví dụ: "sales")
  type: "department",       // Loại conversation
  departmentId: string,     // Department ID
  members: string[],        // Array of user UIDs trong department (tự động sync)
  lastMessage: {
    text: string,
    senderId: string,
    senderName: string,
    timestamp: timestamp
  },
  unreadCount: {
    "uid1": number,
    "uid2": number
  },
  pinnedMessages: string[], // Array of message IDs (chỉ manager mới pin được)
  updatedAt: timestamp,
  createdAt: timestamp
}
```

### 9.5. Poll Document

```javascript
{
  id: string,               // Auto-generated
  departmentId: string,     // Department ID
  createdBy: string,        // User UID
  createdByName: string,    // Tên người tạo
  question: string,         // Câu hỏi poll
  options: [
    { id: string, text: string, votes: string[] } // votes là array of user UIDs
  ],
  voters: string[],        // Array of user UIDs đã vote
  createdAt: timestamp,
  updatedAt: timestamp
}
```

**Lưu ý**:

- Chỉ Manager và Director có thể tạo polls (nhưng Director không thể tạo theo thiết kế mới)
- Employee chỉ có thể vote
- Polls nằm trong department chat screen, không có screen riêng

---

## 10. Implementation Checklist

### 10.1. Backend (Firestore Rules)

- [ ] Update Firestore rules để phù hợp với permissions mới
- [ ] Đảm bảo chỉ admin (trên web) mới có thể sửa role, department của users
- [ ] Đảm bảo manager chỉ quản lý được phòng ban của mình (1 phòng ban)
- [ ] Đảm bảo director có thể xem tất cả (read-only) nhưng không thể chat trong phòng ban
- [ ] Đảm bảo chỉ manager mới có thể pin messages trong phòng ban của mình
- [ ] Đảm bảo chỉ manager mới có thể tạo polls trong phòng ban của mình
- [ ] Đảm bảo chỉ director mới có thể tạo thông báo công ty (trong phòng "general")

### 10.2. Frontend (Mobile App)

- [ ] Update `permissionService.js` với logic mới (bỏ admin, cập nhật director/manager)
- [ ] Update UI để hiển thị role badges đúng màu (bỏ admin badge)
- [ ] Update HomeScreen: Chỉ hiển thị list chat 1-1 (bỏ phòng ban, profile)
- [ ] Update DepartmentsScreen để hiển thị phòng ban theo role:
  - Employee: Chỉ thấy phòng ban mình
  - Manager: Thấy phòng ban mình quản lý (có icon ⭐)
  - Director: Thấy tất cả phòng ban (có icon 👁️ cho read-only)
- [ ] Update DepartmentChatScreen:
  - Director: Disable input, hiển thị banner "Chỉ xem", chỉ xem lịch sử
  - Manager: Có thể chat, pin messages, tạo polls
  - Employee: Chỉ có thể chat
- [ ] Update ProfileScreen: Disable sửa email, role, department
- [ ] Update NotificationsScreen:
  - Employee: Chỉ xem thông báo
  - Manager: Có thể tạo thông báo phòng ban mình
  - Director: Có thể tạo thông báo công ty (chỉ trong "general")
- [ ] Bỏ TasksScreen (không còn tính năng này)
- [ ] Update Polls: Tích hợp vào DepartmentChatScreen (không có screen riêng)
- [ ] Update logic khi user đổi department: Xóa UI conversations của phòng ban cũ

### 10.3. Web Dashboard

- [ ] Update user management:
  - Gán role (chỉ: employee, manager, director - không có admin trong app)
  - Gán department
  - Validation: Khi gán manager cho department, user phải có role "manager"
- [ ] Update department management:
  - Gán manager (chỉ 1 manager, không phải array)
  - Validation: Một user chỉ có thể là manager của 1 department
  - Khi gán manager mới, manager cũ tự động mất quyền
- [ ] Thêm logic: Khi user đổi department, tự động update members array trong department documents
- [ ] Thêm logic: Khi user đổi role từ manager → khác, department mất manager

---

## 11. Migration Plan

### 11.1. Dữ Liệu Hiện Tại

1. **Kiểm tra users hiện tại**:

   - Xem có user nào có role "admin" không (cần xóa hoặc đổi thành role khác vì admin không có trong app)
   - Xem có user nào có role không hợp lệ không
   - Xem có user nào chưa có department không
   - Xem có user nào là manager của nhiều departments không (chỉ giữ 1 department)

2. **Kiểm tra departments hiện tại**:

   - Xem có department nào có nhiều manager không (chỉ giữ 1 manager đầu tiên)
   - Xem có department nào có manager nhưng manager đó không có role "manager" không
   - Xem có department "general" chưa (nếu chưa có thì tạo)

3. **Kiểm tra conversations hiện tại**:
   - Xem có conversation nào type "group" không (cần xóa hoặc convert sang "direct")
   - Xem có conversation nào có nhiều hơn 2 members không (cần xử lý)

### 11.2. Migration Steps

1. **Bước 1**: Tạo department "general" nếu chưa có (cho thông báo công ty)

2. **Bước 2**: Set department mặc định "general" cho users chưa có department

3. **Bước 3**: Set role mặc định `employee` cho users chưa có role hoặc có role "admin"

4. **Bước 4**: Xử lý managers:

   - Nếu user là manager của nhiều departments: Chỉ giữ department đầu tiên, xóa các departments khác
   - Nếu department có nhiều managers: Chỉ giữ manager đầu tiên, xóa các managers khác
   - Đảm bảo manager có role "manager" (nếu chưa có thì set)

5. **Bước 5**: Xử lý conversations:

   - Xóa hoặc archive conversations type "group"
   - Xử lý conversations có nhiều hơn 2 members (có thể xóa hoặc tách thành nhiều conversations 1-1)

6. **Bước 6**: Update Firestore rules theo thiết kế mới

7. **Bước 7**: Update app code theo checklist ở phần 10

8. **Bước 8**: Test với từng role:

   - Test Employee: Chat 1-1, chat trong phòng ban mình
   - Test Manager: Quản lý phòng ban, pin messages, tạo polls
   - Test Director: Xem tất cả phòng ban (read-only), tạo thông báo công ty

9. **Bước 9**: Test migration:
   - Test đổi department: User mất conversations của phòng ban cũ (UI)
   - Test đổi role: Manager → Director mất quyền quản lý
   - Test gán manager: Department chỉ có 1 manager

---

## 12. Testing Scenarios

### 12.1. Test Cases Cho Employee

- [ ] Employee chỉ thấy phòng ban mình trong DepartmentsScreen
- [ ] Employee chỉ chat được trong phòng ban mình (DepartmentChatScreen)
- [ ] Employee có thể chat 1-1 với bất kỳ ai (HomeScreen)
- [ ] Employee không thể tạo thông báo
- [ ] Employee không thể tạo polls
- [ ] Employee không thể pin messages
- [ ] Employee chỉ sửa được profile mình (trừ email, role, department)
- [ ] Employee chỉ xem được thông báo (không tạo được)
- [ ] Employee có thể vote polls trong phòng ban mình

### 12.2. Test Cases Cho Manager

- [ ] Manager chỉ quản lý được 1 phòng ban được gán
- [ ] Manager thấy phòng ban mình quản lý với icon ⭐ trong DepartmentsScreen
- [ ] Manager có thể chat trong phòng ban mình quản lý
- [ ] Manager có thể tạo thông báo cho phòng ban mình
- [ ] Manager có thể tạo polls cho phòng ban mình
- [ ] Manager có thể pin messages trong phòng ban mình
- [ ] Manager không thể chat trong phòng ban khác
- [ ] Manager không thể tạo thông báo công ty
- [ ] Manager không thể quản lý users, departments (trên app)
- [ ] Manager có thể chat 1-1 với bất kỳ ai

### 12.3. Test Cases Cho Director

- [ ] Director xem được tất cả phòng ban trong DepartmentsScreen (với icon 👁️)
- [ ] Director KHÔNG THỂ chat trong bất kỳ phòng ban nào (chỉ xem read-only)
- [ ] Director thấy banner "Chỉ xem" khi vào DepartmentChatScreen
- [ ] Director thấy input field bị disable với text "Giám đốc chỉ có thể xem lịch sử chat"
- [ ] Director có thể tạo thông báo công ty (chỉ trong phòng "general")
- [ ] Director KHÔNG THỂ tạo polls
- [ ] Director KHÔNG THỂ pin messages
- [ ] Director có thể chat 1-1 với bất kỳ ai
- [ ] Director không thể quản lý users, departments (trên app)
- [ ] Director không thuộc về phòng ban nào (department field có thể null hoặc "general")

### 12.4. Test Cases Cho Admin (Web Dashboard)

- [ ] Admin chỉ có trên web dashboard (không có trong app)
- [ ] Admin quản lý được tất cả users (tạo, sửa, xóa)
- [ ] Admin quản lý được tất cả departments (tạo, sửa, xóa)
- [ ] Admin có thể gán role (employee, manager, director)
- [ ] Admin có thể gán department cho users
- [ ] Admin có thể gán manager cho departments (chỉ 1 manager)
- [ ] Admin có thể xem analytics

### 12.5. Test Cases Cho Business Logic

- [ ] Khi admin đổi department của user: User mất conversations của phòng ban cũ (UI), nhưng tin nhắn vẫn còn cho user khác
- [ ] Khi admin đổi role từ Manager → Director: Manager mất quyền quản lý phòng ban, department mất manager
- [ ] Khi admin gán manager mới: Manager cũ tự động mất quyền (nhưng role vẫn là "manager")
- [ ] Khi admin xóa user: User bị remove khỏi tất cả departments, nếu là manager thì department mất manager
- [ ] Khi admin xóa department: Tất cả users trong department chuyển sang "general"

---

## 13. Notes và Best Practices

1. **Luôn validate permissions ở cả client và server** (Firestore rules)

   - Client validation để UX tốt (disable button, ẩn feature)
   - Server validation (Firestore rules) để bảo mật thực sự

2. **Không trust client**: Mọi thay đổi quan trọng phải qua server validation

   - User không thể sửa role, department trên app (chỉ admin trên web)
   - User không thể bypass permissions bằng cách sửa code

3. **UI phải rõ ràng**: User phải biết mình có quyền gì, không có quyền gì

   - Disable button thay vì ẩn hoàn toàn (để user biết feature tồn tại nhưng không có quyền)
   - Hiển thị message rõ ràng khi không có quyền (ví dụ: "Chỉ quản lý mới có thể pin tin nhắn")

4. **Error messages**: Khi user không có quyền, hiển thị message rõ ràng

   - Ví dụ: "Bạn không có quyền tạo polls. Chỉ quản lý phòng ban mới có thể tạo polls."

5. **Performance**: Cache permissions để tránh query nhiều lần

   - Tính toán permissions một lần khi user login, cache trong AuthContext
   - Chỉ tính lại khi role hoặc department thay đổi

6. **Security**: Không expose sensitive data trong client code

   - Không hardcode admin credentials
   - Không expose Firestore rules logic trong client code

7. **Director Read-Only Mode**:

   - Luôn hiển thị rõ ràng khi Director đang xem ở chế độ read-only
   - Disable tất cả actions (chat, pin, create polls) với message giải thích
   - Không để Director nhầm lẫn là có thể tương tác

8. **Manager Single Department**:

   - Đảm bảo logic chỉ cho phép Manager quản lý 1 department
   - Khi gán manager mới, tự động xóa manager cũ
   - Validate trên cả client và server

9. **Department Conversations**:

   - Khi user đổi department, chỉ xóa UI conversations (không xóa dữ liệu)
   - Tin nhắn cũ vẫn hiển thị cho user khác trong phòng ban
   - User mới vào phòng ban chỉ thấy tin nhắn từ lúc họ tham gia

10. **Admin Web Only**:
    - Admin không tồn tại trong app mobile
    - Tất cả quản lý users/departments chỉ trên web dashboard
    - App mobile không có tính năng quản lý users/departments

---

## 14. Kết Luận

Hệ thống này được thiết kế để:

- **Rõ ràng**: Mỗi role có quyền hạn cụ thể, dễ hiểu, không có sự nhầm lẫn
- **Đơn giản**: Bỏ các tính năng phức tạp không cần thiết (tasks, group chat)
- **Tập trung**: HomeScreen chỉ hiển thị chat 1-1, các tính năng khác ở tab riêng
- **Bảo mật**: Phân quyền chặt chẽ, admin chỉ trên web, không có trong app
- **User-friendly**: UI/UX rõ ràng, user biết mình có thể làm gì, không thể làm gì
- **Read-only rõ ràng**: Director biết rõ mình chỉ xem được, không thể tương tác

**Điểm khác biệt chính so với thiết kế ban đầu:**

- Admin chỉ có trên web, không có trong app
- Director không thể chat trong phòng ban (chỉ xem read-only)
- Manager chỉ quản lý 1 phòng ban (không phải nhiều)
- Bỏ tính năng Tasks
- Polls chỉ là tính năng trong department chat, không có screen riêng
- HomeScreen chỉ hiển thị chat 1-1

Nếu cần điều chỉnh, hãy cập nhật tài liệu này và đảm bảo code implementation phù hợp.
