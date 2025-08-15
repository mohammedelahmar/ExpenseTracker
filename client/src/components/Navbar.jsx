import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import '../styles/Navbar.css';

const Navbar = () => {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });
  
  const [isOpen, setIsOpen] = useState(false); // mobile drawer
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  // Removed unused isScrolled/isHidden state
  
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  
  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  //
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  // Enhanced navigation items with better organization (removed income and budget)
  const navigationItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: 'fas fa-home',
      category: 'main'
    },
    { 
      path: '/expenses', 
      label: 'Expenses', 
      icon: 'fas fa-credit-card',
      category: 'main'
    },
    { 
      path: '/reports', 
      label: 'Reports', 
      icon: 'fas fa-chart-line',
      category: 'analytics'
    },
    { 
      path: '/analytics', 
      label: 'Analytics', 
      icon: 'fas fa-chart-pie',
      category: 'analytics'
    },
    { 
      path: '/categories', 
      label: 'Categories', 
      icon: 'fas fa-tags',
      category: 'settings'
    },
    { 
      path: '/goals', 
      label: 'Goals', 
      icon: 'fas fa-bullseye',
      category: 'planning'
    },
    { 
      path: '/subscriptions', 
      label: 'Subscriptions', 
      icon: 'fas fa-sync-alt',
      category: 'planning'
    }
  ];

  // Apply body class for layout shift
  useEffect(() => {
    document.body.classList.add('with-sidebar');
    return () => document.body.classList.remove('with-sidebar');
  }, []);

  // Persist collapsed state
  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    } catch (error) {
            // ignore storage errors
    }
  }, [collapsed]);

  // Removed unused scroll-hide behavior to prevent extra reflows

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Close user menu on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setUserMenuOpen(false);
        setIsOpen(false);
      }
    };

    if (userMenuOpen || isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll when mobile menu is open
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      }
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [userMenuOpen, isOpen]);

  // Handle resize events for better responsiveness
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && isOpen) {
        setIsOpen(false);
      }
      // Reset collapsed state on mobile/tablet
      if (window.innerWidth < 992 && collapsed) {
        setCollapsed(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, collapsed]);

  // Touch gesture handling for mobile swipe
  useEffect(() => {
    if (window.innerWidth >= 992) return; // Only on mobile/tablet

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchMoved.current = false;
    };

    const handleTouchMove = (e) => {
      if (!touchStartX.current) return;
      touchMoved.current = true;
      
      const currentX = e.touches[0].clientX;
      const currentY = e.touches[0].clientY;
      const diffX = currentX - touchStartX.current;
      const diffY = Math.abs(currentY - touchStartY.current);
      
      // Only handle horizontal swipes (ignore vertical scrolling)
      if (Math.abs(diffX) > diffY && Math.abs(diffX) > 50) {
        // Swipe from left edge to open sidebar
        if (!isOpen && touchStartX.current < 50 && diffX > 100) {
          e.preventDefault();
          setIsOpen(true);
        }
        // Swipe right to close sidebar when open
        else if (isOpen && diffX < -100) {
          e.preventDefault();
          setIsOpen(false);
        }
      }
    };

    const handleTouchEnd = () => {
      touchStartX.current = 0;
      touchStartY.current = 0;
      touchMoved.current = false;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
      setUserMenuOpen(false);
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.error('Logout failed:', error);
      }
    }
  };

  const toggleSidebar = () => {
    // Only allow collapse/expand on desktop (>= 992px)
    if (window.innerWidth >= 992) {
      setCollapsed(prev => !prev);
    }
  };

  const toggleMobileMenu = () => {
    setIsOpen(prev => !prev);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(prev => !prev);
  };

  // Group navigation items by category
  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});

  const categoryLabels = {
    main: 'Overview',
    analytics: 'Analytics',
    planning: 'Planning',
    settings: 'Settings'
  };

  return (
    <>
      {/* Mobile toggle button */}
      <button
        className={`sidebar-mobile-toggle ${isOpen ? 'active' : ''}`}
        aria-label={isOpen ? 'Close menu' : 'Open menu'}
        aria-expanded={isOpen}
        onClick={toggleMobileMenu}
        style={{ 
          background: isOpen ? 'rgba(239, 68, 68, 0.9)' : undefined,
          color: isOpen ? 'white' : undefined
        }}
      >
        <span className="hamburger"></span>
      </button>

      <aside 
        ref={sidebarRef}
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${isOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header">
          <Link to="/" className="sidebar-brand" onClick={() => setIsOpen(false)}>
            <div className="brand-icon">
              <i className="fas fa-chart-line"></i>
            </div>
            <span className="brand-text">FinanceHub</span>
          </Link>

          <button
            className="collapse-toggle"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            onClick={toggleSidebar}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{ display: typeof window !== 'undefined' && window.innerWidth < 992 ? 'none' : 'flex' }}
          >
            <i className={`fas ${collapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}></i>
          </button>
        </div>

        {user && (
          <nav className="sidebar-nav">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="nav-group">
                {!collapsed && (
                  <div className="nav-group-label">
                    {categoryLabels[category]}
                  </div>
                )}
                <ul>
                  {items.map(item => (
                    <li key={item.path}>
                      <NavLink
                        to={item.path}
                        className={({ isActive }) => 
                          `sidebar-link ${isActive ? 'active' : ''}`
                        }
                        onClick={() => setIsOpen(false)}
                        title={collapsed ? item.label : ''}
                        data-testid={item.path === '/dashboard' ? 'nav-dashboard' : undefined}
                      >
                        <i className={item.icon}></i>
                        <span className="link-text">{item.label}</span>
                        {item.badge && (
                          <span className="nav-badge">{item.badge}</span>
                        )}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        )}

        <div className="sidebar-footer">
          {user ? (
            <div className="sidebar-user" ref={userMenuRef}>
              <button
                className="sidebar-user-trigger"
                onClick={toggleUserMenu}
                aria-expanded={userMenuOpen}
                aria-haspopup="true"
                title={collapsed ? `Hi, ${user.username}` : ''}
              >
                <div className="user-avatar">
                  {user.avatar ? (
                    <img src={user.avatar} alt={`${user.username}'s avatar`} />
                  ) : (
                    <i className="fas fa-user"></i>
                  )}
                  <div className="user-status-indicator"></div>
                </div>
                {!collapsed && (
                  <>
                    <div className="user-meta">
                      <span className="user-greet">Welcome back,</span>
                      <span className="user-name">{user.username}</span>
                    </div>
                    <i className={`user-caret fas ${userMenuOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i>
                  </>
                )}
              </button>

              <div className={`user-menu ${userMenuOpen ? 'open' : ''}`}>
                <div className="user-menu-header">
                  <div className="user-avatar-large">
                    {user.avatar ? (
                      <img src={user.avatar} alt={`${user.username}'s avatar`} />
                    ) : (
                      <i className="fas fa-user"></i>
                    )}
                  </div>
                  <div className="user-info">
                    <strong>{user.username}</strong>
                    <span>{user.email}</span>
                  </div>
                </div>
                
                <div className="user-menu-divider"></div>
                
                <Link 
                  to="/profile" 
                  className="user-menu-item" 
                  onClick={() => setUserMenuOpen(false)}
                >
                  <i className="fas fa-user-circle"></i>
                  <span>View Profile</span>
                </Link>
                
                <Link 
                  to="/settings" 
                  className="user-menu-item" 
                  onClick={() => setUserMenuOpen(false)}
                >
                  <i className="fas fa-cog"></i>
                  <span>Settings</span>
                </Link>
                
                <Link 
                  to="/help" 
                  className="user-menu-item" 
                  onClick={() => setUserMenuOpen(false)}
                >
                  <i className="fas fa-question-circle"></i>
                  <span>Help & Support</span>
                </Link>
                
                <div className="user-menu-divider"></div>
                
                <button 
                  className="user-menu-item logout-item" 
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="sidebar-auth">
              <Link to="/login" className="btn btn-outline" onClick={() => setIsOpen(false)}>
                <i className="fas fa-sign-in-alt"></i>
                <span>Sign In</span>
              </Link>
              <Link to="/register" className="btn btn-primary" onClick={() => setIsOpen(false)}>
                <i className="fas fa-user-plus"></i>
                <span>Get Started</span>
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay" 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        ></div>
      )}

      {/* Quick actions floating button for mobile */}
      {user && (
        <div className="quick-actions-mobile">
          <button 
            className="quick-action-btn" 
            title="Add Expense"
            onClick={() => navigate('/expenses/add')}
            data-testid="quick-add-expense"
          >
            <i className="fas fa-plus"></i>
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;