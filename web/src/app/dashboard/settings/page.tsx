"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
} from "@mui/material";
import { Save as SaveIcon } from "@mui/icons-material";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    companyName: "MiniCorp",
    emailDomain: "@minicorp.com",
    enableTasks: true,
    enablePolls: true,
    enablePinnedMessages: true,
    enableDepartmentChats: true,
    passwordMinLength: 6,
    sessionTimeout: 30,
  });
  const [success, setSuccess] = useState("");

  const handleSave = () => {
    // TODO: Save to Firestore
    setSuccess("Đã lưu cài đặt thành công!");
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        System Settings
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Cấu hình hệ thống
      </Typography>

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess("")}>
          {success}
        </Alert>
      )}

      {/* General Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt chung
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Tên công ty"
              value={settings.companyName}
              onChange={(e) =>
                setSettings({ ...settings, companyName: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Email domain"
              value={settings.emailDomain}
              onChange={(e) =>
                setSettings({ ...settings, emailDomain: e.target.value })
              }
              fullWidth
              helperText="Chỉ email với domain này mới được đăng ký"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Feature Toggles */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Bật/Tắt tính năng
          </Typography>
          <Box display="flex" flexDirection="column" gap={1} mt={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableTasks}
                  onChange={(e) =>
                    setSettings({ ...settings, enableTasks: e.target.checked })
                  }
                />
              }
              label="Tính năng Tasks"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enablePolls}
                  onChange={(e) =>
                    setSettings({ ...settings, enablePolls: e.target.checked })
                  }
                />
              }
              label="Tính năng Polls"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enablePinnedMessages}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enablePinnedMessages: e.target.checked,
                    })
                  }
                />
              }
              label="Tính năng Pinned Messages"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableDepartmentChats}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      enableDepartmentChats: e.target.checked,
                    })
                  }
                />
              }
              label="Tính năng Department Chats"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Cài đặt bảo mật
          </Typography>
          <Box display="flex" flexDirection="column" gap={2} mt={2}>
            <TextField
              label="Độ dài mật khẩu tối thiểu"
              type="number"
              value={settings.passwordMinLength}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  passwordMinLength: parseInt(e.target.value) || 6,
                })
              }
              fullWidth
            />
            <TextField
              label="Session timeout (phút)"
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  sessionTimeout: parseInt(e.target.value) || 30,
                })
              }
              fullWidth
            />
          </Box>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Box display="flex" justifyContent="flex-end">
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={handleSave}
          size="large"
        >
          Lưu cài đặt
        </Button>
      </Box>
    </Box>
  );
}
