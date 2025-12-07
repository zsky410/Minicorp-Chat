# 📅 **NGÀY 7: HỆ THỐNG PHÂN QUYỀN & TÍNH NĂNG NÂNG CAO**

---

## 🎯 Mục tiêu Ngày 7

- Implement hệ thống phân quyền 4 cấp (Employee, Manager, Director, Admin)
- Thêm tính năng Manager: Pin messages, Create Tasks, Create Polls
- Thêm tính năng Director: Access all departments, Company announcements, Reports
- Cập nhật UI theo role-based permissions
- Web Dashboard (optional - có thể làm sau)

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
- ✅ **Access tất cả phòng ban** (read-only hoặc có tag [Director])
- ✅ **Tạo thông báo toàn công ty**
- ✅ **Xem dashboard analytics** (tổng quan công ty)
- ✅ **Export reports** (hoạt động, thống kê)
- ❌ Không quản lý user (add/remove)

### **4. Admin (Quản trị viên)**

**Quyền hạn:**

- ✅ **Full access** tất cả tính năng
- ✅ **Tạo thông báo** cho bất kỳ phòng ban nào
- ✅ **Pin messages** ở bất kỳ phòng ban nào
- ✅ **Tạo tasks** cho bất kỳ phòng ban nào
- ✅ **Access tất cả departments**
- ✅ Button "Open Web Dashboard" trong Profile (link đến web dashboard nếu có)

---

## **Task 7.1: Update User Schema & Permission Service (1.5h)**

**Mô tả:**

1. **Update Firestore Schema:**

   - Thêm field `role` vào users collection: "employee" | "manager" | "director" | "admin"
   - Thêm field `managedDepartments: []` cho Manager (danh sách phòng ban họ quản lý)
   - Thêm field `permissions: {}` để cache permissions (optional, có thể tính toán từ role)

2. **Tạo Permission Service:**

   - `src/services/permissionService.js`
   - Functions:
     - `getUserPermissions(user)`: Trả về object permissions dựa trên role
     - `canCreateAnnouncement(user, departmentId)`: Check quyền tạo thông báo
     - `canPinMessage(user, departmentId)`: Check quyền pin message
     - `canCreateTask(user, departmentId)`: Check quyền tạo task
     - `canViewAllDepartments(user)`: Check quyền xem tất cả phòng ban
     - `canCreateCompanyAnnouncement(user)`: Check quyền tạo thông báo toàn công ty
     - `isManagerOfDepartment(user, departmentId)`: Check user có phải manager của dept không

3. **Update AuthContext:**
   - Thêm `permissions` vào user object
   - Auto-calculate permissions khi user login/refresh

**Logic Permissions:**

- Employee: Tất cả false, chỉ có quyền cơ bản
- Manager: `canCreateDeptAnnouncement`, `canPinMessages`, `canCreateTasks` = true (chỉ cho dept của mình)
- Director: Tất cả true, `canViewAllDepts` = true, `canCreateCompanyAnnouncement` = true
- Admin: Tất cả true

---

## **Task 7.2: Update Departments Screen - Role-based UI (1h)**

**Mô tả:**

1. **Filter theo Role:**

   - Employee: Chỉ hiển thị phòng ban của mình
   - Manager: Hiển thị phòng ban của mình (có badge "Manager")
   - Director: Có toggle "My Dept" / "All Depts"
   - Admin: Hiển thị tất cả phòng ban

2. **UI Changes:**

   - Thêm badge "Manager" trên DepartmentCard nếu user là manager
   - Thêm filter button cho Director (My Dept / All Depts)
   - Disable hoặc hide "Join" button nếu không có quyền

3. **DepartmentChatScreen Header:**
   - Hiển thị badge [Director] nếu user là Director và đang xem dept khác
   - Hiển thị "Read-only" nếu Director xem dept khác

---

## **Task 7.3: Pin Messages Feature (2h)**

**Mô tả:**

1. **Database Schema:**

   - Tạo collection `pinned_messages` với fields:
     - `departmentId`: ID phòng ban
     - `messageId`: ID của message được pin
     - `messageText`: Text của message (để hiển thị nhanh)
     - `senderName`: Tên người gửi
     - `pinnedBy`: User ID người pin
     - `pinnedAt`: Timestamp

