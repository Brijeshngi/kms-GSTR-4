import React, { useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import "bootstrap/dist/css/bootstrap.min.css";

const Summary = () => {
  const [data, setData] = useState([
    {
      purchaseMonth: "",
      saleMonth: "",
      purchaseAmount: "",
      wholeSaleAmount: "",
    },
    {
      purchaseMonth: "",
      saleMonth: "",
      purchaseAmount: "",
      wholeSaleAmount: "",
    },
    {
      purchaseMonth: "",
      saleMonth: "",
      purchaseAmount: "",
      wholeSaleAmount: "",
    },
  ]);

  const handleChange = (index, field, value) => {
    const updated = [...data];
    updated[index][field] = value;
    setData(updated);
  };

  const calculateRetail = (purchase, wholesale) => {
    const pAmt = parseFloat(purchase || 0);
    const wAmt = parseFloat(wholesale || 0);
    return (pAmt * 1.12 - wAmt).toFixed(2);
  };

  const total = data.reduce(
    (acc, row) => {
      const pAmt = parseFloat(row.purchaseAmount || 0);
      const wAmt = parseFloat(row.wholeSaleAmount || 0);
      const rAmt = parseFloat(calculateRetail(pAmt, wAmt));
      acc.purchase += pAmt;
      acc.wholesale += wAmt;
      acc.retail += rAmt;
      return acc;
    },
    { purchase: 0, wholesale: 0, retail: 0 }
  );

  const exportToExcel = () => {
    const formattedData = data.map((row) => ({
      "Purchase Month": row.purchaseMonth,
      "Sale Month": row.saleMonth,
      "Purchase Amount": row.purchaseAmount,
      "Whole Sale Amount": row.wholeSaleAmount,
      "Retail Sale Amount": calculateRetail(
        row.purchaseAmount,
        row.wholeSaleAmount
      ),
    }));

    formattedData.push({
      "Purchase Month": "Total",
      "Sale Month": "",
      "Purchase Amount": total.purchase.toFixed(2),
      "Whole Sale Amount": total.wholesale.toFixed(2),
      "Retail Sale Amount": total.retail.toFixed(2),
    });

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Profit Analysis");
    XLSX.writeFile(wb, "Profit_Analysis.xlsx");
  };

  return (
    <div className="container mt-4">
      <h4>Monthly Purchase & Sale Table</h4>

      <Table bordered>
        <thead className="table-secondary">
          <tr>
            <th>Purchase Month</th>
            <th>Sale Month</th>
            <th>Purchase Amount</th>
            <th>Whole Sale Amount</th>
            <th>Retail Sale Amount</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td>
                <Form.Control
                  type="text"
                  value={row.purchaseMonth}
                  onChange={(e) =>
                    handleChange(index, "purchaseMonth", e.target.value)
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="text"
                  value={row.saleMonth}
                  onChange={(e) =>
                    handleChange(index, "saleMonth", e.target.value)
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={row.purchaseAmount}
                  onChange={(e) =>
                    handleChange(index, "purchaseAmount", e.target.value)
                  }
                />
              </td>
              <td>
                <Form.Control
                  type="number"
                  value={row.wholeSaleAmount}
                  onChange={(e) =>
                    handleChange(index, "wholeSaleAmount", e.target.value)
                  }
                />
              </td>
              <td>
                {calculateRetail(row.purchaseAmount, row.wholeSaleAmount)}
              </td>
            </tr>
          ))}
          <tr className="fw-bold table-success">
            <td colSpan={2}>Total</td>
            <td>{total.purchase.toFixed(2)}</td>
            <td>{total.wholesale.toFixed(2)}</td>
            <td>{total.retail.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>

      <div className="d-flex justify-content-between mt-3">
        <div className="fw-bold">
          Purchase Total: ₹{total.purchase.toFixed(2)} <br />
          Sale Total: ₹{(total.wholesale + total.retail).toFixed(2)}
        </div>
        <Button onClick={exportToExcel} variant="success">
          Export to Excel
        </Button>
      </div>
    </div>
  );
};

export default Summary;
