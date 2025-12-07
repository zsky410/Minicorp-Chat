"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  IconButton,
  Avatar,
  Chip,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from "@mui/icons-material";
import { getAllUsers, createUser, updateUser, deleteUser, User } from "@/lib/services/userService";
import { getAllDepartments } from "@/lib/services/departmentService";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<string>("all");
  const [filterDept, setFilterDept] = useState<string>("all");
  const [openDialog, setOpenDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
    role: "employee" as "employee" | "manager" | "director" | "admin",
    phone: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadUsers();
    // Load departments ngay từ đầu
    loadDepartments();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, filterRole, filterDept]);

  const loadDepartments = async () => {
    try {
      const deptResult = await getAllDepartments();
      if (deptResult.success && deptResult.data) {
        setDepartments(deptResult.data);
      }
    } catch (error) {
      console.error("Error loading departments:", error);
    }
  };

  const loadUsers = async () => {
    setLoading(true);
    try {
      const result = await getAllUsers();

      if (result.success && result.data) {
        setUsers(result.data);
        setFilteredUsers(result.data);
      } else {
        setError(result.error || "Không thể tải danh sách users");
      }
    } catch (error) {
      console.error("Error in loadUsers:", error);
      setError("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Role filter
    if (filterRole !== "all") {
      filtered = filtered.filter((user) => user.role === filterRole);
    }

    // Department filter
    if (filterDept !== "all") {
      filtered = filtered.filter((user) => user.department === filterDept);
    }

    setFilteredUsers(filtered);
  };

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      // Map user.department (có thể là tên hoặc id) với department.id
      let departmentId = user.department || "";
      if (departmentId && departments.length > 0) {
        // Nếu user.department là tên, tìm id tương ứng
        const dept = departments.find(
          (d) => d.id === departmentId || d.name === departmentId || d.id.toLowerCase() === departmentId.toLowerCase()
        );
        if (dept) {
          departmentId = dept.id;
        } else {
          // Nếu không tìm thấy, để rỗng để user chọn lại
          departmentId = "";
        }
      }

      // Map "member" thành "employee" (backward compatibility)
      let userRole = user.role || "employee";
      if (userRole === "member") {
        userRole = "employee";
      }

      setFormData({
        name: user.name || "",
        email: user.email || "",
        password: "",
        department: userRole === "director" ? "" : departmentId, // Director không có department
        role: userRole as "employee" | "manager" | "director" | "admin",
        phone: user.phone || "",
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: "",
        email: "",
        password: "",
        department: "",
        role: "employee",
        phone: "",
      });
    }
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingUser(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.email) {
      setError("Vui lòng điền đầy đủ thông tin");
      return;
    }

    // Director không cần phòng ban, các role khác bắt buộc
    if (formData.role !== "director" && !formData.department) {
      setError("Vui lòng chọn phòng ban");
      return;
    }

    if (!editingUser && !formData.password) {
      setError("Vui lòng nhập mật khẩu");
      return;
    }

    // Validation: Manager chỉ có thể quản lý 1 department
    // Khi gán role manager hoặc đổi department cho manager
    if (formData.role === "manager" && formData.department) {
      // Kiểm tra xem có department nào khác đã có manager này chưa
      const existingDept = departments.find(
        (d) => d.managerId === (editingUser?.id || "") && d.id !== formData.department
      );
      if (existingDept) {
        setError(
          `User này đã là quản lý của phòng ban "${existingDept.name}". Một manager chỉ có thể quản lý 1 phòng ban. Vui lòng gỡ manager khỏi phòng ban "${existingDept.name}" trước.`
        );
        return;
      }
    }

    // Validation: Khi đổi role từ manager sang khác, cần xóa manager khỏi department
    if (editingUser && editingUser.role === "manager" && formData.role !== "manager") {
      // Tìm department mà user này đang quản lý
      const managedDept = departments.find((d) => d.managerId === editingUser.id);
      if (managedDept) {
        // Xóa manager khỏi department
        const { updateDepartment } = await import("@/lib/services/departmentService");
        await updateDepartment(managedDept.id, {
          managerId: undefined,
          managerName: undefined,
        });
      }
    }

    setError("");
    setSuccess("");

    if (editingUser) {
      // Update user
      const result = await updateUser(editingUser.id, {
        name: formData.name,
        department: formData.role === "director" ? "" : formData.department, // Director không có department
        role: formData.role,
        phone: formData.phone,
      });

      if (result.success) {
        setSuccess("Cập nhật user thành công");
        loadUsers();
        setTimeout(() => {
          handleCloseDialog();
        }, 1000);
      } else {
        setError(result.error || "Không thể cập nhật user");
      }
    } else {
      // Create user
      const result = await createUser({
        email: formData.email,
        password: formData.password,
        name: formData.name,
        department: formData.role === "director" ? "" : formData.department, // Director không có department
        role: formData.role,
        phone: formData.phone,
      });

      if (result.success) {
        setSuccess("Tạo user thành công");
        loadUsers();
        setTimeout(() => {
          handleCloseDialog();
        }, 1000);
      } else {
        // Hiển thị error message rõ ràng hơn
        const errorMsg = result.error || "Không thể tạo user";
        setError(errorMsg);
        // Scroll to top để user thấy error
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa user này?")) {
      return;
    }

    const result = await deleteUser(userId);
    if (result.success) {
      setSuccess("Xóa user thành công");
      loadUsers();
    } else {
      setError(result.error || "Không thể xóa user");
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "error";
      case "director":
        return "warning";
      case "manager":
        return "info";
      default:
        return "default";
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Admin";
      case "director":
        return "Giám đốc";
      case "manager":
        return "Quản lý";
      default:
        return "Nhân viên";
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Quản lý Users</Typography>
        <Box display="flex" gap={2}>
          <Button
            variant="outlined"
            color="warning"
            component={Link}
            href="/dashboard/users/cleanup"
          >
            Cleanup Auth Users
          </Button>
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
            Thêm User
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Box display="flex" gap={2} mb={3}>
        <TextField
          placeholder="Tìm kiếm..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: <SearchIcon sx={{ mr: 1, color: "text.secondary" }} />,
          }}
          sx={{ flex: 1 }}
        />
        <TextField
          select
          label="Role"
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="employee">Nhân viên</MenuItem>
          <MenuItem value="manager">Quản lý</MenuItem>
          <MenuItem value="director">Giám đốc</MenuItem>
          <MenuItem value="admin">Admin</MenuItem>
        </TextField>
        <TextField
          select
          label="Phòng ban"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
          sx={{ minWidth: 150 }}
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {departments.map((dept) => (
            <MenuItem key={dept.id} value={dept.id}>
              {dept.name}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* Users Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Avatar</TableCell>
              <TableCell>Tên</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phòng ban</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="right">Thao tác</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary" py={3}>
                    Không có user nào
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Avatar src={user.avatar} sx={{ width: 40, height: 40 }}>
                      {user.name?.charAt(0).toUpperCase()}
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role === "director" ? "Không có" : (user.department || "N/A")}</TableCell>
                  <TableCell>
                    <Chip
                      label={getRoleLabel(user.role || "employee")}
                      color={getRoleColor(user.role || "employee")}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status === "online" ? "Online" : "Offline"}
                      color={user.status === "online" ? "success" : "default"}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingUser ? "Chỉnh sửa User" : "Thêm User mới"}</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} pt={1}>
            {error && (
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" onClose={() => setSuccess("")}>
                {success}
              </Alert>
            )}
            <TextField
              label="Tên"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              fullWidth
              disabled={!!editingUser}
            />
            {!editingUser && (
              <TextField
                label="Mật khẩu"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                fullWidth
              />
            )}
            <TextField
              select
              label={formData.role === "director" ? "Phòng ban" : "Phòng ban *"}
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              fullWidth
              required={formData.role !== "director"}
              disabled={formData.role === "director"}
              error={formData.role !== "director" && !formData.department && formData.name !== ""}
              helperText={
                formData.role === "director"
                  ? "Giám đốc không thuộc phòng ban nào"
                  : !formData.department && formData.name !== ""
                  ? "Vui lòng chọn phòng ban"
                  : ""
              }
            >
              <MenuItem value="">
                <em>{formData.role === "director" ? "Không có phòng ban" : "Chọn phòng ban"}</em>
              </MenuItem>
              {departments.length > 0 ? (
                departments.map((dept) => (
                  <MenuItem key={dept.id} value={dept.id}>
                    {dept.icon || "📁"} {dept.name}
                  </MenuItem>
                ))
              ) : (
                <MenuItem value="" disabled>
                  Đang tải phòng ban...
                </MenuItem>
              )}
            </TextField>
            <TextField
              select
              label="Role"
              value={formData.role}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  role: e.target.value as "employee" | "manager" | "director" | "admin",
                })
              }
              fullWidth
            >
              <MenuItem value="employee">Nhân viên</MenuItem>
              <MenuItem value="manager">Quản lý</MenuItem>
              <MenuItem value="director">Giám đốc</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </TextField>
            <TextField
              label="Số điện thoại"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingUser ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
