# 📅 **NGÀY 8: WEB DASHBOARD - QUẢN LÝ ADMIN**

---

## 🎯 Mục tiêu Ngày 8

- Tạo Web Dashboard cho Admin quản lý toàn bộ hệ thống
- User Management: CRUD users, assign roles, departments
- Department Management: Tạo/sửa/xóa departments, assign managers
- Analytics Dashboard: Thống kê hoạt động, báo cáo
- System Settings: Cấu hình hệ thống
- Tích hợp với Firebase Auth và Firestore hiện có

---

## 🏗️ **KIẾN TRÚC PROJECT**

### **Option 1: Expo Web (Recommended - Cùng Project)**

**Cấu trúc:**
```
MiniCorp Chat/
├── src/
│   ├── app/                    # Expo Router (nếu dùng)
│   │   ├── (mobile)/          # Mobile routes
│   │   └── (web)/             # Web routes
│   ├── web/                   # Web-specific components
│   │   ├── components/
│   │   ├── pages/
│   │   └── layouts/
│   └── ... (existing mobile code)
├── web.config.js              # Web-specific config
└── package.json               # Shared dependencies
```

**Ưu điểm:**
- ✅ Cùng project, shared Firebase config
- ✅ Shared services (userService, departmentService, etc.)
- ✅ Dễ deploy (Expo Web)
- ✅ Không cần setup riêng

**Nhược điểm:**
- ⚠️ Expo Web có giới hạn về UI libraries
- ⚠️ Cần adapt components cho web

### **Option 2: Separate Web Folder (Next.js/React)**

**Cấu trúc:**
```
MiniCorp Chat/
├── mobile/                    # Existing React Native app
├── web/                       # New Next.js/React app
│   ├── pages/
│   ├── components/
│   ├── services/             # Shared Firebase logic
│   └── package.json
└── shared/                    # Shared utilities
    └── firebase.config.js
```

**Ưu điểm:**
- ✅ Full control với React ecosystem
- ✅ Better SEO (nếu dùng Next.js)
- ✅ Richer UI libraries

**Nhược điểm:**
- ⚠️ Cần setup riêng
- ⚠️ Duplicate Firebase config
- ⚠️ Cần deploy riêng

**Recommendation: Dùng Option 1 (Expo Web) để đơn giản và nhanh**

---

## 📋 **TASK BREAKDOWN**

### **Task 8.1: Setup Web Environment (1h)**

**Mô tả:**
1. Cài đặt dependencies cho web
2. Setup routing cho web (Expo Router hoặc React Router)
3. Tạo layout cho web dashboard
4. Setup Firebase cho web (reuse existing config)

**Dependencies cần thêm:**
- `react-router-dom` (nếu không dùng Expo Router)
- `@mui/material` hoặc `antd` (UI library cho web)
- `recharts` hoặc `chart.js` (cho analytics charts)
- `react-table` hoặc `@tanstack/react-table` (cho data tables)

**Files cần tạo:**
- `src/web/App.js` - Web entry point
- `src/web/layouts/DashboardLayout.js` - Main layout với sidebar
- `src/web/pages/LoginPage.js` - Web login
- `src/web/pages/DashboardPage.js` - Dashboard home
- `web.config.js` - Web-specific config

---

### **Task 8.2: Authentication & Routing (1.5h)**

**Mô tả:**
1. Tạo web login page (reuse Firebase Auth)
2. Protected routes - chỉ Admin mới vào được
3. Auth context cho web
4. Redirect logic (nếu chưa login → login page)

**Features:**
- Login form với email/password
- Remember me option
- Logout functionality
- Session persistence
- Auto redirect nếu đã login

**Routes cần tạo:**
- `/login` - Login page
- `/dashboard` - Main dashboard (protected)
- `/dashboard/users` - User management (protected)
- `/dashboard/departments` - Department management (protected)
- `/dashboard/analytics` - Analytics (protected)
- `/dashboard/settings` - Settings (protected)

---

### **Task 8.3: User Management Page (3h)**

**Mô tả:**
Tạo trang quản lý users với đầy đủ CRUD operations.

**Features:**

1. **User List Table:**
   - Columns: Avatar, Name, Email, Department, Role, Status, Actions
   - Search bar (tìm theo name, email)
   - Filters: Department, Role, Status
   - Pagination
   - Sort by columns

2. **Create User:**
   - Modal/Form với fields:
     - Name (required)
     - Email (required, validate @minicorp.com)
     - Password (required, min 6 chars)
     - Department (dropdown)
     - Role (dropdown: employee, manager, director, admin)
     - Phone (optional)
   - Validation
   - Success/Error notifications

3. **Edit User:**
   - Click "Edit" → Open modal với pre-filled data
   - Có thể update: Name, Department, Role, Phone
   - Email không thể đổi (disabled)
   - Password có nút "Reset Password" riêng

4. **Delete User:**
   - Confirmation dialog
   - Soft delete (set status = "inactive") hoặc hard delete
   - Không cho xóa chính mình

5. **Bulk Actions:**
   - Select multiple users
   - Bulk assign department
   - Bulk assign role
   - Bulk deactivate

