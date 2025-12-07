# 🚀 **LEVEL UP PROJECT: WEB DASHBOARD + ADVANCED PERMISSIONS**

---

## 📊 **TỔNG QUAN NÂNG CấP**

### **Thêm gì?**

1. **Web Dashboard (Admin)** - Quản lý toàn bộ tổ chức
2. **Hệ thống phân quyền đa cấp** - 4 roles với permissions khác nhau
3. **Department Management** - Quản lý phòng ban chặt chẽ hơn
4. **Advanced Features** - Tính năng dành riêng cho Manager/Director

### **Công nghệ:**

- **Web Dashboard**: React.js + Firebase (hoặc Next.js)
- **App Mobile**: Giữ nguyên React Native
- **Shared Backend**: Firebase (Auth, Firestore, Functions)

---

## 🎯 **HỆ THỐNG PHÂN QUYỀN (4 ROLES)**

### **1. Employee (Nhân viên) - Base Role**

**Quyền hạn:**

- ✅ Chat 1-1 với mọi người trong công ty
- ✅ Xem danh sách nhân viên
- ✅ Vào phòng ban của mình (read + send messages)
- ✅ Xem thông báo của phòng ban mình
- ❌ Không tạo thông báo
- ❌ Không ghim tin nhắn
- ❌ Không tạo task/poll

### **2. Manager (Quản lý phòng ban)**

**Quyền hạn:**

- ✅ Tất cả quyền của Employee
- ✅ **Pin messages** trong phòng ban của mình
- ✅ **Tạo thông báo** cho phòng ban của mình
- ✅ **Tạo & assign tasks** trong phòng ban
- ✅ **Xem báo cáo** hoạt động phòng ban (ai active, ai không)
- ✅ **Tạo polls/votes** trong phòng ban
- ❌ Không thêm/xóa thành viên
- ❌ Không access phòng ban khác

### **3. Director (Giám đốc)**

**Quyền hạn:**

- ✅ Tất cả quyền của Manager
- ✅ **Access tất cả phòng ban** (read-only)
- ✅ **Tạo thông báo toàn công ty**
- ✅ **Xem dashboard analytics** (tổng quan công ty)
- ✅ **Export reports** (hoạt động, thống kê)
- ❌ Không quản lý user (add/remove)

### **4. Admin (Quản trị viên)**

**Quyền hạn:**

- ✅ **Full access** tất cả tính năng
- ✅ **Web Dashboard**: Quản lý users, departments, roles
- ✅ **Add/Remove/Edit** users
- ✅ **Assign roles** và departments
- ✅ **Xem audit logs** (ai làm gì, khi nào)
- ✅ **System settings**: Enable/disable features

---

## 💻 **WEB DASHBOARD - TÍNH NĂNG CHI TIẾT**

### **1. User Management**

```
┌─────────────────────────────────────────┐
│ 🔍 Search: [___________] + Filters      │
├─────────────────────────────────────────┤
│ ┌─────────────────────────────────────┐ │
│ │ Avatar | Name | Email | Dept | Role│ │
│ │   👤   | John | j@... | IT   | MGR │ │
│ │ [Edit] [Delete] [Reset PW]          │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ [+ Add New User]                        │
└─────────────────────────────────────────┘
```

**Features:**

- Tạo user với form: name, email, password, department, role
- Bulk import từ CSV/Excel
- Deactivate/activate users
- Reset password
- View user activity logs

### **2. Department Management**

```
┌─────────────────────────────────────────┐
│ Departments                             │
├─────────────────────────────────────────┤
│ Engineering (8 members)                 │
│   └─ Manager: John Doe                  │
│   └─ Members: [View List]               │
│   [Edit] [View Stats]                   │
├─────────────────────────────────────────┤
│ Marketing (5 members)                   │
│   └─ Manager: Jane Smith                │
│   [Edit] [View Stats]                   │
└─────────────────────────────────────────┘
```

**Features:**

- Tạo/sửa/xóa phòng ban
- Assign manager cho department
- Add/remove members
- Xem stats: số tin nhắn, active users, tasks

### **3. Analytics Dashboard**

```
┌────────────────┬────────────────┬────────────────┐
│ Total Users    │ Active Today   │ Messages Today │
│      42        │      38        │      1,234     │
└────────────────┴────────────────┴────────────────┘

📊 Activity by Department (Chart)
📈 User Growth (Chart)
📉 Message Volume (Chart)
```

