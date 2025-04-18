import React from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import PurchasePage from "./components/PurchasePage";
import SalePage from "./components/SalePage";
import Summary from "./components/Summary";
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();

  return (
    <>
      <Navbar />
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

// PageWrapper for fade-in and exit animation
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