6. **User Details Modal:**
   - View full user info
   - Activity logs (last seen, last message, etc.)
   - Quick actions: Reset password, Deactivate, Edit

**UI Components cần:**
- DataTable component
- UserForm modal
- SearchBar component
- FilterDropdown component
- ConfirmationDialog component

---

### **Task 8.4: Department Management Page (2h)**

**Mô tả:**
Tạo trang quản lý departments.

**Features:**

1. **Department List:**
   - Cards hoặc Table hiển thị:
     - Icon, Name, Description
     - Member count
     - Manager name (nếu có)
     - Actions (Edit, Delete, View Members)

2. **Create Department:**
   - Form với fields:
     - ID (auto-generate hoặc manual)
     - Name (required)
     - Description
     - Icon (emoji picker hoặc icon selector)
     - Type (public, department)
     - Manager (dropdown users với role = manager)

3. **Edit Department:**
   - Update name, description, icon, manager
   - Không thể đổi ID

4. **Delete Department:**
   - Confirmation
   - Check xem có members không → Warning
   - Nếu có members → Không cho xóa hoặc force delete

5. **View Department Members:**
   - Modal/Page hiển thị danh sách members
   - Có thể add/remove members
   - Search members

6. **Assign Manager:**
   - Dropdown chọn user với role = manager
   - Một manager có thể quản lý nhiều departments
   - Update `managedDepartments` array trong user document

---

### **Task 8.5: Analytics Dashboard (2.5h)**

**Mô tả:**
Tạo trang analytics với charts và statistics.

**Features:**

1. **Overview Cards:**
   - Total Users (với breakdown: active/inactive)
   - Total Departments
   - Total Messages (today/week/month)
   - Active Users (online now)

2. **Charts:**
   - **User Activity Chart:**
     - Line chart: Messages per day (last 30 days)
     - Bar chart: Messages per department

   - **User Distribution:**
     - Pie chart: Users by department
     - Pie chart: Users by role

   - **Activity Heatmap:**
     - Heatmap: Activity by hour/day

   - **Department Activity:**
     - Bar chart: Messages per department
     - Line chart: Active users per department over time

3. **Tables:**
   - **Most Active Users:**
     - Top 10 users by message count
     - Columns: Name, Department, Messages, Last Active

   - **Department Stats:**
     - Table với: Name, Members, Messages, Active Users, Manager

4. **Filters:**
   - Date range picker (last 7 days, 30 days, custom)
   - Department filter
   - Export to CSV/PDF button

5. **Real-time Updates:**
   - Subscribe to Firestore để update charts real-time
   - Auto-refresh mỗi 30s hoặc manual refresh button

**Libraries cần:**
- `recharts` hoặc `chart.js` cho charts
- `date-fns` cho date formatting
- `react-datepicker` cho date range picker

---

### **Task 8.6: System Settings Page (1.5h)**

**Mô tả:**
Tạo trang settings để cấu hình hệ thống.

**Features:**

1. **General Settings:**
   - Company name
   - Company logo upload
   - Default department (cho new users)
   - Email domain whitelist (@minicorp.com)

2. **Feature Toggles:**
   - Enable/Disable features:
     - Tasks feature
     - Polls feature
     - Pinned messages
     - Department chats
   - Toggle switches

3. **Security Settings:**
   - Password policy (min length, complexity)
   - Session timeout
   - Enable 2FA (future)

4. **Notifications:**
   - Email notifications settings
   - Push notification settings

5. **Data Management:**
   - Export all data (CSV/JSON)
   - Backup database
   - Clear old messages (older than X days)

**Storage:**
- Lưu settings trong Firestore collection `settings`
- Chỉ Admin có quyền edit

---

### **Task 8.7: Integration với Mobile App (1h)**

**Mô tả:**
Tích hợp link từ mobile app đến web dashboard.

**Features:**

1. **Profile Screen Update:**
   - Thêm button "Open Web Dashboard" (chỉ Admin)
   - Link đến web URL (có thể là localhost:8081/web hoặc deployed URL)

2. **Deep Linking:**
   - Nếu user click link từ mobile → Open in browser
   - Auto login nếu đã có session
   - Hoặc redirect đến login page

3. **QR Code (Optional):**
   - Generate QR code cho dashboard URL
   - Admin scan để mở nhanh trên desktop

**Implementation:**
- Dùng `Linking` API từ React Native
- Hoặc `expo-linking` nếu dùng Expo
- Web URL có thể config trong `firebase.config.js` hoặc env

---

### **Task 8.8: Responsive Design & Polish (2h)**

**Mô tả:**
Đảm bảo web dashboard responsive và có UI/UX tốt.

**Features:**

1. **Responsive:**
   - Mobile-friendly (tablet, phone)
   - Sidebar collapse trên mobile
   - Tables scroll horizontal trên mobile
   - Charts responsive

2. **UI/UX:**
   - Loading states cho mọi async operations
   - Error handling với user-friendly messages
   - Success notifications
   - Confirmation dialogs cho destructive actions
   - Empty states
   - Skeleton loaders

3. **Accessibility:**
   - Keyboard navigation
   - Screen reader support
   - ARIA labels
   - Color contrast

