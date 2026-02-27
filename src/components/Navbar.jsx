import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiLogOut, FiUser } from 'react-icons/fi';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  return (
    <nav className="bg-garud-dark text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-garud-highlight">GARUD</span>
              <span className="text-sm text-gray-300">Classes</span>
            </Link>

            {user.role === 'admin' && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <NavLink to="/admin/dashboard" current={location.pathname}>
                  Dashboard
                </NavLink>
                <NavLink to="/admin/question-bank" current={location.pathname}>
                  Question Bank
                </NavLink>
                <NavLink to="/admin/upload" current={location.pathname}>
                  Upload
                </NavLink>
                <NavLink to="/admin/tests" current={location.pathname}>
                  Tests
                </NavLink>
              </div>
            )}

            {user.role === 'student' && (
              <div className="hidden md:flex items-center space-x-1 ml-8">
                <NavLink to="/student/dashboard" current={location.pathname}>
                  Dashboard
                </NavLink>
                <NavLink to="/student/tests" current={location.pathname}>
                  My Tests
                </NavLink>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <FiUser className="w-4 h-4" />
              <span>{user.name}</span>
              <span className="px-2 py-0.5 text-xs bg-garud-accent rounded-full">
                {user.role}
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-1 px-3 py-1.5 text-sm bg-garud-highlight hover:bg-red-600 rounded transition-colors"
            >
              <FiLogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavLink = ({ to, current, children }) => {
  const isActive = current === to || current.startsWith(to + '/');
  return (
    <Link
      to={to}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-garud-accent text-white'
          : 'text-gray-300 hover:bg-garud-mid hover:text-white'
      }`}
    >
      {children}
    </Link>
  );
};

export default Navbar;
