/**
 * Permission Service
 * Tính toán và check permissions dựa trên user role
 */

/**
 * Get user permissions object based on role
 * @param {Object} user - User object with role, department, managedDepartments
 * @returns {Object} Permissions object
 */
export const getUserPermissions = (user) => {
  if (!user) {
    return getDefaultPermissions();
  }

  const role = user.role || "employee"; // Default to employee if no role

  switch (role) {
    case "admin":
      return {
        canCreateDeptAnnouncement: true,
        canCreateCompanyAnnouncement: true,
        canPinMessages: true,
        canCreateTasks: true,
        canCreatePolls: true,
        canViewAllDepartments: true,
        canManageUsers: true,
        canAccessDashboard: true,
        canViewStats: true,
        canExportReports: true,
      };

    case "director":
      return {
        canCreateDeptAnnouncement: true,
        canCreateCompanyAnnouncement: true,
        canPinMessages: true,
        canCreateTasks: true,
        canCreatePolls: true,
        canViewAllDepartments: true,
        canManageUsers: false,
        canAccessDashboard: false,
        canViewStats: true,
        canExportReports: true,
      };

    case "manager":
      return {
        canCreateDeptAnnouncement: true,
        canCreateCompanyAnnouncement: false,
        canPinMessages: true,
        canCreateTasks: true,
        canCreatePolls: true,
        canViewAllDepartments: false,
        canManageUsers: false,
        canAccessDashboard: false,
        canViewStats: true,
        canExportReports: false,
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
    canCreateTasks: false,
    canCreatePolls: false,
    canViewAllDepartments: false,
    canManageUsers: false,
    canAccessDashboard: false,
    canViewStats: false,
    canExportReports: false,
  };
};

/**
 * Check if user can create announcement for a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID (optional, for company-wide)
 * @returns {boolean}
 */
export const canCreateAnnouncement = (user, departmentId = null) => {
  if (!user) return false;

  const permissions = getUserPermissions(user);

  // Company-wide announcement
  if (!departmentId) {
    return (
      permissions.canCreateCompanyAnnouncement ||
      user.role === "admin" ||
      user.role === "director"
    );
  }

  // Department announcement
  return (
    permissions.canCreateDeptAnnouncement ||
    user.role === "admin" ||
    user.role === "director" ||
    isManagerOfDepartment(user, departmentId)
  );
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

  // Admin can pin anywhere
  if (user.role === "admin") return true;

  // Director can pin anywhere
  if (user.role === "director") return true;

  // Manager can pin in their managed departments
  if (permissions.canPinMessages) {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can create task in a department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const canCreateTask = (user, departmentId) => {
  if (!user || !departmentId) return false;

  const permissions = getUserPermissions(user);

  // Admin can create task anywhere
  if (user.role === "admin") return true;

  // Director can create task anywhere
  if (user.role === "director") return true;

  // Manager can create task in their managed departments
  if (permissions.canCreateTasks) {
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

  // Admin can create poll anywhere
  if (user.role === "admin") return true;

  // Director can create poll anywhere
  if (user.role === "director") return true;

  // Manager can create poll in their managed departments
  if (permissions.canCreatePolls) {
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
  return permissions.canViewAllDepartments;
};

/**
 * Check if user can create company-wide announcement
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canCreateCompanyAnnouncement = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  return permissions.canCreateCompanyAnnouncement;
};

/**
 * Check if user is manager of a specific department
 * @param {Object} user - User object
 * @param {string} departmentId - Department ID
 * @returns {boolean}
 */
export const isManagerOfDepartment = (user, departmentId) => {
  if (!user || !departmentId) return false;

  // Admin is manager of all departments
  if (user.role === "admin") return true;

  // Director is manager of all departments
  if (user.role === "director") return true;

  // Check if user is manager and department is in managedDepartments
  if (user.role === "manager" && user.managedDepartments) {
    return user.managedDepartments.includes(departmentId);
  }

  // Also check if user's department matches (for backward compatibility)
  if (user.role === "manager" && user.department) {
    return user.department === departmentId;
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

  const permissions = getUserPermissions(user);

  // Admin can view all stats
  if (user.role === "admin") return true;

  // Director can view all stats
  if (user.role === "director") return true;

  // Manager can view stats of their departments
  if (permissions.canViewStats) {
    return isManagerOfDepartment(user, departmentId);
  }

  return false;
};

/**
 * Check if user can export reports
 * @param {Object} user - User object
 * @returns {boolean}
 */
export const canExportReports = (user) => {
  if (!user) return false;
  const permissions = getUserPermissions(user);
  return permissions.canExportReports;
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
    admin: "Quản trị viên",
  };

  return roleMap[role] || "Nhân viên";
};