### **4. System Logs**

```
[2024-01-15 10:30] John (Manager) created announcement in Engineering
[2024-01-15 10:25] Admin added new user: newuser@company.com
[2024-01-15 10:20] Jane (Director) exported company report
```

---

## 📱 **APP MOBILE - TÍNH NĂNG MỚI THEO ROLE**

### **Employee View (No changes)**

- Tab Chats, Departments (chỉ của mình), Notifications, Profile

### **Manager View (+ Features)**

**Tab Departments có thêm:**

1. **Pin Message Button** trong chat

   - Long press message → "Pin" option
   - Pinned messages show ở top channel

2. **Create Task Button** (FAB)

   ```
   ┌──────────────────────────┐
   │ New Task                 │
   ├──────────────────────────┤
   │ Title: [____________]    │
   │ Assign to: [Dropdown]    │
   │ Due date: [Date Picker]  │
   │ Priority: ○ Low ● High   │
   │                          │
   │ [Cancel]  [Create Task]  │
   └──────────────────────────┘
   ```

3. **Create Poll Button**

   ```
   ┌──────────────────────────┐
   │ Quick Poll               │
   ├──────────────────────────┤
   │ Question: [____________] │
   │ Option 1: [____________] │
   │ Option 2: [____________] │
   │ [+ Add Option]           │
   │                          │
   │ [Cancel]  [Post Poll]    │
   └──────────────────────────┘
   ```

4. **Department Stats Tab**

   - Ai active hôm nay
   - Số tin nhắn trong tuần
   - Tasks pending

5. **Create Announcement** (chỉ cho dept mình)

### **Director View (+ Features)**

1. **Access All Departments** (read-only)

   - Filter: "My Dept" | "All Depts"
   - Có thể xem messages nhưng không send (hoặc có tag [Director])

2. **Company-wide Announcement**

   - Nút "Create Company Announcement" (màu khác)

3. **Reports Tab** (New)
   ```
   ┌──────────────────────────┐
   │ 📊 Company Reports       │
   ├──────────────────────────┤
   │ ○ Active Users Report    │
   │ ○ Department Performance │
   │ ○ Message Volume         │
   │ ○ Task Completion Rate   │
   │                          │
   │ [Generate Report]        │
   └──────────────────────────┘
   ```

### **Admin View**

- Có thêm button "Open Web Dashboard" trong Profile

---

## 🗂️ **DATABASE SCHEMA MỚI**

### **users collection (updated)**

```javascript
{
  uid: "user123",
  name: "John Doe",
  email: "john@company.com",
  role: "manager", // employee | manager | director | admin
  department: "Engineering",
  position: "Senior Developer",
  permissions: {
    canCreateDeptAnnouncement: true,
    canPinMessages: true,
    canCreateTasks: true,
    canViewAllDepts: false,
    canManageUsers: false,
    canAccessDashboard: false
  },
  managedDepartments: ["Engineering"], // Nếu là manager
  createdAt: timestamp,
  isActive: true
}
```

### **departments collection (updated)**

```javascript
{
  id: "engineering",
  name: "Engineering",
  managerId: "user123", // Manager của department
  managerName: "John Doe",
  members: ["user1", "user2", "user3"],
  stats: {
    messageCount: 1234,
    taskCount: 45,
    completedTasks: 30
  }
}
```

### **tasks collection (NEW)**

```javascript
{
  id: "task123",
  departmentId: "engineering",
  title: "Fix bug #123",
  description: "...",
  assignedTo: "user456",
  assignedBy: "user123", // Manager
  dueDate: timestamp,
  priority: "high", // low | medium | high
  status: "pending", // pending | in-progress | completed
  createdAt: timestamp
}
```

### **polls collection (NEW)**

```javascript
{
  id: "poll123",
  departmentId: "engineering",
  question: "Team lunch preference?",
  options: [
    { id: 1, text: "Pizza", votes: ["user1", "user2"] },
    { id: 2, text: "Sushi", votes: ["user3"] }
  ],
  createdBy: "user123",
  createdAt: timestamp,
  expiresAt: timestamp
}
```

### **pinned_messages collection (NEW)**

```javascript
{
  id: "pin123",
  departmentId: "engineering",
  messageId: "msg456",
  messageText: "Important update...",
  pinnedBy: "user123", // Manager
  pinnedAt: timestamp
}
```

