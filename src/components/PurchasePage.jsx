import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Calculator from "./Calculator";
import API from "../api";

function PurchasePage() {
  const dateInputRef = useRef(null);

  // 📌 Purchase form state
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    date: "",
    firmName: "",
    gstin: "",
    amount: "",
    taxableAmount: "",
    cgst: "",
    sgst: "",
  });
  const [dataArray, setDataArray] = useState([]);
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // 📌 Firm management state
  const [firms, setFirms] = useState([]);
  const [firmForm, setFirmForm] = useState({ firmName: "", gstin: "" });
  const [editFirmId, setEditFirmId] = useState(null);

  // 🔹 Load purchases
  useEffect(() => {
    API.get("/purchase")
      .then((res) => setDataArray(res.data))
      .catch((err) => console.error("Failed to fetch purchases", err));
  }, []);

  // 🔹 Load firms
  useEffect(() => {
    API.get("/firms")
      .then((res) => setFirms(res.data.data))
      .catch((err) => console.error("Failed to fetch firms", err));
  }, []);

  // 📌 Handle purchase form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    if (name === "firmName") {
      const selectedFirm = firms.find((firm) => firm.firmName === value);
      updatedForm.gstin = selectedFirm ? selectedFirm.gstin : "";
    }
    if (name === "cgst") {
      updatedForm.sgst = value;
    }

    setFormData(updatedForm);
  };

  // 📌 Add/Update Purchase
  const handleAddOrUpdateEntry = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = true;
    if (!formData.date) newErrors.date = true;
    if (!formData.firmName.trim()) newErrors.firmName = true;
    if (!formData.gstin.trim()) newErrors.gstin = true;
    if (!formData.amount) newErrors.amount = true;
    if (!formData.taxableAmount) newErrors.taxableAmount = true;
    if (parseFloat(formData.taxableAmount) > parseFloat(formData.amount)) {
      newErrors.taxableAmount = true;
      toast.error("❌ Taxable Amount cannot be greater than Total Amount", {
        autoClose: 500,
      });
    }
    if (!formData.cgst) newErrors.cgst = true;
    if (!formData.sgst) newErrors.sgst = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (editIndex !== null && dataArray[editIndex]._id) {
      const id = dataArray[editIndex]._id;
      API.put(`/purchase/${id}`, formData).then((res) => {
        const updated = [...dataArray];
        updated[editIndex] = res.data;
        setDataArray(updated);
        toast.success("✅ Entry updated successfully!", { autoClose: 500 });
        resetForm();
      });
    } else {
      API.post("/purchase", formData).then((res) => {
        setDataArray([...dataArray, res.data]);
        toast.success("✅ Entry added successfully!", { autoClose: 500 });
        resetForm();
      });
    }
  };

  const resetForm = () => {
    setFormData({
      invoiceNumber: "",
      date: "",
      firmName: "",
      gstin: "",
      amount: "",
      taxableAmount: "",
      cgst: "",
      sgst: "",
    });
    setEditIndex(null);
    dateInputRef.current?.focus();
  };

  const handleEdit = (index) => {
    setFormData(dataArray[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const id = dataArray[index]._id;
    API.delete(`/purchase/${id}`).then(() => {
      setDataArray(dataArray.filter((_, i) => i !== index));
      toast.success("✅ Entry deleted.", { autoClose: 500 });
      if (editIndex === index) resetForm();
    });
  };

  // 📌 Download Excel
  const handleDownload = () => {
    if (dataArray.length === 0) {
      toast.warn("⚠️ No data to export.", { autoClose: 500 });
      return;
    }
    const worksheet = XLSX.utils.json_to_sheet(dataArray);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Invoices");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    saveAs(
      new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }),
      "invoices.xlsx"
    );
    toast.success("📥 Excel downloaded successfully!", { autoClose: 500 });
  };

  // 📊 Totals
  const totalAmount = dataArray.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );
  const totalTaxable = dataArray.reduce(
    (sum, item) => sum + parseFloat(item.taxableAmount || 0),
    0
  );
  const totalCgst = dataArray.reduce(
    (sum, item) => sum + parseFloat(item.cgst || 0),
    0
  );
  const totalSgst = dataArray.reduce(
    (sum, item) => sum + parseFloat(item.sgst || 0),
    0
  );

  const filteredData = dataArray.filter((item) => {
    const itemDate = new Date(item.date);
    const from = startDate ? new Date(startDate) : null;
    const to = endDate ? new Date(endDate) : null;
    return (!from || itemDate >= from) && (!to || itemDate <= to);
  });

  const totalAmountInRange = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.amount || 0),
    0
  );
  const totalTaxableAmountInRange = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.taxableAmount || 0),
    0
  );
  const totalCGSTInRange = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.cgst || 0),
    0
  );
  const totalSGSTInRange = filteredData.reduce(
    (sum, item) => sum + parseFloat(item.sgst || 0),
    0
  );

  // 📌 Firm Management Handlers
  const handleFirmFormChange = (e) => {
    const { name, value } = e.target;
    setFirmForm({ ...firmForm, [name]: value });
  };

  const handleSaveFirm = (e) => {
    e.preventDefault();
    if (editFirmId) {
      API.put(`/firms/${editFirmId}`, firmForm)
        .then((res) => {
          setFirms(
            firms.map((f) => (f._id === editFirmId ? res.data.data : f))
          );
          toast.success("✅ Firm updated!", { autoClose: 500 });
          setFirmForm({ firmName: "", gstin: "" });
          setEditFirmId(null);
        })
        .catch((err) => toast.error(err.response?.data?.message || "Error"));
    } else {
      API.post("/firms/add", firmForm)
        .then((res) => {
          setFirms([res.data.data, ...firms]);
          toast.success("✅ Firm added!", { autoClose: 500 });
          setFirmForm({ firmName: "", gstin: "" });
        })
        .catch((err) => toast.error(err.response?.data?.message || "Error"));
    }
  };

  const handleDeleteFirm = (id) => {
    API.delete(`/firms/${id}`)
      .then(() => {
        setFirms(firms.filter((f) => f._id !== id));
        toast.success("✅ Firm deleted", { autoClose: 500 });
      })
      .catch(() => toast.error("❌ Error deleting firm"));
  };

  const handleEditFirm = (firm) => {
    setFirmForm({ firmName: firm.firmName, gstin: firm.gstin });
    setEditFirmId(firm._id);
  };

  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Invoice Details Form</h2>
      <form onSubmit={handleAddOrUpdateEntry}>
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label className="form-label">Date</label>
            <input
              type="text"
              name="date"
              placeholder="dd/mm/yyyy"
              maxLength="10"
              className={`form-control ${errors.date ? "is-invalid" : ""}`}
              value={
                formData.date && formData.date.includes("-")
                  ? (() => {
                      const [year, month, day] = formData.date.split("-");
                      return `${day}/${month}/${year}`;
                    })()
                  : formData.date || ""
              }
              ref={dateInputRef}
              onChange={(e) => {
                let input = e.target.value.replace(/\D/g, ""); // remove non-digits
                let formatted = input;

                // auto-insert slashes
                if (input.length > 2 && input.length <= 4) {
                  formatted = `${input.slice(0, 2)}/${input.slice(2)}`;
                } else if (input.length > 4) {
                  formatted = `${input.slice(0, 2)}/${input.slice(
                    2,
                    4
                  )}/${input.slice(4, 8)}`;
                }

                // validate when fully entered
                if (formatted.length === 10) {
                  const [day, month, year] = formatted.split("/").map(Number);

                  const isValidDate = (d, m, y) => {
                    if (m < 1 || m > 12 || d < 1) return false;
                    const daysInMonth = new Date(y, m, 0).getDate();
                    return d <= daysInMonth;
                  };

                  if (!isValidDate(day, month, year)) {
                    toast.error("❌ Invalid date. Please check day or month.", {
                      autoClose: 800,
                    });
                    setFormData((prev) => ({ ...prev, date: "" }));
                    return;
                  }

                  // valid → store as yyyy-mm-dd
                  setFormData((prev) => ({
                    ...prev,
                    date: `${year}-${String(month).padStart(2, "0")}-${String(
                      day
                    ).padStart(2, "0")}`,
                  }));
                } else {
                  // still typing → show formatted
                  setFormData((prev) => ({ ...prev, date: formatted }));
                }
              }}
              required
            />
          </div>

          <div className="col-md-4 mb-3">
            <label className="form-label">Invoice Number</label>
            <input
              type="text"
              name="invoiceNumber"
              className={`form-control ${
                errors.invoiceNumber ? "is-invalid" : ""
              }`}
              value={formData.invoiceNumber}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="col-md-4 mb-3">
            <label className="form-label">Firm Name</label>
            <input
              list="firms"
              name="firmName"
              className={`form-control ${errors.firmName ? "is-invalid" : ""}`}
              value={formData.firmName}
              onChange={handleFormChange}
              required
            />
            <datalist id="firms">
              {firms.map((firm) => (
                <option key={firm._id} value={firm.firmName} />
              ))}
            </datalist>
          </div>
          <div className="col-md-4 mb-4">
            <label className="form-label">GSTIN</label>
            <input
              type="text"
              name="gstin"
              className={`form-control ${errors.gstin ? "is-invalid" : ""}`}
              maxLength="15"
              value={formData.gstin}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="col-md-4 mb-4">
            <label className="form-label">Total Amount</label>
            <input
              type="number"
              name="amount"
              className={`form-control ${errors.amount ? "is-invalid" : ""}`}
              value={formData.amount}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="col-md-4 mb-4">
            <label className="form-label">Taxable Amount</label>
            <input
              type="number"
              name="taxableAmount"
              className={`form-control ${
                errors.taxableAmount ? "is-invalid" : ""
              }`}
              value={formData.taxableAmount}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">CGST (%)</label>
            <input
              type="number"
              name="cgst"
              className={`form-control ${errors.cgst ? "is-invalid" : ""}`}
              value={formData.cgst}
              onChange={handleFormChange}
              required
            />
          </div>
          <div className="col-md-2 mb-3">
            <label className="form-label">SGST (%)</label>
            <input
              type="number"
              name="sgst"
              className={`form-control ${errors.sgst ? "is-invalid" : ""}`}
              value={formData.sgst}
              onChange={handleFormChange}
              required
            />
          </div>
        </div>

        <div className="text-center mb-3">
          <button type="submit" className="btn btn-success px-4 me-2">
            {editIndex !== null ? "Update Entry" : "Add Entry"}
          </button>
          <button
            type="button"
            className="btn btn-secondary px-4"
            onClick={resetForm}
          >
            Clear
          </button>
        </div>
      </form>

      {/* Calculator + Manage Firms */}
      <button
        type="button"
        className="btn btn-secondary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#calculatorModal"
      >
        Open Calculator
      </button>
      <button
        type="button"
        className="btn btn-dark mb-3 ms-2"
        data-bs-toggle="modal"
        data-bs-target="#firmModal"
      >
        Manage Firms
      </button>

      {/* Calculator Modal */}
      <div
        className="modal fade"
        id="calculatorModal"
        tabIndex="-1"
        aria-labelledby="calculatorModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="calculatorModalLabel">
                Calculator
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <Calculator />
            </div>
          </div>
        </div>
      </div>

      {/* Firm Modal */}
      <div
        className="modal fade"
        id="firmModal"
        tabIndex="-1"
        aria-labelledby="firmModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-lg modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="firmModalLabel">
                Manage Firms
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleSaveFirm} className="mb-3">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      name="firmName"
                      className="form-control"
                      placeholder="Firm Name"
                      value={firmForm.firmName}
                      onChange={handleFirmFormChange}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      name="gstin"
                      className="form-control"
                      placeholder="GSTIN"
                      value={firmForm.gstin}
                      onChange={handleFirmFormChange}
                      required
                    />
                  </div>
                </div>
                <button type="submit" className="btn btn-success">
                  {editFirmId ? "Update Firm" : "Add Firm"}
                </button>
              </form>

              <table className="table table-bordered">
                <thead>
                  <tr>
                    <th>Firm Name</th>
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
                          className="btn btn-warning btn-sm me-2"
                          onClick={() => handleEditFirm(firm)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteFirm(firm._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Download Excel */}
      <div className="text-center mb-3">
        <button className="btn btn-primary px-5" onClick={handleDownload}>
          Download Excel
        </button>
      </div>

      {/* Saved Entries */}
      {dataArray.length > 0 && (
        <div className="mt-4">
          <h5>Saved Entries:</h5>
          <div className="row mb-4">
            <div className="col-md-6">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-6">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Firm Name</th>
                <th>GSTIN</th>
                <th>Amount</th>
                <th>Taxable Amount</th>
                <th>CGST (%)</th>
                <th>SGST (%)</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataArray.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.date}</td>
                  <td>{entry.invoiceNumber}</td>
                  <td>{entry.firmName}</td>
                  <td>{entry.gstin}</td>
                  <td>{entry.amount}</td>
                  <td>{entry.taxableAmount}</td>
                  <td>{entry.cgst}</td>
                  <td>{entry.sgst}</td>
                  <td>
                    <button
                      className="btn btn-warning btn-sm me-2"
                      onClick={() => handleEdit(index)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(index)}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="table-secondary fw-bold">
                <td colSpan="4" className="text-end">
                  Total
                </td>
                <td>{totalAmount.toFixed(2)}</td>
                <td>{totalTaxable.toFixed(2)}</td>
                <td>{totalCgst.toFixed(2)}</td>
                <td>{totalSgst.toFixed(2)}</td>
                <td></td>
              </tr>
              <tr>
                <td colSpan="4">
                  <strong>Total in Filtered Range</strong>
                </td>
                <td>
                  <strong>{totalAmountInRange.toFixed(2)}</strong>
                </td>
                <td>
                  <strong>{totalTaxableAmountInRange.toFixed(2)}</strong>
                </td>
                <td>
                  <strong>{totalCGSTInRange.toFixed(2)}</strong>
                </td>
                <td>
                  <strong>{totalSGSTInRange.toFixed(2)}</strong>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default PurchasePage;
