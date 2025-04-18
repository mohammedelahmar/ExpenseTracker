import React, { useState, useContext } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css'; // You'll need to create this CSS file

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    document.querySelector('.navbar-toggle').classList.toggle('active');
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link to="/" className="navbar-logo">
          Expense Tracker
        </Link>

        {/* Mobile menu button */}
        <button className="navbar-toggle" onClick={toggleMenu}>
          <span className="navbar-toggle-icon"></span>
        </button>

        {/* Navigation links */}
        <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
          {user ? (
            <>
              <Link to="/dashboard" className="navbar-item">Dashboard</Link>
              <Link to="/expenses" className="navbar-item">Expenses</Link>
              <Link to="/reports" className="navbar-item">Reports</Link>
              <Link to="/categories" className="navbar-item">Categories</Link>
              
              <li className="nav-item">
                <NavLink to="/analytics" className="nav-link" activeClassName="active">
                  <i className="fas fa-chart-line"></i> Analytics
                </NavLink>
              </li>

              <li className="nav-item">
                <NavLink to="/goals" className="nav-link">
                  <i className="fas fa-bullseye"></i>
                  <span>Financial Goals</span>
                </NavLink>
              </li>

              <div className="navbar-item navbar-user">
                <span className="user-welcome">Welcome, {user.username}</span>
                <div className="dropdown">
                  <button className="dropdown-toggle">
                    <span>Account</span>
                    <i className="dropdown-arrow"></i>
                  </button>
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item">Profile</Link>
                    <button onClick={handleLogout} className="dropdown-item">Logout</button>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="navbar-item">Login</Link>
              <Link to="/register" className="navbar-item">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;