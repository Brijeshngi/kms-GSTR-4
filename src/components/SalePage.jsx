import React, { useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SalePage = () => {
  const [input, setInput] = useState({ amount: "", from: "", to: "" });
  const [distributedData, setDistributedData] = useState([]);

  const handleChange = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const getDatesInRange = (start, end) => {
    const dates = [];
    const current = new Date(start);
    const last = new Date(end);

    while (current <= last) {
      dates.push(new Date(current).toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    return dates;
  };

  const generateRandomParts = (total, count) => {
    const parts = [];
    let remaining = total;

    for (let i = 0; i < count - 1; i++) {
      const part = parseFloat(
        (Math.random() * ((remaining / (count - i)) * 2)).toFixed(2)
      );
      parts.push(part);
      remaining -= part;
    }

    parts.push(parseFloat(remaining.toFixed(2))); // Add remaining in last part
    return parts;
  };

  const handleGenerate = () => {
    const { amount, from, to } = input;
    if (!amount || !from || !to) return;

    const margin = parseFloat(amount) * 1.12;
    const afterTax = margin * 0.96;
    const dates = getDatesInRange(from, to);

    if (dates.length * 10 < 300) {
      alert("Date range should have at least 30 days for 10 parts per day.");
      return;
    }

    const parts = generateRandomParts(afterTax, 300);
    const data = [];

    let index = 0;
    for (const date of dates) {
      for (let i = 0; i < 10 && index < 300; i++) {
        data.push({ date, amount: parts[index++] });
      }
    }

    setDistributedData(data);
  };

  // Group data by date for display
  const grouped = distributedData.reduce((acc, item) => {
    if (!acc[item.date]) acc[item.date] = [];
    acc[item.date].push(item.amount);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h3>Distribute Amount by Date Range</h3>

      <Form className="row g-3 mb-3">
        <Form.Group className="col-md-3">
          <Form.Label>Total Amount</Form.Label>
          <Form.Control
            type="number"
            name="amount"
            value={input.amount}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>From Date</Form.Label>
          <Form.Control
            type="date"
            name="from"
            value={input.from}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>To Date</Form.Label>
          <Form.Control
            type="date"
            name="to"
            value={input.to}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3 d-flex align-items-end">
          <Button variant="primary" onClick={handleGenerate}>
            Generate
          </Button>
        </Form.Group>
      </Form>

      <h4 className="mt-4">Distributed Records</h4>
      {Object.keys(grouped).map((date) => {
        const dailyAmounts = grouped[date];
        const total = dailyAmounts.reduce((a, b) => a + b, 0).toFixed(2);

        return (
          <div key={date} className="mb-3">
            <h5>{date}</h5>
            <Table striped bordered hover size="sm">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {dailyAmounts.map((amt, idx) => (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{amt}</td>
                  </tr>
                ))}
                <tr className="fw-bold">
                  <td>Total</td>
                  <td>{total}</td>
                </tr>
              </tbody>
            </Table>
          </div>
        );
      })}
    </div>
  );
};

export default SalePage;
