"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import {
  People as PeopleIcon,
  Business as BusinessIcon,
  Message as MessageIcon,
  TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { getAnalytics, AnalyticsData } from "@/lib/services/analyticsService";

const COLORS = ["#007AFF", "#5856D6", "#4CD964", "#FF9500", "#FF3B30"];

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError("");
    const result = await getAnalytics();
    if (result.success && result.data) {
      setAnalytics(result.data);
    } else {
      setError(result.error || "Không thể tải dữ liệu");
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box>
        <Typography>Không có dữ liệu</Typography>
      </Box>
    );
  }

  const stats = [
    {
      title: "Tổng Users",
      value: analytics.totalUsers,
      icon: <PeopleIcon />,
      color: "#007AFF",
    },
    {
      title: "Active Users",
      value: analytics.activeUsers,
      icon: <TrendingUpIcon />,
      color: "#4CD964",
    },
    {
      title: "Phòng ban",
      value: analytics.totalDepartments,
      icon: <BusinessIcon />,
      color: "#5856D6",
    },
    {
      title: "Tin nhắn hôm nay",
      value: analytics.messagesToday,
      icon: <MessageIcon />,
      color: "#FF9500",
    },
  ];

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        Tổng quan hệ thống
      </Typography>

      {/* Stats Cards */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            sm: "repeat(2, 1fr)",
            md: "repeat(4, 1fr)",
          },
          gap: 3,
          mt: 2,
          mb: 4,
        }}
      >
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4">{stat.value}</Typography>
                </Box>
                <Box sx={{ color: stat.color, fontSize: 40 }}>{stat.icon}</Box>
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Charts */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: {
            xs: "1fr",
            md: "repeat(2, 1fr)",
          },
          gap: 3,
        }}
      >
        {/* Users by Department */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Users theo Phòng ban
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.usersByDepartment}
                  dataKey="count"
                  nameKey="department"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics.usersByDepartment.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Role */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Users theo Role
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.usersByRole}
                  dataKey="count"
                  nameKey="role"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analytics.usersByRole.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Users by Department Bar Chart */}
        <Box sx={{ gridColumn: "1 / -1" }}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Số lượng Users theo Phòng ban
              </Typography>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.usersByDepartment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="department" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#007AFF" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
