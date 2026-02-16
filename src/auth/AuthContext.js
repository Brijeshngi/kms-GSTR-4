import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginUser, registerUser } from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token") || "");
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, [token]);

  useEffect(() => {
    if (user) localStorage.setItem("user", JSON.stringify(user));
    else localStorage.removeItem("user");
  }, [user]);

  const login = async ({ email, password }) => {
    const res = await loginUser({ email, password });
    const { token: t, user: u } = res.data || {};
    if (!t) throw new Error(res?.data?.message || "Login failed");
    setToken(t);
    setUser(u || null);
    return { token: t, user: u };
  };

  const register = async ({ name, email, password, role }) => {
    const res = await registerUser({ name, email, password, role });
    const { token: t, user: u } = res.data || {};
    if (!t) throw new Error(res?.data?.message || "Registration failed");
    setToken(t);
    setUser(u || null);
    return { token: t, user: u };
  };

  const logout = () => {
    setToken("");
    setUser(null);
  };

  const value = useMemo(
    () => ({
      token,
      user,
      isLoggedIn: !!token,
      login,
      register,
      logout,
    }),
    [token, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider />");
  return ctx;
}
