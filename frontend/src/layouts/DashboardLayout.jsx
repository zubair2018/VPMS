import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  // Safe fallback values
  const currentRole = user?.role || 'visitor';
  const currentName = user?.name || 'User';

  // Sidebar links based on user role
  const roleLinks = {
    admin: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/appointments', 'Appointments'],
      ['/passes', 'Passes'],
    ],
    security: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/passes', 'Passes'],
      ['/scan', 'Scan Pass'],
    ],
    employee: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/appointments', 'Appointments'],
    ],
    visitor: [['/', 'Dashboard']],
  };

  return (
    <div className="app-shell">
      {/* Left sidebar */}
      <aside className="sidebar">
        <div className="sidebar-top">
          <h2 className="brand-title">VPMS</h2>
          <p className="role-text">{currentRole}</p>
        </div>

        {/* Sidebar links */}
        <nav className="sidebar-nav">
          {roleLinks[currentRole].map(([to, label]) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                isActive ? 'nav-link active-link' : 'nav-link'
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Logout button */}
        <button onClick={logout} className="btn secondary logout-btn">
          Logout
        </button>
      </aside>

      {/* Right content area */}
      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>Visitor Pass Management</h1>
            <p>Welcome, {currentName}</p>
          </div>
        </header>

        <section className="page-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
};

export default DashboardLayout;