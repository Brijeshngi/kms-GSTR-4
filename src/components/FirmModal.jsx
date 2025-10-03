import React, { useState } from "react";
import { addFirm } from "../api";

function FirmModal({ show, onClose, onFirmAdded }) {
  const [firmName, setFirmName] = useState("");
  const [address, setAddress] = useState("");
  const [gstin, setGstin] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addFirm({ firmName, address, gstin });
      onFirmAdded(data.data); // ✅ correct prop
      setFirmName("");
      setAddress("");
      setGstin("");
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Error adding firm");
    }
  };

  if (!show) return null;

  return (
    <div
      className="modal fade show d-block"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
    >
      <div className="modal-dialog">
        <div className="modal-content shadow">
          <div className="modal-header">
            <h5 className="modal-title">Add New Firm</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
            ></button>
          </div>
          <div className="modal-body">
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Firm Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={firmName}
                  onChange={(e) => setFirmName(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Address</label>
                <textarea
                  className="form-control"
                  rows="2"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                ></textarea>
              </div>
              <div className="mb-3">
                <label className="form-label">GSTIN</label>
                <input
                  type="text"
                  className="form-control"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value)}
                  required
                />
              </div>
              <div className="d-flex justify-content-end">
                <button
                  type="button"
                  className="btn btn-secondary me-2"
                  onClick={onClose}
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-success">
                  Save Firm
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FirmModal;
