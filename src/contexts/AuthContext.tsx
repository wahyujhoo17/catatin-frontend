"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────
type WorkspaceMode = "pos" | "personal" | null;

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  mode?: "POS" | "PERSONAL";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  workspaceMode: WorkspaceMode;
  login: (
    email: string,
    password: string,
    cfTurnstileToken?: string,
  ) => Promise<{ token: string; refreshToken: string; user: User }>;
  register: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    cfTurnstileToken?: string,
  ) => Promise<{ message: string; email: string; registrationType?: string }>;
  verifyOtp: (
    email: string,
    code: string,
  ) => Promise<{ token: string; refreshToken: string; user: User }>;
  forgotPassword: (
    email: string,
    cfTurnstileToken?: string,
  ) => Promise<{
    message: string;
    type?: "email" | "phone";
  }>;
  resetPassword: (
    token: string,
    password: string,
  ) => Promise<{ message: string }>;
  logout: () => void;
  updateMode: (mode: "POS" | "PERSONAL") => Promise<void>;
  refreshSession: () => Promise<void>;
  loginWithGoogle: () => void;
  updateUser: (user: User) => void;
}

// ─── Config ────────────────────────────────────────────────────
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// ─── Helpers ──────────────────────────────────────────────────

const IS_PROD =
  typeof window !== "undefined" && window.location.protocol === "https:";

const COOKIE_FLAGS = `path=/; SameSite=Lax${IS_PROD ? "; Secure" : ""}`;

function getStoredToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

function storeTokens(token: string, refreshToken: string) {
  localStorage.setItem("token", token);
  localStorage.setItem("refreshToken", refreshToken);
  // Flag cookie for proxy — never stores the actual JWT
  document.cookie = `auth=1; ${COOKIE_FLAGS}; max-age=${60 * 60 * 24 * 7}`;
}

function clearTokens() {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("profile_name");
  localStorage.removeItem("profile_email");
  localStorage.removeItem("profile_image");
  localStorage.removeItem("active_dashboard");
  document.cookie = `auth=; ${COOKIE_FLAGS}; max-age=0`;
  document.cookie = `catatin-mode=; ${COOKIE_FLAGS}; max-age=0`;
}

// ─── Context ──────────────────────────────────────────────────
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ─── Compute workspaceMode from user.mode ──────────────────
  const workspaceMode: WorkspaceMode =
    user?.mode === "POS"
      ? "pos"
      : user?.mode === "PERSONAL"
        ? "personal"
        : null;

  // ─── Sync mode cookie for proxy ─────────────────────────
  useEffect(() => {
    if (workspaceMode) {
      document.cookie = `catatin-mode=${workspaceMode}; ${COOKIE_FLAGS}; max-age=2592000`;
    } else if (workspaceMode === null && user !== null) {
      document.cookie = `catatin-mode=; ${COOKIE_FLAGS}; max-age=0`;
    }
  }, [workspaceMode, user]);

  // ─── Derive isLoggedIn ─────────────────────────────────────
  const isLoggedIn = !!user && !!token;

  // ─── Restore session on mount ──────────────────────────────
  const refreshSession = useCallback(async () => {
    const stored = getStoredToken();
    if (!stored) {
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, {
        headers: { Authorization: `Bearer ${stored}` },
      });

      if (!res.ok) {
        // Only clear tokens if unauthorized or forbidden
        if (res.status === 401 || res.status === 403) {
          clearTokens();
          setUser(null);
          setToken(null);
        }
        setIsLoading(false);
        return;
      }

      const data = await res.json();
      setUser(data.user);
      setToken(stored);
    } catch (err) {
      // PWA Fix: Do NOT clear tokens on network error (user might be offline)
      console.warn(
        "[Auth] Network error during session refresh, keeping tokens:",
        err,
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  // ─── Login ──────────────────────────────────────────────────
  const login = async (
    email: string,
    password: string,
    cfTurnstileToken?: string,
  ) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, cfTurnstileToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login gagal");

    storeTokens(data.token, data.refreshToken);
    setUser(data.user);
    setToken(data.token);

    return data;
  };

  // ─── Register ───────────────────────────────────────────────
  const register = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    cfTurnstileToken?: string,
  ) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, cfTurnstileToken }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registrasi gagal");

    return data;
  };

  // ─── Verify OTP ─────────────────────────────────────────────
  const verifyOtp = async (email: string, code: string) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verifikasi OTP gagal");

    storeTokens(data.token, data.refreshToken);
    setUser(data.user);
    setToken(data.token);

    return data;
  };

  // ─── Forgot Password ────────────────────────────────────────
  const forgotPassword = async (email: string, cfTurnstileToken?: string) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, cfTurnstileToken }),
    });

    const data = await res.json();
    if (!res.ok)
      throw new Error(data.error || "Gagal mengirim permintaan reset");

    return data;
  };

  // ─── Reset Password ─────────────────────────────────────────
  const resetPassword = async (token: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal reset password");

    return data;
  };

  // ─── Update Mode ────────────────────────────────────────────
  const updateMode = async (mode: "POS" | "PERSONAL") => {
    const stored = getStoredToken();
    if (!stored) throw new Error("Not authenticated");

    const res = await fetch(`${API_BASE}/api/auth/mode`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${stored}`,
      },
      body: JSON.stringify({ mode }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal update mode");

    // Update local user
    setUser((prev) => (prev ? { ...prev, mode } : prev));

    return data;
  };

  // ─── Update User (from profile change) ────────────────────
  const updateUser = useCallback((updated: User) => {
    setUser(updated);
    // Sync localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("profile_name", updated.name || "");
      localStorage.setItem("profile_email", updated.email || "");
    }
  }, []);
  const loginWithGoogle = () => {
    window.location.href = `${API_BASE}/api/auth/google`;
  };

  // ─── Logout ─────────────────────────────────────────────────
  const logout = () => {
    clearTokens();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoggedIn,
        isLoading,
        workspaceMode,
        login,
        register,
        verifyOtp,
        forgotPassword,
        resetPassword,
        logout,
        updateMode,
        refreshSession,
        loginWithGoogle,
        updateUser,
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
