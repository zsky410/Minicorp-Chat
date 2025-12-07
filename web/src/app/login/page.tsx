"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Box, CircularProgress } from "@mui/material";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to dashboard (no login needed)
    router.push("/dashboard");
  }, [router]);

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
      <CircularProgress />
    </Box>
  );
}