4. **Performance:**
   - Lazy loading cho routes
   - Virtual scrolling cho large tables
   - Memoization cho expensive computations
   - Debounce cho search inputs

---

## 🎨 **UI/UX DESIGN**

### **Color Scheme:**
- Primary: #007AFF (giống mobile app)
- Secondary: #5856D6
- Success: #4CD964
- Warning: #FF9500
- Danger: #FF3B30
- Background: #f5f5f5
- Text: #333

### **Layout:**
```
┌─────────────────────────────────────────────┐
│  Header: Logo | User Info | Logout         │
├──────────┬──────────────────────────────────┤
│          │                                  │
│ Sidebar  │  Main Content Area              │
│          │                                  │
│ - Users  │  [Dashboard Content]             │
│ - Depts  │                                  │
│ - Analytics│                                │
│ - Settings│                                 │
│          │                                  │
└──────────┴──────────────────────────────────┘
```

### **Components Style:**
- Modern, clean design
- Card-based layout
- Consistent spacing
- Smooth animations
- Professional look

---

## 🔐 **SECURITY CONSIDERATIONS**

1. **Authentication:**
   - Chỉ Admin mới vào được dashboard
   - Check role trong Firestore Security Rules
   - Session management
   - Auto logout sau X phút inactive

2. **Authorization:**
   - Firestore Rules: Chỉ Admin mới read/write settings
   - Validate permissions trên client và server
   - Rate limiting cho API calls

3. **Data Protection:**
   - Không expose sensitive data
   - Sanitize user inputs
   - Validate all forms
   - CSRF protection

---

## 📦 **DEPENDENCIES CẦN THÊM**

```json
{
  "dependencies": {
    "react-router-dom": "^6.x",
    "@mui/material": "^5.x",
    "@mui/icons-material": "^5.x",
    "recharts": "^2.x",
    "@tanstack/react-table": "^8.x",
    "date-fns": "^2.x",
    "react-datepicker": "^4.x"
  }
}
```

---

## 🚀 **DEPLOYMENT**

### **Option 1: Expo Web**
```bash
npx expo start --web
# Deploy to: Vercel, Netlify, hoặc Firebase Hosting
```

### **Option 2: Build Standalone**
```bash
npm run build:web
# Output: web-build/
# Deploy to static hosting
```

### **Environment Variables:**
- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_WEB_DASHBOARD_URL`

---

## ✅ **CHECKLIST**

### **Setup:**
- [ ] Install web dependencies
- [ ] Setup routing
- [ ] Create layout components
- [ ] Setup Firebase for web

### **Authentication:**
- [ ] Login page
- [ ] Protected routes
- [ ] Auth context
- [ ] Session management

### **User Management:**
- [ ] User list table
- [ ] Create user form
- [ ] Edit user modal
- [ ] Delete user
- [ ] Search & filters
- [ ] Bulk actions

### **Department Management:**
- [ ] Department list
- [ ] Create department
- [ ] Edit department
- [ ] Delete department
- [ ] Assign manager
- [ ] View members

### **Analytics:**
- [ ] Overview cards
- [ ] Activity charts
- [ ] User distribution charts
- [ ] Department stats
- [ ] Export functionality

### **Settings:**
- [ ] General settings
- [ ] Feature toggles
- [ ] Security settings
- [ ] Data management

### **Integration:**
- [ ] Mobile app link
- [ ] Deep linking
- [ ] Auto login

### **Polish:**
- [ ] Responsive design
- [ ] Loading states
- [ ] Error handling
- [ ] Empty states
- [ ] Performance optimization

---

## 📝 **NOTES**

1. **Shared Services:**
   - Reuse existing services từ `src/services/`
   - Có thể cần adapt một chút cho web (ví dụ: không dùng AsyncStorage)

2. **Firebase Config:**
   - Reuse `firebase.config.js`
   - Import vào web app

3. **State Management:**
   - Có thể dùng React Context (giống mobile)
   - Hoặc Redux/Zustand nếu cần

4. **Testing:**
   - Test với nhiều users
   - Test permissions
   - Test responsive trên nhiều devices

5. **Future Enhancements:**
   - Real-time notifications
   - Advanced analytics
   - Export reports (PDF)
   - Audit logs
   - 2FA support

---

## 🎯 **ESTIMATED TIME**

- **Task 8.1:** 1h
- **Task 8.2:** 1.5h
- **Task 8.3:** 3h
- **Task 8.4:** 2h
- **Task 8.5:** 2.5h
- **Task 8.6:** 1.5h
- **Task 8.7:** 1h
- **Task 8.8:** 2h

**Total: ~14.5 hours (2 ngày làm việc)**

---

## 🔗 **RESOURCES**

- Expo Web Docs: https://docs.expo.dev/workflow/web/
- Firebase Web Setup: https://firebase.google.com/docs/web/setup
- Material-UI: https://mui.com/
- Recharts: https://recharts.org/
- React Table: https://tanstack.com/table

---

**Lưu ý:** File này chỉ mô tả chi tiết các task và features, không có code snippets để tránh API cut-off. Khi implement, sẽ tạo code theo từng task.

