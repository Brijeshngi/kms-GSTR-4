import React, { useState } from "react";
import { Table, Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";

const SalePage = () => {
  const [formData, setFormData] = useState({
    date: "",
    invoice: "",
    amount: "",
  });
  const [sales, setSales] = useState([]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = () => {
    if (!formData.date || !formData.invoice || !formData.amount) return;
    setSales([...sales, { ...formData, amount: parseFloat(formData.amount) }]);
    setFormData({ date: "", invoice: "", amount: "" });
  };

  // Group sales by date
  const groupedSales = sales.reduce((acc, sale) => {
    if (!acc[sale.date]) acc[sale.date] = [];
    acc[sale.date].push(sale);
    return acc;
  }, {});

  return (
    <div className="container mt-4">
      <h3>Sales Entry</h3>

      <Form className="row g-2 mb-3">
        <Form.Group className="col-md-3">
          <Form.Label>Date</Form.Label>
          <Form.Control
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>Invoice</Form.Label>
          <Form.Control
            type="text"
            name="invoice"
            value={formData.invoice}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3">
          <Form.Label>Amount</Form.Label>
          <Form.Control
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
          />
        </Form.Group>
        <Form.Group className="col-md-3 d-flex align-items-end">
          <Button variant="primary" onClick={handleAdd}>
            Add Sale
          </Button>
        </Form.Group>
      </Form>

      <h4 className="mt-4">Sales Records</h4>
      {Object.keys(groupedSales).map((date) => {
        const daySales = groupedSales[date];
        const total = daySales.reduce((sum, entry) => sum + entry.amount, 0);

        return (
          <div key={date} className="mb-4">
            <h5>{date}</h5>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Invoice No</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {daySales.slice(0, 3).map((entry, index) => (
                  <tr key={index}>
                    <td>{entry.invoice}</td>
                    <td>{entry.amount}</td>
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