2. **UI Changes:**

   - **Long press message** trong DepartmentChatScreen → Show action sheet:
     - "Pin" (chỉ Manager/Admin của dept đó)
     - "Copy"
     - "Delete" (nếu là message của mình)
   - **Pinned Messages Section** ở top của DepartmentChatScreen:
     - Hiển thị tối đa 3-5 pinned messages
     - Có icon pin
     - Tap để scroll đến message đó
     - Swipe để unpin (nếu có quyền)

3. **Service Functions:**

   - `pinMessage(departmentId, messageId, messageData)`: Pin message
   - `unpinMessage(pinId)`: Unpin message
   - `getPinnedMessages(departmentId)`: Lấy danh sách pinned
   - `subscribeToPinnedMessages(departmentId, callback)`: Realtime listener

4. **Permission Check:**
   - Chỉ Manager của dept đó hoặc Admin mới pin được
   - Validate trong service trước khi pin

---

## **Task 7.4: Task Management Feature (2.5h)**

**Mô tả:**

1. **Database Schema:**

   - Tạo collection `tasks` với fields:
     - `departmentId`: ID phòng ban
     - `title`: Tiêu đề task
     - `description`: Mô tả chi tiết
     - `assignedTo`: User ID người được assign
     - `assignedByName`: Tên người assign
     - `assignedBy`: User ID (Manager)
     - `dueDate`: Timestamp ngày hết hạn
     - `priority`: "low" | "medium" | "high"
     - `status`: "pending" | "in-progress" | "completed"
     - `createdAt`: Timestamp

2. **UI Components:**

   - **Create Task Modal:**
     - Form với: Title, Description, Assign to (dropdown users trong dept), Due date (date picker), Priority (radio buttons)
     - Validation: Title required, Assign to required
   - **Task List Screen:**
     - Tab "My Tasks" (tasks được assign cho mình)
     - Tab "All Tasks" (tất cả tasks trong dept - chỉ Manager/Director/Admin)
     - Filter: Pending / In Progress / Completed
     - Task Card hiển thị: Title, Assignee, Due date, Priority badge, Status
   - **Task Detail Screen:**
     - Hiển thị đầy đủ thông tin
     - Button "Mark as In Progress" / "Mark as Completed" (nếu là assignee)
     - Button "Edit" / "Delete" (nếu là Manager/Admin)

3. **Service Functions:**

   - `createTask(departmentId, taskData)`: Tạo task
   - `getTasks(departmentId, filters)`: Lấy tasks
   - `getMyTasks(userId)`: Lấy tasks của user
   - `updateTaskStatus(taskId, status)`: Update status
   - `deleteTask(taskId)`: Xóa task
   - `subscribeToTasks(departmentId, callback)`: Realtime listener

4. **UI Integration:**
   - FAB trong DepartmentChatScreen (chỉ Manager/Admin) → "Create Task"
   - Tab mới "Tasks" trong DepartmentChatScreen hoặc separate screen
   - Badge số tasks pending trên tab

---

## **Task 7.5: Poll/Vote Feature (2h)**

**Mô tả:**

1. **Database Schema:**

   - Tạo collection `polls` với fields:
     - `departmentId`: ID phòng ban
     - `question`: Câu hỏi
     - `options`: Array of { id, text, votes: [userId] }
     - `createdBy`: User ID
     - `createdByName`: Tên người tạo
     - `createdAt`: Timestamp
     - `expiresAt`: Timestamp (optional)

2. **UI Components:**

   - **Create Poll Modal:**
     - Input: Question
     - Dynamic options (tối thiểu 2, tối đa 5-6)
     - Button "Add Option"
     - Optional: Expiry date
   - **Poll Card trong Chat:**
     - Hiển thị như một message đặc biệt
     - Show question và các options với progress bar
     - Tap option để vote
     - Show "You voted for X" nếu đã vote
     - Show số votes cho mỗi option
   - **Poll Results:**
     - Real-time update khi có vote mới
     - Progress bar hoặc percentage

