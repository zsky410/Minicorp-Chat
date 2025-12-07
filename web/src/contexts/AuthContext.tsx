"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
} from "firebase/auth";
import { auth } from "@/lib/firebase";

interface UserData {
  uid: string;
  email: string;
  name: string;
  department: string;
  role: "employee" | "manager" | "director" | "admin";
  avatar?: string;
  phone?: string;
  status?: string;
}

interface AuthContextType {
  user: (User & UserData) | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  setDemoUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<(User & UserData) | null>(null);
  const [loading, setLoading] = useState(true);

  // Auto set demo user on mount (no login required)
  useEffect(() => {
    const mockUser = {
      uid: "demo-admin",
      email: "admin@minicorp.com",
      emailVerified: false,
      displayName: "Admin",
      photoURL: null,
      phoneNumber: null,
      metadata: {} as any,
      providerData: [],
      refreshToken: "",
      tenantId: null,
      isAnonymous: false,
      providerId: "password",
      delete: async () => {},
      getIdToken: async () => "",
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      name: "Admin",
      department: "General",
      role: "admin" as const,
      avatar: "",
      phone: "",
      status: "online",
    };
    setUser(mockUser as unknown as User & UserData);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
      setUser(null);
    }
  };

  const setDemoUser = () => {
    const mockUser = {
      uid: "demo-admin",
      email: "admin@minicorp.com",
      emailVerified: false,
      displayName: "Admin",
      photoURL: null,
      phoneNumber: null,
      metadata: {} as any,
      providerData: [],
      refreshToken: "",
      tenantId: null,
      isAnonymous: false,
      providerId: "password",
      delete: async () => {},
      getIdToken: async () => "",
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      name: "Admin",
      department: "General",
      role: "admin" as const,
      avatar: "",
      phone: "",
      status: "online",
    };
    setUser(mockUser as unknown as User & UserData);
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, setDemoUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
