import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const DashboardPage = () => {
  const { user, token } = useAuth();

  // Dashboard stats state
  const [stats, setStats] = useState({
    totalVisitors: 0,
    totalPasses: 0,
    checkedInPasses: 0,
    checkedOutPasses: 0,
    issuedPasses: 0,
    expiredPasses: 0,
    recentVisitors: [],
    recentPasses: [],
  });

  // UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Function to fetch dashboard data from backend
  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await axios.get(
        'http://localhost:5000/api/dashboard/stats',
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setStats(response.data);
    } catch (err) {
      console.error('Dashboard fetch error:', err);
      setError(err.response?.data?.message || 'Could not load dashboard stats.');
    } finally {
      setLoading(false);
    }
  };

  // Load dashboard data when token is available
  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    } else {
      setLoading(false);
      setError('User token not found. Please login again.');
    }
  }, [token]);

  // Simple helper array for stat cards
  const statCards = [
    { title: 'Total Visitors', value: stats.totalVisitors },
    { title: 'Total Passes', value: stats.totalPasses },
    { title: 'Checked In', value: stats.checkedInPasses },
    { title: 'Checked Out', value: stats.checkedOutPasses },
    { title: 'Issued Passes', value: stats.issuedPasses },
    { title: 'Expired Passes', value: stats.expiredPasses },
  ];

  // Show loading UI
  if (loading) {
    return (
      <div className="card">
        <h2>Dashboard</h2>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* Dashboard header card */}
      <div className="card page-hero">
        <div>
          <p className="page-kicker">Overview</p>
          <h2>Dashboard</h2>
          <p className="muted-text">
            Welcome, {user?.name || 'User'} ({user?.role || 'visitor'})
          </p>
        </div>

        <button className="btn secondary" onClick={fetchDashboardStats}>
          Refresh Data
        </button>
      </div>

      {/* Error message */}
      {error && <div className="auth-error-box">{error}</div>}

      {/* Statistics cards */}
      <div className="grid two">
        {statCards.map((card) => (
          <div className="card stat-card" key={card.title}>
            <p className="stat-label">{card.title}</p>
            <h3 className="stat-value">{card.value}</h3>
          </div>
        ))}
      </div>

      {/* Recent visitors section */}
      <div className="card">
        <h3>Recent Visitors</h3>

        {stats.recentVisitors.length === 0 ? (
          <p>No recent visitors found.</p>
        ) : (
          <div className="list-stack">
            {stats.recentVisitors.map((visitor) => (
              <div key={visitor._id} className="list-item">
                <strong>{visitor.fullName}</strong>
                <span>Email: {visitor.email}</span>
                <span>Phone: {visitor.phone}</span>
                <span>Purpose: {visitor.purpose}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent passes section */}
      <div className="card">
        <h3>Recent Passes</h3>

        {stats.recentPasses.length === 0 ? (
          <p>No recent passes found.</p>
        ) : (
          <div className="list-stack">
            {stats.recentPasses.map((pass) => (
              <div key={pass._id} className="list-item">
                <strong>{pass.passNumber}</strong>
                <span>Status: {pass.status}</span>
                <span>Visitor: {pass.visitor?.fullName || 'No visitor'}</span>
                <span>
                  Valid Till:{' '}
                  {pass.validTill
                    ? new Date(pass.validTill).toLocaleString()
                    : 'N/A'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;