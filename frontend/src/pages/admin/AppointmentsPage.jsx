import { useEffect, useState } from 'react';
import api from '../../api/axios';

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [visitor, setVisitor] = useState('');
  const [host, setHost] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');

      const appointmentsRes = await api.get('/appointments');
      const visitorsRes = await api.get('/visitors');
      const employeesRes = await api.get('/users?role=employee');

      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setVisitors(Array.isArray(visitorsRes.data) ? visitorsRes.data : []);
      setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to load appointments data'
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!visitor || !host || !visitDate) {
      setError('Please select visitor, host, and visit date.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/appointments', {
        visitor: visitor,
        host: host,
        visitDate: visitDate,
        notes: notes
      });

      setVisitor('');
      setHost('');
      setVisitDate('');
      setNotes('');

      await loadData();
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to create appointment'
      );
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      setError('');
      await api.put('/appointments/' + id + '/status', { status: status });
      await loadData();
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to update status'
      );
    }
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <h3>Create appointment</h3>

        <label htmlFor="visitor">Visitor</label>
        <select
          id="visitor"
          value={visitor}
          onChange={(e) => setVisitor(e.target.value)}
        >
          <option value="">Select visitor</option>
          {visitors.map(function (item) {
            return (
              <option key={item._id} value={item._id}>
                {item.fullName} - {item.email}
              </option>
            );
          })}
        </select>

        <label htmlFor="host">Host employee</label>
        <select
          id="host"
          value={host}
          onChange={(e) => setHost(e.target.value)}
        >
          <option value="">Select employee host</option>
          {employees.map(function (employee) {
            return (
              <option key={employee._id} value={employee._id}>
                {employee.name} - {employee.email}
              </option>
            );
          })}
        </select>

        <label htmlFor="visitDate">Visit date and time</label>
        <input
          id="visitDate"
          type="datetime-local"
          value={visitDate}
          onChange={(e) => setVisitDate(e.target.value)}
        />

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          placeholder="Purpose details, floor, department, or special instructions"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create appointment'}
        </button>
      </form>

      <div className="card">
        <h3>Appointments</h3>

        <div className="list-stack">
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            appointments.map(function (item) {
              return (
                <div className="list-item" key={item._id}>
                  <strong>
                    {(item.visitor && item.visitor.fullName) || 'Unknown visitor'}
                  </strong>

                  <span>
                    Host: {(item.host && item.host.name) || 'Unknown employee'}
                  </span>

                  <span>
                    Email: {(item.host && item.host.email) || 'N/A'}
                  </span>

                  <span>
                    Visit:{' '}
                    {item.visitDate
                      ? new Date(item.visitDate).toLocaleString()
                      : 'N/A'}
                  </span>

                  <span className="badge">{item.status || 'pending'}</span>

                  <div className="action-row">
                    <button
                      type="button"
                      className="btn small"
                      onClick={() => changeStatus(item._id, 'approved')}
                    >
                      Approve
                    </button>

                    <button
                      type="button"
                      className="btn secondary small"
                      onClick={() => changeStatus(item._id, 'rejected')}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;