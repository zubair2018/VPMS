import { useEffect, useState } from 'react';
import api from '../../api/axios';

const DashboardPage = () => {
  const [stats, setStats] = useState({ visitors: 0, appointments: 0, issuedPasses: 0, checkedIns: 0, recentLogs: [] });

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => setStats(res.data)).catch(() => {});
  }, []);

  const cards = [
    ['Total Visitors', stats.visitors],
    ['Appointments', stats.appointments],
    ['Issued Passes', stats.issuedPasses],
    ['Checked In', stats.checkedIns]
  ];

  return (
    <div>
      <div className="grid four">
        {cards.map(([label, value]) => (
          <div className="card stat-card" key={label}>
            <p>{label}</p>
            <h3>{value}</h3>
          </div>
        ))}
      </div>

      <div className="card">
        <h3>Recent scans</h3>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Visitor</th>
                <th>Pass</th>
                <th>Action</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentLogs?.map((log) => (
                <tr key={log._id}>
                  <td>{log.pass?.visitor?.fullName || 'N/A'}</td>
                  <td>{log.pass?.passNumber || 'N/A'}</td>
                  <td>{log.action}</td>
                  <td>{new Date(log.time).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
