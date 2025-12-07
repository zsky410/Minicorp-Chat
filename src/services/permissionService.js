/**
 * Permission Service
 * Tính toán và check permissions dựa trên user role
 * Theo thiết kế mới: Admin chỉ có trên web, không có trong app
 */

/**
 * Get user permissions object based on role
 * @param {Object} user - User object with role, department
 * @returns {Object} Permissions object
 */
export const getUserPermissions = (user) => {
  if (!user) {
    return getDefaultPermissions();
  }

  const role = user.role || "employee"; // Default to employee if no role

  switch (role) {
    case "director":
      return {
        canCreateDeptAnnouncement: false, // Director không tạo thông báo phòng ban
        canCreateCompanyAnnouncement: true, // Chỉ tạo thông báo công ty (general)
        canPinMessages: false, // Director không thể pin
        canCreatePolls: false, // Director không thể tạo polls
        canViewAllDepartments: true, // Director xem tất cả phòng ban (read-only)
        canChatInDepartment: false, // Director không thể chat trong phòng ban (chỉ xem)
        canViewDeptAnnouncements: false, // Director không xem thông báo phòng ban
        canViewCompanyAnnouncements: true, // Director xem thông báo công ty
      };

    case "manager":
      return {
        canCreateDeptAnnouncement: true, // Manager tạo thông báo phòng ban mình
        canCreateCompanyAnnouncement: false, // Manager không tạo thông báo công ty
        canPinMessages: true, // Manager có thể pin (chỉ phòng ban mình)
        canCreatePolls: true, // Manager có thể tạo polls (chỉ phòng ban mình)
        canViewAllDepartments: false, // Manager chỉ thấy phòng ban mình
        canChatInDepartment: true, // Manager có thể chat trong phòng ban mình
        canViewDeptAnnouncements: true, // Manager xem thông báo phòng ban
        canViewCompanyAnnouncements: true, // Manager xem thông báo công ty
      };

    case "employee":
    case "member": // Backward compatibility
    default:
      return getDefaultPermissions();
  }
};

/**
 * Default permissions (Employee)
 */
const getDefaultPermissions = () => {
  return {
    canCreateDeptAnnouncement: false,
    canCreateCompanyAnnouncement: false,
    canPinMessages: false,
    canCreatePolls: false,
    canViewAllDepartments: false,
    canChatInDepartment: true, // Employee có thể chat trong phòng ban mình
    canViewDeptAnnouncements: true, // Employee xem thông báo phòng ban
    canViewCompanyAnnouncements: true, // Employee xem thông báo công ty
  };
};

/**
 * Check if user can create announcement for a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID (null for company-wide "general")
 * @returns {boolean}
 */
export const canCreateAnnouncement = (user, departmentId = null) => {
  if (!user) return false;

  const permissions = getUserPermissions(user);

  // Company-wide announcement (chỉ trong "general")
  if (!departmentId || departmentId === "general") {
    // Chỉ Director mới có thể tạo thông báo công ty
    return permissions.canCreateCompanyAnnouncement && user.role === "director";
  }

  // Department announcement - chỉ Manager của phòng ban đó
  if (permissions.canCreateDeptAnnouncement && user.role === "manager") {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can pin message in a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const canPinMessage = (user, departmentId) => {
  if (!user || !departmentId) return false;

  const permissions = getUserPermissions(user);

  // Chỉ Manager mới có thể pin, và chỉ trong phòng ban mình quản lý
  if (user.role === "manager" && permissions.canPinMessages) {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can create poll in a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const canCreatePoll = (user, departmentId) => {
  if (!user || !departmentId) return false;

  const permissions = getUserPermissions(user);

  // Chỉ Manager mới có thể tạo polls, và chỉ trong phòng ban mình quản lý
  // Director KHÔNG thể tạo polls theo thiết kế mới
  if (user.role === "manager" && permissions.canCreatePolls) {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can view all departments
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewAllDepartments = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  return permissions.canViewAllDepartments && user.role === "director";
};

/**
 * Check if user can create company-wide announcement
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canCreateCompanyAnnouncement = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  return permissions.canCreateCompanyAnnouncement && user.role === "director";
};

/**
 * Check if user can chat in a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const canChatInDepartment = (user, departmentId) => {
  if (!user || !departmentId) return false;

  // Director không thể chat trong phòng ban (chỉ xem read-only)
  if (user.role === "director") {
    return false;
  }

  // Employee và Manager có thể chat trong phòng ban mình
  if (user.department === departmentId) {
    return true;
  }

  // Manager có thể chat trong phòng ban mình quản lý (nếu khác department)
  if (user.role === "manager") {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can view department announcements
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewDeptAnnouncements = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  // Director không xem thông báo phòng ban
  return permissions.canViewDeptAnnouncements;
};

/**
 * Check if user can view company announcements
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canViewCompanyAnnouncements = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  return permissions.canViewCompanyAnnouncements;
};

/**
 * Check if user is manager of a specific department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const isManagerOfDepartment = (user, departmentId) => {
  if (!user || !departmentId) return false;

  // Chỉ Manager mới có thể là manager của department
  if (user.role !== "manager") return false;

  // Check nếu user's department matches (Manager chỉ quản lý 1 phòng ban)
  if (user.department === departmentId) {
    return true;
  }

  // Backward compatibility: check managedDepartments (nếu có)
  if (user.managedDepartments && Array.isArray(user.managedDepartments)) {
    return user.managedDepartments.includes(departmentId);
  }

  return false;
};

/**
 * Check if user can view stats for a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const canViewStats = (user, departmentId) => {
  if (!user || !departmentId) return false;

  // Director có thể xem stats tất cả phòng ban
  if (user.role === "director") return true;

  // Manager chỉ xem stats phòng ban mình quản lý
  if (user.role === "manager") {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Get role display name
 * @param {string} role - Role string
 * @returns {string} Display name
 */
export const getRoleDisplayName = (role) => {
  const roleMap = {
    employee: "Nhân viên",
    member: "Nhân viên", // Backward compatibility
    manager: "Quản lý",
    director: "Giám đốc",
    // Admin không có trong app, chỉ có trên web
  };

  return roleMap[role] || "Nhân viên";
};

/**
 * Get role badge color
 * @param {string} role - Role string
 * @returns {string} Color code
 */
export const getRoleBadgeColor = (role) => {
  const colorMap = {
    employee: "#8E8E93", // Xám
    member: "#8E8E93", // Backward compatibility
    manager: "#007AFF", // Xanh
    director: "#5856D6", // Tím
  };

  return colorMap[role] || "#8E8E93";
};
