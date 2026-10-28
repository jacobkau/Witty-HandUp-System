import { Link } from "react-router-dom";
import useAuth from "../features/auth/useAuth";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
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

        <div className="flex items-center space-x-4">
          {user ? (
            <div className="flex items-center space-x-6">
              {/* Navigation Links for Logged-in Users */}
              <Link
                to="/tasks/new"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                Add a New Task
              </Link>
              <Link
                to="/users/profile"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                My Profile
              </Link>

              <Link
                to="/tasks"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                View Tasks
              </Link>

              <div className="flex items-center space-x-2">
                <span className="text-gray-700 hidden md:inline">
                  Hello, {user.name}
                </span>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-4">
              <Link
                to="/login"
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-3 py-2 rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
