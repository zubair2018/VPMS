import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const roleLinks = {
    admin: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/appointments', 'Appointments'],
      ['/passes', 'Passes']
    ],
    security: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/passes', 'Passes'],
      ['/scan', 'Scan Pass']
    ],
    employee: [
      ['/', 'Dashboard'],
      ['/visitors', 'Visitors'],
      ['/appointments', 'Appointments']
    ],
    visitor: [['/', 'Dashboard']]
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div>
          <h2>VPMS</h2>
          <p>{user?.role}</p>
        </div>
        <nav>
          {roleLinks[user?.role || 'visitor'].map(([to, label]) => (
            <NavLink key={to} to={to} end className="nav-link">
              {label}
            </NavLink>
          ))}
        </nav>
        <button onClick={logout} className="btn secondary">Logout</button>
      </aside>
      <main className="main-panel">
        <header className="topbar">
          <div>
            <h1>Visitor Pass Management</h1>
            <p>Welcome, {user?.name}</p>
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
