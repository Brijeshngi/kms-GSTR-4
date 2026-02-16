import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAuth } from "../auth/AuthContext";

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

  const [mode, setMode] = useState("login"); // login | register
  const [loading, setLoading] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
  });

  const onLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(loginForm);
      toast.success("✅ Logged in");
      navigate("/purchase", { replace: true });
    } catch (err) {
      toast.error(err?.response?.data?.message || err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const onRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(regForm);
      toast.success("✅ Account created");
      navigate("/purchase", { replace: true });
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err.message || "Registration failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex align-items-center justify-content-center vh-100 bg-light">
      <div className="card shadow p-4" style={{ width: 380, maxWidth: "92vw" }}>
        <h4 className="text-center mb-3">GST App</h4>

        <div className="btn-group w-100 mb-3" role="group" aria-label="Auth mode">
          <button
            type="button"
            className={`btn ${mode === "login" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => setMode("login")}
            disabled={loading}
          >
            Login
          </button>
          <button
            type="button"
            className={`btn ${
              mode === "register" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setMode("register")}
            disabled={loading}
          >
            Register
          </button>
        </div>

        {mode === "login" ? (
          <form onSubmit={onLogin}>
            <label className="form-label">Email</label>
            <input
              className="form-control mb-2"
              type="email"
              value={loginForm.email}
              onChange={(e) =>
                setLoginForm((s) => ({ ...s, email: e.target.value }))
              }
              required
              autoComplete="email"
            />

            <label className="form-label">Password</label>
            <input
              className="form-control mb-3"
              type="password"
              value={loginForm.password}
              onChange={(e) =>
                setLoginForm((s) => ({ ...s, password: e.target.value }))
              }
              required
              autoComplete="current-password"
            />

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Please wait..." : "Login"}
            </button>
          </form>
        ) : (
          <form onSubmit={onRegister}>
            <label className="form-label">Name</label>
            <input
              className="form-control mb-2"
              value={regForm.name}
              onChange={(e) =>
                setRegForm((s) => ({ ...s, name: e.target.value }))
              }
              required
              autoComplete="name"
            />

            <label className="form-label">Email</label>
            <input
              className="form-control mb-2"
              type="email"
              value={regForm.email}
              onChange={(e) =>
                setRegForm((s) => ({ ...s, email: e.target.value }))
              }
              required
              autoComplete="email"
            />

            <label className="form-label">Password</label>
            <input
              className="form-control mb-2"
              type="password"
              value={regForm.password}
              onChange={(e) =>
                setRegForm((s) => ({ ...s, password: e.target.value }))
              }
              required
              autoComplete="new-password"
            />

            <label className="form-label">Role (optional)</label>
            <select
              className="form-select mb-3"
              value={regForm.role}
              onChange={(e) => setRegForm((s) => ({ ...s, role: e.target.value }))}
              disabled={loading}
            >
              <option value="user">user</option>
              <option value="admin">admin</option>
            </select>

            <button className="btn btn-primary w-100" disabled={loading}>
              {loading ? "Please wait..." : "Create account"}
            </button>
          </form>
        )}
      </div>
      <ToastContainer position="top-center" />
    </div>
  );
}
