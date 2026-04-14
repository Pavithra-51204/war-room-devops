import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SEVERITY_COLORS = { LOW: '#22c55e', MEDIUM: '#eab308', HIGH: '#f97316', CRITICAL: '#ef4444' };

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">⚔</span>
        <span className="brand-name">WAR ROOM</span>
      </div>
      <div className="navbar-links">
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/incidents">Incidents</Link>
      </div>
      <div className="navbar-user">
        {user && (
          <>
            <span className="user-role" style={{ color: '#94a3b8' }}>
              {user.role} · {user.username}
            </span>
            <button className="btn-logout" onClick={handleLogout}>Logout</button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
