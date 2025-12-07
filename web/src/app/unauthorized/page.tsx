"use client";

import { Box, Typography, Button, Container } from "@mui/material";
import { Block } from "@mui/icons-material";
import { useRouter } from "next/navigation";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <Container maxWidth="sm">
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minHeight="100vh"
        textAlign="center"
      >
        <Block sx={{ fontSize: 80, color: "error.main", mb: 2 }} />
        <Typography variant="h4" gutterBottom>
          Không có quyền truy cập
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          Chỉ Admin mới có thể truy cập Dashboard này.
        </Typography>
        <Button variant="contained" onClick={() => router.push("/login")}>
          Quay lại đăng nhập
        </Button>
      </Box>
    </Container>
  );
}

