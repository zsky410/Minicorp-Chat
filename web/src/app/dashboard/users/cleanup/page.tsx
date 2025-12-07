"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Paper,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

export default function CleanupAuthUsersPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [orphanedUsers, setOrphanedUsers] = useState<any[]>([]);
  const [checking, setChecking] = useState(false);

  const checkOrphanedUsers = async () => {
    setChecking(true);
    setError("");
    setSuccess("");
    setOrphanedUsers([]);

    try {
      // Lấy danh sách users từ Firestore
      const { getAllUsers } = await import("@/lib/services/userService");
      const result = await getAllUsers();

      if (!result.success) {
        setError("Không thể lấy danh sách users từ Firestore");
        return;
      }

      const firestoreUserIds = new Set(result.data.map((u: any) => u.id || u.uid));

      // Gọi API để lấy users từ Auth (cần tạo API endpoint)
      // Tạm thời hiển thị thông báo
      setError(
        "Tính năng này cần API endpoint riêng hoặc Admin SDK. " +
        "Vui lòng sử dụng script cleanupAuthUsers.js trong thư mục scripts/ để cleanup users."
      );
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra");
    } finally {
      setChecking(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Cleanup Auth Users
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Xóa các users trong Firebase Auth mà không có trong Firestore
      </Typography>

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

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Hướng dẫn sử dụng Script
        </Typography>
        <Typography variant="body2" component="div" sx={{ mt: 2 }}>
          <ol>
            <li>
              Download Service Account Key từ Firebase Console:
              <br />
              <code>
                Project Settings → Service Accounts → Generate new private key
              </code>
            </li>
            <li>
              Lưu file JSON vào root project với tên <code>serviceAccountKey.json</code>
            </li>
            <li>
              Cài đặt dependencies:
              <br />
              <code>npm install firebase-admin</code>
            </li>
            <li>
              Chạy script:
              <br />
              <code>node scripts/cleanupAuthUsers.js</code>
            </li>
          </ol>
        </Typography>
      </Paper>

      <Button
        variant="outlined"
        onClick={checkOrphanedUsers}
        disabled={checking}
        startIcon={checking ? <CircularProgress size={20} /> : null}
      >
        {checking ? "Đang kiểm tra..." : "Kiểm tra users orphaned"}
      </Button>

      {orphanedUsers.length > 0 && (
        <Paper sx={{ mt: 3, p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Users cần xóa ({orphanedUsers.length})
          </Typography>
          <List>
            {orphanedUsers.map((user) => (
              <ListItem key={user.uid}>
                <ListItemText
                  primary={user.email}
                  secondary={user.uid}
                />
                <Button
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  disabled={loading}
                >
                  Xóa
                </Button>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}

