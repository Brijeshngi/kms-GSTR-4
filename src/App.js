import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router";
import { AnimatePresence, motion } from "framer-motion";
import PurchasePage from "./components/PurchasePage";
import SalePage from "./components/SalePage";
import Summary from "./components/Summary";
import Navbar from "./components/Navbar";
import FirmModal from "./components/FirmModal";
import { getFirms, deleteFirm, updateFirm } from "./api";

const ACCESS_CODE = process.env.REACT_APP_ACCESS_CODE; // 🔐 from .env

function App() {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [codeInput, setCodeInput] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [firms, setFirms] = useState([]);
  const fetchFirms = async () => {
    try {
      const { data } = await getFirms();
      setFirms(data.data);
    } catch (err) {
      alert("Error fetching firms");
    }
  };

  const handleFirmAdded = (firm) => {
    setFirms([firm, ...firms]);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this firm?")) {
      try {
        await deleteFirm(id);
        setFirms(firms.filter((f) => f._id !== id));
      } catch (err) {
        alert("Error deleting firm");
      }
    }
  };

  const handleUpdate = async (id) => {
    const newName = prompt("Enter new Firm Name:");
    if (newName) {
      try {
        const { data } = await updateFirm(id, { firmName: newName });
        setFirms(firms.map((f) => (f._id === id ? data.data : f)));
      } catch (err) {
        alert("Error updating firm");
      }
    }
  };
  useEffect(() => {
    const storedAccess = sessionStorage.getItem("access");
    if (storedAccess === "granted") {
      setIsAuthenticated(true);
    }
  }, []);
  const handleAddFirm = (firmData) => {
    console.log("Firm Added:", firmData);
    // Later: call API to save firm
  };
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
        <button
          className="btn btn-dark me-3"
          onClick={() => setShowModal(true)}
        >
          Add New Firm
        </button>
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Logout
        </button>
      </div>
      <FirmModal
        show={showModal}
        onClose={() => setShowModal(false)}
        onFirmAdded={handleFirmAdded}
      />
      {/* Firm List */}
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Firm Name</th>
            <th>Address</th>
            <th>GSTIN</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {firms.map((firm) => (
            <tr key={firm._id}>
              <td>{firm.firmName}</td>
              <td>{firm.address}</td>
              <td>{firm.gstin}</td>
              <td>
                <button
                  className="btn btn-sm btn-primary me-2"
                  onClick={() => handleUpdate(firm._id)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete(firm._id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {firms.length === 0 && (
            <tr>
              <td colSpan="4" className="text-center">
                No firms found
              </td>
            </tr>
          )}
        </tbody>
      </table>
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
