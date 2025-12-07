"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  CircularProgress,
  Chip,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from "@mui/icons-material";
import {
  getAllDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  Department,
} from "@/lib/services/departmentService";
import { getAllUsers, User, getUsersByDepartment } from "@/lib/services/userService";

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [departmentMemberCounts, setDepartmentMemberCounts] = useState<Record<string, { employees: number; managers: number }>>({});
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    description: "",
    icon: "📁",
    type: "department" as "public" | "department",
    managerId: "",
    managerName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const icons = ["🏢", "💻", "📢", "💼", "👥", "📁", "🎯", "⚡"];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const deptResult = await getAllDepartments();
    const userResult = await getAllUsers();

    if (deptResult.success && deptResult.data) {
      setDepartments(deptResult.data);

      // Tính số thành viên cho mỗi department
      const counts: Record<string, { employees: number; managers: number }> = {};
      for (const dept of deptResult.data) {
        // Match department by ID or name (case-insensitive)
        const deptUsers = userResult.data.filter(
          (u) =>
            u.department && (
              u.department.toLowerCase() === dept.id.toLowerCase() ||
              u.department.toLowerCase() === dept.name.toLowerCase()
            )
        );
        const employees = deptUsers.filter((u) => u.role === "employee").length;
        const managers = deptUsers.filter((u) => u.role === "manager").length;
        counts[dept.id] = { employees, managers };
      }
      setDepartmentMemberCounts(counts);
    } else {
      setError(deptResult.error || "Không thể tải danh sách phòng ban");
    }

    if (userResult.success && userResult.data) {
      setUsers(userResult.data);
    }

    setLoading(false);
  };

  const handleOpenDialog = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        id: dept.id,
        name: dept.name,
        description: dept.description || "",
        icon: dept.icon || "📁",
        type: dept.type || "department",
        managerId: dept.managerId || "",
        managerName: dept.managerName || "",
      });
    } else {
      setEditingDept(null);
      setFormData({
        id: "",
        name: "",
        description: "",
        icon: "📁",
        type: "department",
        managerId: "",
        managerName: "",
      });
    }
    setOpenDialog(true);
    setError("");
    setSuccess("");
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDept(null);
    setError("");
    setSuccess("");
  };

  const handleSubmit = async () => {
    if (!formData.name) {
      setError("Vui lòng nhập tên phòng ban");
      return;
    }

    if (!editingDept && !formData.id) {
      setError("Vui lòng nhập ID phòng ban");
      return;
    }

    // Validation: Manager chỉ có thể quản lý 1 department
    if (formData.managerId) {
      const manager = users.find((u) => u.id === formData.managerId);
      if (manager && manager.role === "manager") {
        // Kiểm tra xem manager này đã quản lý department nào khác chưa
        const existingDept = departments.find(
          (d) => d.managerId === formData.managerId && d.id !== editingDept?.id
        );
        if (existingDept) {
          setError(
            `User "${manager.name}" đã là quản lý của phòng ban "${existingDept.name}". Một manager chỉ có thể quản lý 1 phòng ban.`
          );
          return;
        }
      }
    }

    setError("");
    setSuccess("");

    const manager = users.find((u) => u.id === formData.managerId);

    if (editingDept) {
      const updateData: any = {
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        type: formData.type,
      };

      // Chỉ thêm managerId và managerName nếu có giá trị
      if (formData.managerId) {
        updateData.managerId = formData.managerId;
        updateData.managerName = manager?.name || "";
      } else {
        // Nếu không có manager, set null để xóa field
        updateData.managerId = null;
        updateData.managerName = null;
      }

      const result = await updateDepartment(editingDept.id, updateData);

      if (result.success) {
        setSuccess("Cập nhật phòng ban thành công");
        loadData();
        setTimeout(() => {
          handleCloseDialog();
        }, 1000);
      } else {
        setError(result.error || "Không thể cập nhật phòng ban");
      }
    } else {
      const createData: any = {
        id: formData.id.toLowerCase().replace(/\s+/g, "-"),
        name: formData.name,
        description: formData.description,
        icon: formData.icon,
        type: formData.type,
      };

      // Chỉ thêm managerId và managerName nếu có giá trị
      if (formData.managerId) {
        createData.managerId = formData.managerId;
        createData.managerName = manager?.name || "";
      }

      const result = await createDepartment(createData);

      if (result.success) {
        setSuccess("Tạo phòng ban thành công");
        loadData();
        setTimeout(() => {
          handleCloseDialog();
        }, 1000);
      } else {
        setError(result.error || "Không thể tạo phòng ban");
      }
    }
  };

  const handleDelete = async (deptId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa phòng ban này?")) {
      return;
    }

    const result = await deleteDepartment(deptId);
    if (result.success) {
      setSuccess("Xóa phòng ban thành công");
      loadData();
    } else {
      setError(result.error || "Không thể xóa phòng ban");
    }
  };

  const getManagerName = (dept: Department) => {
    if (dept.managerName) return dept.managerName;
    if (dept.managerId) {
      const manager = users.find((u) => u.id === dept.managerId);
      return manager?.name || "N/A";
    }
    return "Chưa có";
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
        <Typography variant="h4">Quản lý Phòng ban</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>
          Thêm Phòng ban
        </Button>
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(3, 1fr)",
          },
          gap: 3,
        }}
      >
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="start" mb={2}>
                  <Box>
                    <Typography variant="h5" component="div">
                      {dept.icon} {dept.name}
                    </Typography>
                    <Chip
                      label={dept.type === "public" ? "Công khai" : "Phòng ban"}
                      size="small"
                      sx={{ mt: 1 }}
                    />
                  </Box>
                  <Box>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(dept)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(dept.id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {dept.description || "Không có mô tả"}
                </Typography>
                <Box display="flex" flexDirection="column" gap={1}>
                  <Typography variant="body2">
                    <strong>Quản lý:</strong> {getManagerName(dept)}
                  </Typography>
                  <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2">
                      <strong>Nhân viên:</strong> {departmentMemberCounts[dept.id]?.employees || 0}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Quản lý:</strong> {departmentMemberCounts[dept.id]?.managers || 0}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
          </Card>
        ))}
      </Box>

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editingDept ? "Chỉnh sửa Phòng ban" : "Thêm Phòng ban mới"}</DialogTitle>
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
            {!editingDept && (
              <TextField
                label="ID (tự động tạo từ tên nếu để trống)"
                value={formData.id}
                onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                placeholder="engineering"
                helperText="ID sẽ được tự động tạo từ tên nếu để trống"
                fullWidth
              />
            )}
            <TextField
              label="Tên phòng ban"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              fullWidth
            />
            <TextField
              label="Mô tả"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
            <TextField
              select
              label="Icon"
              value={formData.icon}
              onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
              fullWidth
            >
              {icons.map((icon) => (
                <MenuItem key={icon} value={icon}>
                  {icon}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              label="Loại"
              value={formData.type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  type: e.target.value as "public" | "department",
                })
              }
              fullWidth
            >
              <MenuItem value="department">Phòng ban</MenuItem>
              <MenuItem value="public">Công khai</MenuItem>
            </TextField>
            <TextField
              select
              label="Quản lý"
              value={formData.managerId}
              onChange={(e) => {
                const manager = users.find((u) => u.id === e.target.value);
                setFormData({
                  ...formData,
                  managerId: e.target.value,
                  managerName: manager?.name || "",
                });
              }}
              fullWidth
            >
              <MenuItem value="">Không có</MenuItem>
              {users
                .filter((u) => u.role === "manager")
                .map((user) => {
                  // Hiển thị warning nếu user đã là manager của department khác
                  const isManagerElsewhere = departments.find(
                    (d) => d.managerId === user.id && d.id !== editingDept?.id
                  );
                  return (
                    <MenuItem key={user.id} value={user.id} disabled={!!isManagerElsewhere}>
                      {user.name} ({user.email})
                      {isManagerElsewhere && " - Đã quản lý phòng ban khác"}
                    </MenuItem>
                  );
                })}
            </TextField>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Hủy</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingDept ? "Cập nhật" : "Tạo"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