3. **Service Functions:**

   - `createPoll(departmentId, pollData)`: Tạo poll
   - `votePoll(pollId, optionId, userId)`: Vote
   - `getPolls(departmentId)`: Lấy polls
   - `subscribeToPolls(departmentId, callback)`: Realtime listener

4. **UI Integration:**
   - FAB trong DepartmentChatScreen → "Create Poll"
   - Polls hiển thị trong chat như messages đặc biệt
   - Có thể filter để chỉ xem polls

---

## **Task 7.6: Department Stats Screen (1.5h)**

**Mô tả:**

1. **Stats Data:**

   - Active users hôm nay (ai đã gửi tin nhắn)
   - Số tin nhắn trong tuần
   - Tasks: Total, Pending, Completed
   - Pinned messages count
   - Most active users (top 5)

2. **UI Screen:**

   - Tab "Stats" trong DepartmentChatScreen hoặc separate screen
   - Cards hiển thị các metrics
   - List active users với avatar
   - Simple charts (có thể dùng thư viện hoặc custom)

3. **Service Functions:**

   - `getDepartmentStats(departmentId, timeRange)`: Tính toán stats
   - Cache stats và update định kỳ

4. **Permission:**
   - Chỉ Manager/Director/Admin của dept mới xem được

---

## **Task 7.7: Director Features - All Departments Access (1.5h)**

**Mô tả:**

1. **Departments Screen:**

   - Thêm toggle "My Dept" / "All Depts" cho Director
   - Khi chọn "All Depts":
     - Hiển thị tất cả departments
     - Badge [Director] trên mỗi dept
     - Có thể tap để xem (read-only hoặc có tag)

2. **DepartmentChatScreen:**

   - Nếu Director xem dept khác:
     - Badge [Director] trên header
     - MessageInput có thể disabled hoặc có tag "Director"
     - Hiển thị warning "You are viewing as Director"

3. **Permission Check:**
   - Validate trong service khi Director cố gắng send message vào dept khác
   - Có thể cho phép nhưng tag message là [Director]

---

## **Task 7.8: Company-wide Announcements (1h)**

**Mô tả:**

1. **Update Announcement Service:**

   - Thêm field `scope`: "department" | "company"
   - Nếu `scope = "company"` → `targetDepartments = []` (tất cả)

2. **UI Changes:**

   - **CreateAnnouncementScreen:**
     - Radio buttons: "Department" / "Company-wide"
     - Nếu chọn "Company-wide" → Disable department selector
     - Chỉ Director/Admin mới thấy option này

3. **NotificationsScreen:**
   - Badge "Company" trên company-wide announcements
   - Filter: "All" / "My Dept" / "Company"

---

## **Task 7.9: Reports Feature (Director) (2h)**

**Mô tả:**

1. **Reports Screen:**

   - Tab mới "Reports" trong MainNavigator (chỉ Director/Admin)
   - List các loại reports:
     - Active Users Report
     - Department Performance
     - Message Volume
     - Task Completion Rate

2. **Report Generation:**

   - Chọn report type
   - Chọn time range (Last week, Last month, Custom)
   - Button "Generate Report"
   - Hiển thị data dạng table hoặc charts
   - Button "Export" (export JSON hoặc CSV)

3. **Service Functions:**

   - `generateReport(reportType, timeRange)`: Tính toán và trả về data
   - `exportReport(data, format)`: Export file

4. **UI:**
   - Simple table view
   - Có thể dùng thư viện chart nếu muốn

---

## **Task 7.10: Update Existing Screens với Permissions (1h)**

**Mô tả:**

1. **NotificationsScreen:**

   - FAB "Create Announcement" chỉ hiện nếu có quyền
   - Check permission trước khi navigate

2. **DepartmentChatScreen:**

   - Hide/show FABs dựa trên permissions
   - Long press menu chỉ hiện options có quyền
   - Disable inputs nếu không có quyền

3. **ProfileScreen:**

   - Thêm badge role (Employee/Manager/Director/Admin)
   - Button "Open Web Dashboard" (chỉ Admin, link đến web nếu có)

4. **HomeScreen:**
   - Không thay đổi (mọi người đều có quyền chat 1-1)

