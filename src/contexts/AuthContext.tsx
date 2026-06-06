"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

type WorkspaceMode = "pos" | "personal" | null;

interface User {
  name: string;
  email: string;
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  workspaceMode: WorkspaceMode;
  login: (email: string, password: string) => void;
  register: (name: string, email: string, password: string) => void;
  logout: () => void;
  setWorkspaceMode: (mode: WorkspaceMode) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>(null);

  const login = (email: string, _password: string) => {
    // Mock login
    setUser({
      name: "Budi Santoso",
      email,
    });
  };

  const register = (name: string, email: string, _password: string) => {
    // Mock register
    setUser({ name, email });
  };

  const logout = () => {
    setUser(null);
    setWorkspaceMode(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        workspaceMode,
        login,
        register,
        logout,
        setWorkspaceMode,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
