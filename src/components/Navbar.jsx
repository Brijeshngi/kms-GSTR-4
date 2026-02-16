import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const onLogout = () => {
    logout();
    navigate("/auth", { replace: true });
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <NavLink className="navbar-brand" to="/purchase">
        GST-App
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
        <ul className="navbar-nav ms-auto align-items-lg-center">
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

          <li className="nav-item ms-lg-3">
            <span className="navbar-text text-white-50">
              {user?.name ? `Hi, ${user.name}` : user?.email ? user.email : ""}
            </span>
          </li>

          <li className="nav-item ms-lg-2">
            <button className="btn btn-outline-light btn-sm" onClick={onLogout}>
              Logout
            </button>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
