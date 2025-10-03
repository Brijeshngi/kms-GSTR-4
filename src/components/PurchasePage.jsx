import React, { useState, useRef, useEffect } from "react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Calculator from "./Calculator";
import API, { getFirms } from "../api"; // 👈 Import your API helper

function PurchasePage() {
  const dateInputRef = useRef(null);

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
  const [firms, setFirms] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [editIndex, setEditIndex] = useState(null);
  const [errors, setErrors] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Fetch purchases
  useEffect(() => {
    API.get("/purchase")
      .then((res) => setDataArray(res.data))
      .catch((err) => console.error("Failed to fetch purchases", err));
  }, []);

  // Fetch firms from backend
  useEffect(() => {
    getFirms()
      .then((res) => setFirms(res.data.data))
      .catch((err) => console.error("Failed to fetch firms", err));
  }, [lastUpdated]); // 👈 re-run when updated

  console.log(firms);

  // ================= FORM HANDLERS =================
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let updatedForm = { ...formData, [name]: value };

    // Auto-fill GSTIN when firm is selected
    if (name === "firmName") {
      const selectedFirm = firms.find((firm) => firm.firmName === value);
      updatedForm.gstin = selectedFirm ? selectedFirm.gstin : "";
    }

    // Auto-fill SGST same as CGST
    if (name === "cgst") {
      updatedForm.sgst = value;
    }

    setFormData(updatedForm);
  };

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

  // ================== CALCULATED TOTALS ==================
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

  // ================= RENDER =================
  return (
    <div className="container mt-5">
      <h2 className="mb-4 text-center">Invoice Details Form</h2>
      <form onSubmit={handleAddOrUpdateEntry}>
        <div className="row mb-3">
          <div className="col-md-4 mb-3">
            <label className="form-label">Date</label>
            <input
              type="date"
              name="date"
              className={`form-control ${errors.date ? "is-invalid" : ""}`}
              value={formData.date}
              ref={dateInputRef}
              onChange={handleFormChange}
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
              {firms.map((firm, i) => (
                <option key={firm._id || i} value={firm.firmName} />
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

      <button
        type="button"
        className="btn btn-secondary mb-3"
        data-bs-toggle="modal"
        data-bs-target="#calculatorModal"
      >
        Open Calculator
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

      <div className="text-center mb-3">
        <button className="btn btn-primary px-5" onClick={handleDownload}>
          Download Excel
        </button>
      </div>

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
            </tfoot>
            <tfoot>
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
