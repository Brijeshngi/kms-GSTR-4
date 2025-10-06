import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Calculator from "./Calculator";
import API from "../api";

// 🔹 Utility Functions for Date Format Conversion
const formatToDisplay = (isoDate) => {
  if (!isoDate) return "";
  const parts = isoDate.split("-");
  if (parts.length !== 3) return isoDate;
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatToISO = (displayDate) => {
  if (!displayDate) return "";
  const parts = displayDate.split("/");
  if (parts.length !== 3) return displayDate;
  const [day, month, year] = parts;
  return `${year}-${month}-${day}`;
};

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

  // 📌 Add or Update Purchase
  const handleAddOrUpdateEntry = (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.invoiceNumber.trim()) newErrors.invoiceNumber = true;
    if (!formData.date.trim()) newErrors.date = true;
    if (!formData.firmName.trim()) newErrors.firmName = true;
    if (!formData.gstin.trim()) newErrors.gstin = true;
    if (!formData.amount) newErrors.amount = true;
    if (!formData.taxableAmount) newErrors.taxableAmount = true;
    if (parseFloat(formData.taxableAmount) > parseFloat(formData.amount)) {
      newErrors.taxableAmount = true;
      toast.error("❌ Taxable Amount cannot be greater than Total Amount", {
        autoClose: 800,
      });
    }
    if (!formData.cgst) newErrors.cgst = true;
    if (!formData.sgst) newErrors.sgst = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const payload = { ...formData, date: formatToISO(formData.date) };

    if (editIndex !== null && dataArray[editIndex]?._id) {
      const id = dataArray[editIndex]._id;
      API.put(`/purchase/${id}`, payload).then((res) => {
        const updated = [...dataArray];
        updated[editIndex] = res.data;
        setDataArray(updated);
        toast.success("✅ Entry updated successfully!", { autoClose: 800 });
        resetForm();
      });
    } else {
      API.post("/purchase", payload).then((res) => {
        setDataArray([...dataArray, res.data]);
        toast.success("✅ Entry added successfully!", { autoClose: 800 });
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
    const entry = dataArray[index];
    setFormData({
      ...entry,
      date: formatToDisplay(entry.date),
    });
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const id = dataArray[index]._id;
    API.delete(`/purchase/${id}`).then(() => {
      setDataArray(dataArray.filter((_, i) => i !== index));
      toast.success("✅ Entry deleted.", { autoClose: 800 });
      if (editIndex === index) resetForm();
    });
  };

  // 📌 Download Excel
  const handleDownload = () => {
    if (dataArray.length === 0) {
      toast.warn("⚠️ No data to export.", { autoClose: 800 });
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
    toast.success("📥 Excel downloaded successfully!", { autoClose: 800 });
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

  // 📌 Firm Management
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
          toast.success("✅ Firm updated!", { autoClose: 800 });
          setFirmForm({ firmName: "", gstin: "" });
          setEditFirmId(null);
        })
        .catch((err) => toast.error(err.response?.data?.message || "Error"));
    } else {
      API.post("/firms/add", firmForm)
        .then((res) => {
          setFirms([res.data.data, ...firms]);
          toast.success("✅ Firm added!", { autoClose: 800 });
          setFirmForm({ firmName: "", gstin: "" });
        })
        .catch((err) => toast.error(err.response?.data?.message || "Error"));
    }
  };

  const handleDeleteFirm = (id) => {
    API.delete(`/firms/${id}`)
      .then(() => {
        setFirms(firms.filter((f) => f._id !== id));
        toast.success("✅ Firm deleted", { autoClose: 800 });
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
            <label className="form-label">Date (DD/MM/YYYY)</label>
            <input
              type="text"
              name="date"
              placeholder="DD/MM/YYYY"
              className={`form-control ${errors.date ? "is-invalid" : ""}`}
              value={formData.date}
              ref={dateInputRef}
              onChange={(e) => {
                const val = e.target.value;
                if (/^[0-9/]*$/.test(val))
                  setFormData({ ...formData, date: val });
              }}
              onBlur={(e) => {
                const val = e.target.value;
                const parts = val.split("/");
                if (parts.length === 3) {
                  const [d, m, y] = parts.map(Number);
                  if (d > 0 && d <= 31 && m > 0 && m <= 12 && y >= 2000) {
                    setFormData({
                      ...formData,
                      date: `${d.toString().padStart(2, "0")}/${m
                        .toString()
                        .padStart(2, "0")}/${y}`,
                    });
                  } else {
                    toast.error("❌ Invalid date format (use DD/MM/YYYY)", {
                      autoClose: 800,
                    });
                  }
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
          <div className="col-md-4 mb-3">
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
          <div className="col-md-4 mb-3">
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
          <div className="col-md-4 mb-3">
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

      {/* Calculator and Firm Modals (unchanged) */}
      {/* ... keep your modals as they are ... */}

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
          <table className="table table-bordered">
            <thead>
              <tr>
                <th>Date</th>
                <th>Invoice Number</th>
                <th>Firm Name</th>
                <th>GSTIN</th>
                <th>Amount</th>
                <th>Taxable</th>
                <th>CGST</th>
                <th>SGST</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {dataArray.map((entry, index) => (
                <tr key={index}>
                  <td>{formatToDisplay(entry.date)}</td>
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
            </tfoot>
          </table>
        </div>
      )}
      <ToastContainer />
    </div>
  );
}

export default PurchasePage;
