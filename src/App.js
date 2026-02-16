import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import PurchasePage from "./components/PurchasePage";
import SalePage from "./components/SalePage";
import Summary from "./components/Summary";
import Navbar from "./components/Navbar";
import AuthPage from "./components/AuthPage";
import { useAuth } from "./auth/AuthContext";

function App() {
  const location = useLocation();
  const { isLoggedIn } = useAuth();

  return (
    <>
      {isLoggedIn && <Navbar />}

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/auth"
            element={isLoggedIn ? <Navigate to="/purchase" replace /> : <AuthPage />}
          />

          <Route
            path="/"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <PurchasePage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/purchase"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <PurchasePage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/sale"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <SalePage />
                </PageWrapper>
              </PrivateRoute>
            }
          />
          <Route
            path="/summary"
            element={
              <PrivateRoute>
                <PageWrapper>
                  <Summary />
                </PageWrapper>
              </PrivateRoute>
            }
          />

          <Route path="*" element={<Navigate to={isLoggedIn ? "/purchase" : "/auth"} replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

function PrivateRoute({ children }) {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/auth" replace />;
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