---

## **Task 7.11: Update Firestore Security Rules (30 phút)**

**Mô tả:**

1. **Update Rules cho:**

   - `pinned_messages`: Chỉ Manager/Admin của dept mới create/delete
   - `tasks`: Manager/Admin create, assignee update status
   - `polls`: Manager/Admin create, mọi người vote
   - `announcements`: Director/Admin tạo company-wide

2. **Validation:**
   - Check role trong rules
   - Check `managedDepartments` cho Manager

---

## **Task 7.12: Testing & Polish (1h)**

**Mô tả:**

1. **Test Scenarios:**

   - Login với từng role và test permissions
   - Test Manager pin message → hiển thị cho tất cả
   - Test Manager create task → assignee nhận được
   - Test Director xem all depts
   - Test Director tạo company announcement
   - Test Admin full access

2. **UI Polish:**

   - Badges, icons cho roles
   - Disable states rõ ràng
   - Error messages khi không có quyền

3. **Bug Fixes:**
   - Fix mọi bugs phát hiện

---

## ✅ **NGÀY 7 CHECKLIST**

- [ ] Permission Service với đầy đủ functions
- [ ] Update user schema với role và managedDepartments
- [ ] Update AuthContext với permissions
- [ ] Departments Screen với role-based UI
- [ ] Pin Messages feature hoàn chỉnh
- [ ] Task Management feature (create, list, update, delete)
- [ ] Poll/Vote feature
- [ ] Department Stats screen
- [ ] Director: All departments access
- [ ] Company-wide announcements
- [ ] Reports feature (Director)
- [ ] Update tất cả screens với permission checks
- [ ] Update Firestore Security Rules
- [ ] Test tất cả roles và permissions
- [ ] UI polish và bug fixes

**Kết quả cuối ngày**: App có hệ thống phân quyền hoàn chỉnh với 4 roles, Manager có đầy đủ tính năng quản lý, Director có thể xem toàn công ty và tạo reports, Admin có full access!

---

## 📝 **LƯU Ý QUAN TRỌNG**

1. **Bảo toàn logic cũ:**

   - User schema: email, phone, name, department, role (KHÔNG có position)
   - Email và department do admin quản lý
   - Avatar upload dùng Base64 trong Firestore

2. **Role Assignment:**

   - Hiện tại chỉ có "admin" và "member" trong code
   - Cần update để support: "employee", "manager", "director", "admin"
   - "member" có thể map thành "employee"

3. **Backward Compatibility:**

   - Users cũ không có role → default là "employee"
   - Check `user.role || "employee"` ở mọi nơi

4. **Web Dashboard:**
   - Có thể làm sau, không bắt buộc cho Day 7
   - Nếu làm, tạo project React.js riêng, share Firebase config

---

## 🎨 **DEMO SCENARIOS**

### **Scenario 1: Employee Login**

- Login → Chỉ thấy dept của mình
- Không có FABs tạo task/poll
- Long press message → Không có option "Pin"
- Tạo announcement → Không có button

### **Scenario 2: Manager Login**

- Login → Thấy dept của mình với badge "Manager"
- Có FABs: Create Task, Create Poll
- Long press message → Có "Pin"
- Pin message → Hiển thị ở top cho tất cả
- Tạo task → Assign cho employee
- Xem Stats tab

### **Scenario 3: Director Login**

- Login → Toggle "All Depts" → Thấy tất cả
- Vào dept khác → Badge [Director], có thể xem
- Tạo announcement → Có option "Company-wide"
- Tab Reports → Generate reports

### **Scenario 4: Admin Login**

- Login → Full access tất cả
- Có thể pin message ở bất kỳ dept nào
- Có thể tạo task ở bất kỳ dept nào
- Profile → Button "Open Web Dashboard"

---

**Tổng thời gian ước tính: 15-18 giờ**

**Priority:**

- **Must have**: Task 7.1, 7.2, 7.3, 7.4, 7.10 (Permissions + Pin + Tasks)
- **Should have**: Task 7.5, 7.7, 7.8 (Polls + Director features)
- **Nice to have**: Task 7.6, 7.9 (Stats + Reports)
