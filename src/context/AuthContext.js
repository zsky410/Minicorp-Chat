import React, { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthChanged,
  signIn,
  signUp,
  signOut,
  resetPassword,
} from "../services/authService";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { db, auth } from "../services/firebase";
import { getUserPermissions } from "../services/permissionService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let userUnsubscribe = null;

    const unsubscribe = onAuthChanged(async (firebaseUser) => {
      // Unsubscribe from previous user listener if exists
      if (userUnsubscribe) {
        userUnsubscribe();
        userUnsubscribe = null;
      }

      if (firebaseUser) {
        // Set up realtime listener for user document
        const userRef = doc(db, "users", firebaseUser.uid);

        userUnsubscribe = onSnapshot(
          userRef,
          (userDoc) => {
            if (userDoc.exists()) {
              const userData = { ...firebaseUser, ...userDoc.data() };
              // Map "member" to "employee" for backward compatibility
              if (userData.role === "member") {
                userData.role = "employee";
              }
              // Bỏ admin role trong app (admin chỉ có trên web)
              if (userData.role === "admin") {
                userData.role = "employee"; // Fallback về employee
              }
              // Calculate and add permissions
              userData.permissions = getUserPermissions(userData);
              setUser(userData);
            } else {
              // User doc doesn't exist, use Firebase user only
              const userData = { ...firebaseUser };
              userData.permissions = getUserPermissions(userData);
              setUser(userData);
            }
            setLoading(false);
          },
          (error) => {
            console.error("Error listening to user document:", error);
            // Fallback to one-time fetch if listener fails
            getDoc(userRef).then((userDoc) => {
              if (userDoc.exists()) {
                const userData = { ...firebaseUser, ...userDoc.data() };
                if (userData.role === "member") {
                  userData.role = "employee";
                }
                // Bỏ admin role trong app
                if (userData.role === "admin") {
                  userData.role = "employee";
                }
                userData.permissions = getUserPermissions(userData);
                setUser(userData);
              } else {
                const userData = { ...firebaseUser };
                userData.permissions = getUserPermissions(userData);
                setUser(userData);
              }
              setLoading(false);
            });
          }
        );
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (userUnsubscribe) {
        userUnsubscribe();
      }
    };
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

