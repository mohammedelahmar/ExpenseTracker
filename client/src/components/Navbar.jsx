import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('sidebarCollapsed') || 'false');
    } catch {
      return false;
    }
  });
  const [isOpen, setIsOpen] = useState(false); // mobile drawer open
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  // NEW: user menu state + ref
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  // Apply body class for layout shift (content indentation)
  useEffect(() => {
    document.body.classList.add('with-sidebar');
    return () => document.body.classList.remove('with-sidebar');
  }, []);

  // Persist collapsed state + body class
  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    document.body.classList.toggle('sidebar-collapsed', collapsed);
  }, [collapsed]);

  // Close mobile drawer and user menu on route change
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // NEW: close user menu on outside click + Esc
  useEffect(() => {
    const onClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/expenses', label: 'Expenses', icon: 'fas fa-receipt' },
    { path: '/reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { path: '/categories', label: 'Categories', icon: 'fas fa-tags' },
    { path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/goals', label: 'Financial Goals', icon: 'fas fa-bullseye' },
    { path: '/subscriptions', label: 'Subscriptions', icon: 'fas fa-sync-alt' }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
    setUserMenuOpen(false);
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className="sidebar-mobile-toggle"
        aria-label="Open menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(v => !v)}
      >
        <span className="hamburger"></span>
      </button>

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand">
            <div className="brand-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <span className="brand-text">Expense Tracker</span>
          </Link>

          <button
            className="collapse-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={() => setCollapsed(v => !v)}
            title={collapsed ? 'Expand' : 'Collapse'}
          >
            <i className={`fas ${collapsed ? 'fa-angle-right' : 'fa-angle-left'}`}></i>
          </button>
        </div>

        {user && (
          <nav className="sidebar-nav">
            <ul>
              {navigationItems.map(item => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
                  >
                    <i className={item.icon}></i>
                    <span className="link-text">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        )}

        <div className="sidebar-footer">
          {user ? (
            // REPLACED: make avatar+name a toggle; menu contains profile/settings/logout
            <div className="sidebar-user" ref={userMenuRef}>
              <button
                className="sidebar-user-trigger"
                onClick={() => setUserMenuOpen(v => !v)}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
              >
                <div className="user-avatar">
                  <i className="fas fa-user"></i>
                </div>
                <div className="user-meta">
                  <span className="user-greet">Hi,</span>
                  <span className="user-name">{user.username}</span>
                </div>
                <i className={`user-caret fas ${userMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
              </button>

              <div className={`user-menu ${userMenuOpen ? 'open' : ''}`}>
                <Link to="/profile" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <i className="fas fa-user-circle"></i>
                  <span>Profile</span>
                </Link>
                <Link to="/settings" className="user-menu-item" onClick={() => setUserMenuOpen(false)}>
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </Link>
                <button className="user-menu-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="sidebar-auth">
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/register" className="btn btn-primary">Get Started</Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="sidebar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Navbar;