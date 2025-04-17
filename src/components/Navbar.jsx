import React from "react";
import { NavLink } from "react-router";

function Navbar() {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand" to="/purchase">
        InvoiceApp
      </NavLink>
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navbarNav"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navbarNav">
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink className="nav-link" to="/purchase">
              Purchase
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/sale">
              Sale
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to="/summary">
              Summary
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
