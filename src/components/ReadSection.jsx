import React, { useState } from "react";
import { Form, Table, InputGroup } from "react-bootstrap";

const ReadSection = ({ data = [] }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState(data);

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    const lowercased = value.toLowerCase();

    const result = data.filter(
      (item) =>
        item.firmName.toLowerCase().includes(lowercased) ||
        item.gstin.toLowerCase().includes(lowercased)
    );
    setFilteredData(result);
  };

  const totalAmount = Array.isArray(filteredData)
    ? filteredData.reduce((sum, item) => sum + Number(item.amount || 0), 0)
    : 0;

  const autocompleteSuggestions = data
    .filter(
      (item) =>
        item.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.gstin.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .map((item) => item.firmName);

  return (
    <div className="p-4">
      <h4>🔍 Search & View Entries</h4>

      <InputGroup className="mb-3">
        <Form.Control
          type="text"
          placeholder="Search by firm name or GSTIN"
          value={searchTerm}
          onChange={handleSearch}
          list="suggestions"
        />
        <datalist id="suggestions">
          {[...new Set(autocompleteSuggestions)].map((firm, index) => (
            <option key={index} value={firm} />
          ))}
        </datalist>
      </InputGroup>

      <Table striped bordered hover>
        <thead>
          <tr>
            <th>Date</th>
            <th>Invoice No</th>
            <th>Firm Name</th>
            <th>GSTIN</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          {filteredData?.length > 0 ? (
            filteredData.map((item, index) => (
              <tr key={index}>
                <td>{item.date}</td>
                <td>{item.invoiceNo}</td>
                <td>{item.firmName}</td>
                <td>{item.gstin}</td>
                <td>{item.amount}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center">
                No matching records found.
              </td>
            </tr>
          )}
        </tbody>
      </Table>

      <h5 className="text-end mt-3">
        Total Amount: ₹ {totalAmount.toFixed(2)}
      </h5>
    </div>
  );
};

export default ReadSection;
