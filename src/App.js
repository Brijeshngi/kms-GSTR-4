import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import PurchasePage from "./components/PurchasePage";
import SalePage from "./components/SalePage";
import Summary from "./components/Summary";
import Navbar from "./components/Navbar";

const ACCESS_CODE = process.env.REACT_APP_ACCESS_CODE; // 🔐 from .env

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");

  useEffect(() => {
    const storedAccess = sessionStorage.getItem("access");
    if (storedAccess === "granted") {
      setIsAuthenticated(true);
    }
  }, []);

  const handleSubmit = () => {
    if (codeInput === ACCESS_CODE) {
      setIsAuthenticated(true);
      sessionStorage.setItem("access", "granted");
    } else {
      alert("Access Denied: Invalid Code");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("access");
    setIsAuthenticated(false);
    setCodeInput("");
  };

  if (!isAuthenticated) {
    return (
      <div className="d-flex flex-column align-items-center justify-content-center vh-100 bg-light">
        <div className="card p-4 shadow" style={{ width: "300px" }}>
          <h5 className="text-center mb-3">Enter Access Code</h5>
          <input
            type="password"
            className="form-control mb-2"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          />
          <button className="btn btn-primary w-100" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="d-flex justify-content-end p-3">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/"
            element={
              <PageWrapper>
                <PurchasePage />
              </PageWrapper>
            }
          />
          <Route
            path="/purchase"
            element={
              <PageWrapper>
                <PurchasePage />
              </PageWrapper>
            }
          />
          <Route
            path="/sale"
            element={
              <PageWrapper>
                <SalePage />
              </PageWrapper>
            }
          />
          <Route
            path="/summary"
            element={
              <PageWrapper>
                <Summary />
              </PageWrapper>
            }
          />
          <Route
            path="*"
            element={
              <PageWrapper>
                <h2>Page Not Found</h2>
              </PageWrapper>
            }
          />
        </Routes>
      </AnimatePresence>
    </>
  );
}

// Page animation wrapper
const PageWrapper = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    transition={{ duration: 0.4 }}
  >
    {children}
  </motion.div>
);

export default App;
