import React, { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthChanged,
  signIn,
  signUp,
  signOut,
  resetPassword,
} from "../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { getUserPermissions } from "../services/permissionService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      if (firebaseUser) {
        // Fetch additional user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
        if (userDoc.exists()) {
          const userData = { ...firebaseUser, ...userDoc.data() };
          // Map "member" to "employee" for backward compatibility
          if (userData.role === "member") {
            userData.role = "employee";
          }
          // Calculate and add permissions
          userData.permissions = getUserPermissions(userData);
          setUser(userData);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email, password) => {
    return await signIn(email, password);
  };

  const register = async (email, password, name, department, phone) => {
    return await signUp(email, password, name, department, phone);
  };

  const logout = async () => {
    return await signOut();
  };

  const resetPass = async (email) => {
    return await resetPassword(email);
  };

  const refreshUser = async () => {
    const firebaseUser = auth.currentUser;
    if (firebaseUser) {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = { ...firebaseUser, ...userDoc.data() };
        // Map "member" to "employee" for backward compatibility
        if (userData.role === "member") {
          userData.role = "employee";
        }
        // Calculate and add permissions
        userData.permissions = getUserPermissions(userData);
        setUser(userData);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        resetPassword: resetPass,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

