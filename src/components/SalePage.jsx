import React, { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "bootstrap/dist/css/bootstrap.min.css";
import Calculator from "./Calculator";
const SalePage = () => {
  const [amount, setAmount] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [distributedData, setDistributedData] = useState([]);

  const getDateRange = (start, end) => {
    const dates = [];
    let current = new Date(start);
    const last = new Date(end);
    while (current <= last) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return dates;
  };

  const distributeAmount = () => {
    if (!amount || !fromDate || !toDate) return;

    const increased = parseFloat(amount) * 1.12;
    const finalAmount = increased - increased * 0.04;

    let parts = Array(300).fill(0);
    let remaining = finalAmount;

    // Random distribution logic
    for (let i = 0; i < 300; i++) {
      let value = parseFloat(
        (Math.random() * ((remaining / (300 - i)) * 2)).toFixed(0)
      );
      parts[i] = value;
      remaining -= value;
    }

    // Adjust last value to correct floating-point mismatch
    parts[299] += parseFloat(remaining.toFixed(0));

    const dateRange = getDateRange(fromDate, toDate);
    const result = [];

    let partIndex = 0;
    for (let date of dateRange) {
      for (let j = 0; j < 10 && partIndex < 300; j++) {
        result.push({
          date: date.toISOString().split("T")[0],
          amount: parseFloat(parts[partIndex].toFixed(0)),
        });
        partIndex++;
      }
    }

    setDistributedData(result);
  };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(distributedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SalesDistribution");
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "Sales_Distribution.xlsx");
  };

  return (
    <div className="container mt-4">
      <h3>Distribute Sale Amount</h3>
      <Form className="row g-2 mb-4">
        <Form.Group className="col-md-3">
          <Form.Label>Total Amount</Form.Label>
          <Form.Control
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>From Date</Form.Label>
          <Form.Control
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>To Date</Form.Label>
          <Form.Control
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </Form.Group>
        <Form.Group className="col-md-3 d-flex align-items-end">
          <Button onClick={distributeAmount}>Distribute</Button>
        </Form.Group>
      </Form>
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
      {distributedData.length > 0 && (
        <>
          <Button variant="success" onClick={exportToExcel} className="mb-3">
            Export to Excel
          </Button>
          <Table bordered striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Date</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {distributedData.map((entry, index) => {
                const isLastInGroup = (index + 1) % 10 === 0;
                const groupStart = index - 9 >= 0 ? index - 9 : 0;
                let groupTotal = 0;
                if (isLastInGroup) {
                  groupTotal = distributedData
                    .slice(groupStart, index + 1)
                    .reduce((sum, e) => sum + e.amount, 0);
                }

                return (
                  <React.Fragment key={index}>
                    <tr>
                      <td>{index + 1}</td>
                      <td>{entry.date}</td>
                      <td>{entry.amount.toFixed(2)}</td>
                    </tr>

                    {isLastInGroup && (
                      <tr className="fw-bold bg-light">
                        <td colSpan={2}>Total for {entry.date}</td>
                        <td>{groupTotal.toFixed(2)}</td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {/* Final grand total */}
              <tr className="fw-bold bg-success text-white">
                <td colSpan={2}>Final Grand Total</td>
                <td>
                  {distributedData
                    .reduce((sum, e) => sum + e.amount, 0)
                    .toFixed(2)}
                </td>
              </tr>
            </tbody>
          </Table>
        </>
      )}
    </div>
  );
};

export default SalePage;
