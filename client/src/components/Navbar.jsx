import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false);               // NEW
  const lastScrollY = useRef(typeof window !== 'undefined' ? window.scrollY : 0); // NEW
  const dropdownRef = useRef(null); // NEW
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Replace simple scroll listener with direction-aware handler
    let ticking = false;
    const onScroll = () => {
      const current = window.scrollY;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          setIsScrolled(current > 10);

          // Only hide when menu isn't open and user has scrolled past a threshold
          if (!isOpen && current > 100) {
            if (current > lastScrollY.current) {
              // Scrolling down
              setIsHidden(true);
            } else {
              // Scrolling up
              setIsHidden(false);
            }
          } else {
            setIsHidden(false);
          }

          lastScrollY.current = current;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isOpen]);

  // Ensure visibility on route change and when toggling menu
  useEffect(() => {
    setIsOpen(false);
    setIsDropdownOpen(false);
    setIsHidden(false);                                          // NEW
  }, [location]);

  // Keep body scroll lock in sync with isOpen (fixes "stuck scroll" bug)
  useEffect(() => {
    document.body.classList.toggle('navbar-open', isOpen);
    if (isOpen) setIsHidden(false);                              // NEW
    return () => document.body.classList.remove('navbar-open');
  }, [isOpen]);

  // Close dropdown on outside click / Esc
  useEffect(() => {
    const onClick = (e) => {
      if (isDropdownOpen && dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isDropdownOpen]);

  const toggleMenu = () => {
    setIsOpen(prev => !prev);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    setIsOpen(false);
    setIsDropdownOpen(false);
  };

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'fas fa-tachometer-alt' },
    { path: '/expenses', label: 'Expenses', icon: 'fas fa-receipt' },
    { path: '/reports', label: 'Reports', icon: 'fas fa-chart-bar' },
    { path: '/categories', label: 'Categories', icon: 'fas fa-tags' },
    { path: '/analytics', label: 'Analytics', icon: 'fas fa-chart-line' },
    { path: '/goals', label: 'Financial Goals', icon: 'fas fa-bullseye' },
    { path: '/subscriptions', label: 'Subscriptions', icon: 'fas fa-sync-alt' }
  ];

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''} ${isHidden ? 'navbar--hidden' : ''}`}>
        <div className="navbar-container">
          <Link to="/" className="navbar-logo" onClick={() => setIsOpen(false)}>
            <div className="logo-icon">
              <i className="fas fa-wallet"></i>
            </div>
            <span className="logo-text">Expense Tracker</span>
          </Link>

          <button 
            className={`navbar-toggle ${isOpen ? 'active' : ''}`} 
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
            aria-expanded={isOpen}
          >
            <span className="navbar-toggle-icon"></span>
          </button>

          <div className={`navbar-menu ${isOpen ? 'active' : ''}`}>
            {user ? (
              <>
                <ul className="navbar-nav">
                  {navigationItems.map((item) => (
                    <li key={item.path} className="nav-item">
                      <NavLink 
                        to={item.path} 
                        className={({ isActive }) => 
                          `nav-link ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setIsOpen(false)}
                      >
                        <i className={item.icon}></i>
                        <span>{item.label}</span>
                      </NavLink>
                    </li>
                  ))}
                </ul>

                <div className="navbar-user">
                  <div className="user-info">
                    {/* Make the avatar the only trigger for the menu */}
                    <div
                      className={`dropdown ${isDropdownOpen ? 'open' : ''}`}
                      ref={dropdownRef}
                    >
                      <button
                        className="icon-only-toggle"
                        aria-label="Account menu"
                        aria-expanded={isDropdownOpen}
                        aria-haspopup="menu"
                        onClick={() => setIsDropdownOpen(v => !v)}
                      >
                        <div className="user-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                      </button>

                      <div className="dropdown-menu" role="menu">
                        <Link to="/profile" className="dropdown-item" onClick={() => { setIsOpen(false); setIsDropdownOpen(false); }}>
                          <i className="fas fa-user-circle"></i>
                          <span>Profile</span>
                        </Link>
                        <Link to="/settings" className="dropdown-item" onClick={() => { setIsOpen(false); setIsDropdownOpen(false); }}>
                          <i className="fas fa-cog"></i>
                          <span>Settings</span>
                        </Link>
                        <div className="dropdown-divider"></div>
                        <button onClick={handleLogout} className="dropdown-item logout-btn">
                          <i className="fas fa-sign-out-alt"></i>
                          <span>Logout</span>
                        </button>
                      </div>
                    </div>

                    {/* Keep the greeting text; it’s not part of the trigger */}
                    <span className="user-welcome">
                      Hi, <strong>{user.username}</strong>
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <div className="auth-buttons">
                <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      {isOpen && <div className="navbar-overlay" onClick={() => setIsOpen(false)}></div>}
    </>
  );
};

export default Navbar;