### **audit_logs collection (NEW)**

```javascript
{
  id: "log123",
  userId: "user123",
  userName: "John Doe",
  action: "created_task", // created_user, deleted_user, pinned_message, etc.
  details: { taskId: "task123", title: "..." },
  timestamp: timestamp
}
```

---

## 🛠️ **IMPLEMENTATION ROADMAP**

### **Phase 1: Backend (2-3 ngày)**

1. Update Firestore schema
2. Create Cloud Functions cho permissions check
3. Seed data với 4 role examples

### **Phase 2: Web Dashboard (3-4 ngày)**

1. Setup React.js project
2. User Management CRUD
3. Department Management
4. Analytics Dashboard
5. System Logs

### **Phase 3: Mobile App Updates (3-4 ngày)**

1. Update AuthContext với roles
2. Permission-based UI rendering
3. Manager features (Pin, Task, Poll)
4. Director features (All Depts, Reports)
5. Admin features (Dashboard link)

### **Phase 4: Testing & Polish (1-2 ngày)**

1. Test all roles thoroughly
2. UI/UX improvements
3. Bug fixes

---

## 🎨 **DEMO SCENARIOS**

### **Scenario 1: Employee Login**

```
Login as: nguyen.van.a@company.com (Employee - Engineering)
→ Sees: Chats, Engineering Dept, Notifications, Profile
→ Can: Chat, send messages in Engineering, view notifications
→ Cannot: Pin messages, create tasks, access other depts
```

### **Scenario 2: Manager Login**

```
Login as: tran.thi.b@company.com (Manager - Engineering)
→ Sees: Same as Employee + Manager buttons
→ Can: Pin messages, create tasks, create dept announcements, view stats
→ Demo: Pin important message → Shows at top for everyone
→ Demo: Create task "Fix bug" → Assign to employee
```

### **Scenario 3: Director Login**

```
Login as: le.van.c@company.com (Director)
→ Sees: All tabs + "All Departments" filter
→ Can: View all departments (read-only), create company announcements
→ Demo: Switch to "All Depts" → See Engineering + Marketing
→ Demo: Create company announcement → Shows for everyone
```

### **Scenario 4: Admin on Dashboard**

```
Login to Web: admin@company.com
→ Dashboard: See 42 users, 5 depts, analytics charts
→ Demo: Create new user → Assign as Manager of Marketing
→ Demo: View audit logs → See all actions
→ Demo: Export user report
```

---

## 💡 **TẠI SAO NÊN THÊM?**

### **Về mặt kỹ thuật:**

- ✅ Showcase **full-stack skills** (Mobile + Web)
- ✅ Demonstrate **RBAC** (Role-Based Access Control)
- ✅ Complex **permission logic**
- ✅ **Real-world application** architecture

### **Về mặt demo/thuyết trình:**

- ✅ **Wow factor** cao (có cả web lẫn mobile)
- ✅ Dễ demo scenarios với 4 roles khác nhau
- ✅ Show được **business logic** phức tạp
- ✅ Practical cho doanh nghiệp thực tế

### **Điểm cộng cho đồ án:**

- 🌟 **Phạm vi rộng**: Mobile + Web + Backend
- 🌟 **Độ khó cao**: Permission system phức tạp
- 🌟 **Tính ứng dụng**: Giải quyết bài toán thực tế
- 🌟 **Scalable**: Dễ mở rộng thêm features

---

## ⏱️ **THỜI GIAN ƯỚC TÍNH**

- **Nếu làm full**: +7-10 ngày
- **Nếu làm MVP**: +5-7 ngày (bỏ analytics, logs)
- **Nếu chỉ thêm permissions trên mobile**: +2-3 ngày

---

## 🤔 **BẠN CÓ MUỐN TÔI CHI TIẾT HÓA?**

Nếu bạn pick ý tưởng này, tôi sẽ trình bày chi tiết:

**Option A**: Web Dashboard (React.js setup, UI design, CRUD operations)
**Option B**: Permission System (Firebase rules, middleware, role checks)
**Option C**: Manager Features (Pin, Task, Poll implementation)
**Option D**: Director Features (All-dept access, Reports)
**Option E**: Full Roadmap (Day-by-day breakdown như ngày 1-7)

Bạn muốn tôi detail phần nào trước? 🚀
