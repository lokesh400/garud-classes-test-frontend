import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiLogOut,
  FiUser,
  FiHome,
  FiDatabase,
  FiUpload,
  FiFileText,
  FiLayers,
  FiBookOpen,
  FiMenu,
  FiX,
} from 'react-icons/fi';

const adminLinks = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/admin/question-bank', label: 'Question Bank', icon: FiDatabase },
  { to: '/admin/upload', label: 'Upload', icon: FiUpload },
  { to: '/admin/tests', label: 'Tests', icon: FiFileText },
  { to: '/admin/test-series', label: 'Test Series', icon: FiLayers },
];

const studentLinks = [
  { to: '/student/dashboard', label: 'Dashboard', icon: FiHome },
  { to: '/student/purchase-series', label: 'Purchase Series', icon: FiLayers },
  { to: '/student/tests', label: 'My Tests', icon: FiBookOpen },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) return null;

  const links = user.role === 'admin' ? adminLinks : studentLinks;

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white">
      {/* Brand */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
          <span className="text-2xl font-extrabold text-garud-highlight tracking-wide">GARUD</span>
          <span className="text-xs text-gray-400 mt-1">Classes</span>
        </Link>
        {/* Close button on mobile */}
        <button
          onClick={() => setMobileOpen(false)}
          className="md:hidden text-gray-400 hover:text-garud-highlight"
        >
          <FiX className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive =
            location.pathname === link.to || location.pathname.startsWith(link.to + '/');

          return (
            <Link
              key={link.to}
              to={link.to}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-garud-highlight text-white shadow-lg shadow-garud-highlight/20'
                  : 'bg-transparent text-primary-600 hover:bg-gray-100 hover:text-garud-highlight'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="border-t border-gray-200 px-4 py-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-garud-accent flex items-center justify-center text-white font-bold text-sm">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm bg-transparent border border-garud-highlight text-garud-highlight rounded-lg transition-colors hover:bg-gray-100 hover:text-garud-highlight"
        >
          <FiLogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white text-garud-highlight flex items-center justify-between px-4 h-14 shadow-lg">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-xl font-extrabold text-garud-highlight">GARUD</span>
          <span className="text-xs text-gray-400">Classes</span>
        </Link>
        <button onClick={() => setMobileOpen(true)} className="text-gray-400 hover:text-garud-highlight">
          <FiMenu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <aside
        className={`md:hidden fixed top-0 left-0 z-50 h-full w-64 bg-white transform transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:left-0 md:w-60 bg-white z-30 border-r border-gray-200">
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;
