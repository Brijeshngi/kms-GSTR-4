// src/components/FirmModal.jsx
import React, { useState, useEffect } from "react";
import { addFirm, getFirms, deleteFirm, updateFirm } from "../api";

function FirmModal({ show, onClose }) {
  const [firmName, setFirmName] = useState("");
  const [gstin, setGstin] = useState("");
  const [firms, setFirms] = useState([]);

  // Fetch firms when modal opens
  useEffect(() => {
    if (show) {
      fetchFirms();
    }
  }, [show]);

  const fetchFirms = async () => {
    try {
      const { data } = await getFirms();
      setFirms(data.data);
    } catch (err) {
      alert("Error fetching firms");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addFirm({ firmName, gstin });
      setFirms([data.data, ...firms]); // prepend new firm
      setFirmName("");
      setGstin("");
    } catch (err) {
      alert(err.response?.data?.message || "Error adding firm");
    }
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

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog modal-lg">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Manage Firms</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>

          <div className="modal-body">
            {/* Add Firm Form */}
            <form onSubmit={handleSubmit} className="mb-4">
              <div className="row g-2">
                <div className="col-md-4">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Firm Name"
                    value={firmName}
                    onChange={(e) => setFirmName(e.target.value)}
                    required
                  />
                </div>

                <div className="col-md-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="GSTIN"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    required
                  />
                </div>
                <div className="col-md-1 d-grid">
                  <button type="submit" className="btn btn-success">
                    Add
                  </button>
                </div>
              </div>
            </form>

            {/* Firm List Table */}
            <table className="table table-bordered">
              <thead>
                <tr>
                  <th>Firm Name and Address</th>
                  <th>GSTIN</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {firms.map((firm) => (
                  <tr key={firm._id}>
                    <td>{firm.firmName}</td>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirmModal;
