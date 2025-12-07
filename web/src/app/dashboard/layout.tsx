"use client";

import dynamic from "next/dynamic";
import { Box, CircularProgress } from "@mui/material";

// Disable SSR for dashboard to prevent hydration mismatch with MUI
const DashboardLayout = dynamic(() => import("@/components/DashboardLayout"), {
  ssr: false,
  loading: () => (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  ),
});

export default function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
