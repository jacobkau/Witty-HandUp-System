import { Link, useLocation } from "react-router-dom";
import useAuth from "../features/auth/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Helper function for active tab styling
  const getTabClass = (path) => {
    const isActive = location.pathname === path;
    return `px-3 py-2 rounded-md text-sm font-medium transition-colors ${
      isActive 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-700 hover:bg-gray-100'
    }`;
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-100">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <img
            src="/help.png"
            alt="Witty HandUp logo"
            className="h-8 w-auto object-contain"
          />
          <span className="text-xl font-bold text-blue-600">
            Witty HandUp System
          </span>
        </Link>

        {/* Navigation */}
        <div className="flex items-center space-x-4">
          {!user ? (
            /* PUBLIC TABS (Not logged in) */
            <div className="flex items-center space-x-2">
              <Link to="/" className={getTabClass('/')}>
                Home
              </Link>
              <Link to="/login" className={getTabClass('/login')}>
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Register
              </Link>
            </div>
          ) : (
            /* PRIVATE APP TABS (Logged in) */
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Link
                  to="/tasks"
                  className={getTabClass('/tasks')}
                >
                  Dashboard
                </Link>
                <Link
                  to="/tasks/new"
                  className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                >
                  Add a New Task
                </Link>
                <Link
                  to="/users/profile"
                  className={getTabClass('/users/profile')}
                >
                  My Profile
                </Link>

                {/* ADMIN ONLY TAB */}
                {user.role === 'admin' && (
                  <Link
                    to="/admin"
                    className={getTabClass('/admin')}
                  >
                    Admin Panel
                  </Link>
                )}
              </div>

              {/* User Info & Logout */}
              <div className="flex items-center space-x-3 pl-4 border-l border-gray-200">
                <span className="text-gray-700 text-sm font-medium hidden md:inline">
                  Hello, {user.name} {user.role === 'admin' && '👑'}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
