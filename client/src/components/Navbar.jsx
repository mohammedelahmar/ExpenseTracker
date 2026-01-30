import React, { useState, useContext, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Home, 
  CreditCard, 
  BarChart2, 
  PieChart, 
  Tags, 
  Target, 
  RefreshCw, // Subscription icon alternative
  User, 
  Settings, 
  HelpCircle, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  LogIn,
  UserPlus,
  TrendingUp, // Reports icon
  Plus
} from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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

  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const touchMoved = useRef(false);

  const navigationItems = [
    {
      path: '/dashboard',
      label: 'Dashboard',
      icon: Home,
      category: 'main'
    },
    {
      path: '/expenses',
      label: 'Expenses',
      icon: CreditCard,
      category: 'main'
    },
    {
      path: '/reports',
      label: 'Reports',
      icon: TrendingUp, // Changed from chart-line to TrendingUp
      category: 'analytics'
    },
    {
      path: '/analytics',
      label: 'Analytics',
      icon: PieChart,
      category: 'analytics'
    },
    {
      path: '/categories',
      label: 'Categories',
      icon: Tags,
      category: 'settings'
    },
    {
      path: '/goals',
      label: 'Goals',
      icon: Target,
      category: 'planning'
    },
    {
      path: '/subscriptions',
      label: 'Subscriptions',
      icon: RefreshCw,
      category: 'planning'
    }
  ];

  // Apply body class for layout padding adjustment
  useEffect(() => {
    const updateLayout = () => {
      document.body.classList.remove('pl-[72px]', 'pl-[280px]');
      if (window.innerWidth >= 992) {
        document.body.classList.add(collapsed ? 'pl-[72px]' : 'pl-[280px]');
      }
    };
    
    updateLayout();
    window.addEventListener('resize', updateLayout);
    return () => {
      window.removeEventListener('resize', updateLayout);
      document.body.classList.remove('pl-[72px]', 'pl-[280px]');
    };
  }, [collapsed]);

  useEffect(() => {
    try {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(collapsed));
    } catch (error) {}
  }, [collapsed]);

  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location]);

  // Click outside listener
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
      if (isOpen) document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [userMenuOpen, isOpen]);

  // Resize listener
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 992 && isOpen) {
        setIsOpen(false);
      }
      if (window.innerWidth < 992 && collapsed) {
        setCollapsed(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, collapsed]);

  // Touch handlers
  useEffect(() => {
    if (window.innerWidth >= 992) return;

    const handleTouchStart = (e) => {
      touchStartX.current = e.touches[0].clientX;
      touchStartY.current = e.touches[0].clientY;
      touchMoved.current = false;
    };

    const handleTouchMove = (e) => {
      if (!touchStartX.current) return;
      touchMoved.current = true;
      const diffX = e.touches[0].clientX - touchStartX.current;
      const diffY = Math.abs(e.touches[0].clientY - touchStartY.current);

      if (Math.abs(diffX) > diffY && Math.abs(diffX) > 50) {
        if (!isOpen && touchStartX.current < 50 && diffX > 100) {
          e.preventDefault();
          setIsOpen(true);
        } else if (isOpen && diffX < -100) {
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
      console.error('Logout failed:', error);
    }
  };

  const toggleSidebar = () => {
    if (window.innerWidth >= 992) {
      setCollapsed(prev => !prev);
    }
  };

  const groupedItems = navigationItems.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
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
      {/* Mobile Toggle Button */}
      <button
        className={cn(
          "fixed top-4 left-4 z-[1100] p-2 rounded-lg transition-all duration-300 lg:hidden",
          isOpen ? "bg-red-500 text-white" : "bg-white text-gray-700 shadow-md"
        )}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        <Menu size={24} />
      </button>

      {/* Sidebar Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-[1000] lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          "fixed top-0 left-0 h-full z-[1001] bg-gradient-to-br from-primary-900 via-primary-800 to-primary-900 text-white transition-all duration-300 ease-in-out shadow-2xl border-r border-white/10 flex flex-col",
          collapsed ? "w-[72px]" : "w-[280px]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="h-[72px] flex items-center justify-between px-6 border-b border-white/10 bg-white/5">
          <Link to="/" className="flex items-center gap-3 overflow-hidden" onClick={() => setIsOpen(false)}>
            <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-tr from-accent-500 to-secondary-500 rounded-xl flex items-center justify-center shadow-lg border border-white/20">
              <BarChart2 className="text-white" size={20} />
            </div>
            <span className={cn(
              "font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300 transition-opacity duration-300",
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            )}>
              FinanceHub
            </span>
          </Link>

          <button
            onClick={toggleSidebar}
            className="hidden lg:flex w-8 h-8 items-center justify-center rounded-lg hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
          >
            {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>
        </div>

        {/* Navigation */}
        {user && (
          <nav className="flex-1 overflow-y-auto overflow-x-hidden p-4 space-y-6">
            {Object.entries(groupedItems).map(([category, items]) => (
              <div key={category}>
                {!collapsed && (
                  <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-3">
                    {categoryLabels[category]}
                  </h3>
                )}
                <ul className="space-y-1">
                  {items.map(item => {
                    const Icon = item.icon;
                    return (
                      <li key={item.path}>
                        <NavLink
                          to={item.path}
                          className={({ isActive }) => cn(
                            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                            isActive 
                              ? "bg-white/10 text-white shadow-sm border border-white/5" 
                              : "text-gray-400 hover:text-white hover:bg-white/5 hover:translate-x-1"
                          )}
                          onClick={() => setIsOpen(false)}
                          title={collapsed ? item.label : ''}
                        >
                          <Icon size={20} className={cn("flex-shrink-0 transition-transform duration-200 group-hover:scale-110")} />
                          <span className={cn(
                            "whitespace-nowrap transition-all duration-300",
                            collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100"
                          )}>
                            {item.label}
                          </span>
                        </NavLink>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>
        )}

        {/* Footer / User Profile */}
        <div className="p-4 border-t border-white/10 bg-black/10">
          {user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className={cn(
                  "w-full flex items-center gap-3 p-2 rounded-xl transition-all duration-200 hover:bg-white/10 border border-transparent hover:border-white/5",
                  userMenuOpen && "bg-white/10"
                )}
              >
                <div className="w-9 h-9 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white ring-2 ring-white/20">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="User" /> : <User size={18} />}
                </div>
                
                <div className={cn(
                  "flex-1 text-left overflow-hidden transition-all duration-300",
                  collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100 block"
                )}>
                  <p className="text-sm font-semibold truncate text-white">{user.username}</p>
                  <p className="text-xs text-gray-400 truncate">{user.email}</p>
                </div>

                {!collapsed && (
                  <div className="text-gray-400">
                    {userMenuOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
                  </div>
                )}
              </button>

              {/* User Dropdown */}
              <div
                className={cn(
                  "absolute bottom-full left-0 mb-2 w-full min-w-[240px] bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 transition-all duration-200 origin-bottom-left",
                  userMenuOpen ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-2 pointer-events-none"
                )}
                style={{ left: collapsed ? 'calc(100% + 10px)' : '0' }}
              >
                 <div className="flex items-center gap-3 p-3 border-b border-white/10 mb-2">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white ring-2 ring-white/20">
                      {user.avatar ? <img src={user.avatar} className="w-full h-full rounded-full object-cover" alt="User" /> : <User size={20} />}
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.username}</p>
                      <p className="text-xs text-gray-400">{user.email}</p>
                    </div>
                 </div>

                 <Link to="/profile" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                   <User size={16} /> Profile
                 </Link>
                 <Link to="/settings" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                   <Settings size={16} /> Settings
                 </Link>
                 <Link to="/help" className="flex items-center gap-3 px-3 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                   <HelpCircle size={16} /> Help
                 </Link>
                 
                 <div className="h-px bg-white/10 my-2" />
                 
                 <button 
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                >
                   <LogOut size={16} /> Sign Out
                 </button>
              </div>
            </div>
          ) : (
            <div className={cn("flex flex-col gap-2", collapsed ? "hidden" : "flex")}>
              <Link to="/login" className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors text-sm font-medium">
                <LogIn size={16} /> Sign In
              </Link>
              <Link to="/register" className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg bg-accent-600 hover:bg-accent-700 text-white transition-colors text-sm font-medium">
                <UserPlus size={16} /> Get Started
              </Link>
            </div>
          )}
        </div>
      </aside>

      {/* Quick Action Mobile */}
      {user && (
        <div className="fixed bottom-6 right-6 lg:hidden z-[1000]">
          <button 
            onClick={() => navigate('/expenses/add')}
            className="w-14 h-14 bg-accent-600 rounded-full shadow-lg shadow-accent-500/40 flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all"
          >
            <Plus size={28} />
          </button>
        </div>
      )}
    </>
  );
};

export default Navbar;