import React from "react";
import { Routes, Route } from "react-router";
import PurchasePage from "./components/PurchasePage";
import SalePage from "./components/SalePage";
import Summary from "./components/Summary";
import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/purchase" element={<PurchasePage />} />
        <Route path="/sale" element={<SalePage />} />
        <Route path="/summary" element={<Summary />} />
      </Routes>
    </>
  );
}

export default App;
