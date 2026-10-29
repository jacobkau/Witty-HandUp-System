import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../features/auth/useAuth";
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { Badge, IconButton } from '@mui/material';
import api from "../../lib/api"; 

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread notifications count
  useEffect(() => {
    if (user) {
      const checkNotifs = async () => {
        try {
          const res = await api.get('/notifications');
          const unread = res.data.data.filter(n => !n.isRead).length;
          setUnreadCount(unread);
        } catch (err) {
          console.error(err);
        }
      };
      checkNotifs();
    }
  }, [user, location.pathname]); 

  const getTabClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  const getMobileTabClass = (path) => {
    const isActive = location.pathname === path;
    return `block px-4 py-3 rounded-md text-base font-medium transition-colors ${
      isActive ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  const closeMenu = () => setIsMobileMenuOpen(false);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        <Link to="/" className="flex items-center gap-2 z-50" onClick={closeMenu}>
          <img src="/help.png" alt="Witty HandUp logo" className="h-8 w-auto object-contain" />
          <span className="text-xl font-bold text-blue-600 tracking-tight">Witty HandUp</span>
        </Link>

        <div className="hidden md:flex items-center space-x-4">
          {!user ? (
            <div className="flex items-center space-x-2">
              <Link to="/" className={getTabClass('/')}>Home</Link>
              <Link to="/login" className={getTabClass('/login')}>Login</Link>
              <Link to="/register" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm">Register</Link>
            </div>
          ) : (
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link to="/tasks" className={getTabClass('/tasks')}>Dashboard</Link>
                <Link to="/tasks/new" className="px-3 py-2 rounded-md text-sm font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] transition-colors shadow-sm">Add Task</Link>
                <Link to="/users/profile" className={getTabClass('/users/profile')}>My Profile</Link>
                {user.role === 'admin' && <Link to="/admin" className={getTabClass('/admin')}>Admin Panel</Link>}
              </div>

              <div className="flex items-center space-x-4 pl-4 border-l border-gray-200">
                <IconButton component={Link} to="/notifications" size="small">
                  <Badge badgeContent={unreadCount} color="error">
                    <NotificationsIcon sx={{ color: '#64748b' }} />
                  </Badge>
                </IconButton>

                <span className="text-gray-700 text-sm font-medium">Hello, {user.name}</span>
                
                <button onClick={logout} className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors">Logout</button>
              </div>
            </div>
          )}
        </div>

        <div className="md:hidden flex items-center">
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-gray-700 hover:text-blue-600 focus:outline-none p-2">
            {isMobileMenuOpen ? <CloseIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-white border-b border-gray-200 shadow-lg py-4 px-4 flex flex-col space-y-2">
          {!user ? (
            <>
              <Link to="/" onClick={closeMenu} className={getMobileTabClass('/')}>Home</Link>
              <Link to="/login" onClick={closeMenu} className={getMobileTabClass('/login')}>Login</Link>
              <Link to="/register" onClick={closeMenu} className="block w-full text-center px-4 py-3 rounded-md text-base font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors">Register</Link>
            </>
          ) : (
            <>
              <div className="px-4 py-2 border-b border-gray-100 mb-2">
                <p className="text-sm text-gray-500">Logged in as</p>
                <p className="font-bold text-gray-800">{user.name}</p>
              </div>
              <Link to="/tasks" onClick={closeMenu} className={getMobileTabClass('/tasks')}>Dashboard</Link>
              <Link to="/tasks/new" onClick={closeMenu} className="block w-full text-center px-4 py-3 rounded-md text-base font-medium text-white bg-[#0f172a] hover:bg-[#1e293b] transition-colors">+ Add a New Task</Link>
              <Link to="/users/profile" onClick={closeMenu} className={getMobileTabClass('/users/profile')}>My Profile</Link>
              <Link to="/notifications" onClick={closeMenu} className={getMobileTabClass('/notifications')}>Notifications ({unreadCount})</Link>
              
              {user.role === 'admin' && <Link to="/admin" onClick={closeMenu} className={getMobileTabClass('/admin')}>Admin Panel</Link>}

              <div className="pt-2 mt-2 border-t border-gray-200">
                <button onClick={() => { logout(); closeMenu(); }} className="block w-full text-left px-4 py-3 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors">Logout</button>
              </div>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
