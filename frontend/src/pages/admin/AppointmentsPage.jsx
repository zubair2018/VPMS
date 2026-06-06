import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const initialForm = {
  visitor: '',
  host: '',
  visitDate: '',
  notes: '',
};

const AppointmentsPage = () => {
  const [appointments, setAppointments] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [statusLoadingId, setStatusLoadingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadData = async () => {
    try {
      setPageLoading(true);
      setError('');

      const [appointmentsRes, visitorsRes, employeesRes] = await Promise.all([
        api.get('/appointments'),
        api.get('/visitors'),
        api.get('/users?role=employee'),
      ]);

      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
      setVisitors(Array.isArray(visitorsRes.data) ? visitorsRes.data : []);
      setEmployees(Array.isArray(employeesRes.data) ? employeesRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load appointments data');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });

    if (error) setError('');
    if (success) setSuccess('');
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!form.visitor || !form.host || !form.visitDate) {
      setError('Please select visitor, host, and visit date.');
      setSuccess('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.post('/appointments', form);

      setForm(initialForm);
      setSuccess('Appointment created successfully.');
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create appointment');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const changeStatus = async (id, status) => {
    try {
      setStatusLoadingId(id);
      setError('');
      setSuccess('');

      await api.put(`/appointments/${id}/status`, { status });

      setSuccess(`Appointment ${status} successfully.`);
      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update status');
    } finally {
      setStatusLoadingId('');
    }
  };

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => {
      const aTime = a?.visitDate ? new Date(a.visitDate).getTime() : 0;
      const bTime = b?.visitDate ? new Date(b.visitDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [appointments]);

  const getStatusClass = (status) => {
    const value = String(status || 'pending').toLowerCase();

    if (value === 'approved') return 'status-badge approved';
    if (value === 'rejected') return 'status-badge rejected';
    return 'status-badge pending';
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <div className="section-head">
          <div>
            <h3>Create appointment</h3>
            <p>Schedule a visitor meeting with an employee host.</p>
          </div>
        </div>

        <label htmlFor="visitor">Visitor</label>
        <select
          id="visitor"
          name="visitor"
          value={form.visitor}
          onChange={handleChange}
        >
          <option value="">Select visitor</option>
          {visitors.map((item) => (
            <option key={item._id} value={item._id}>
              {item.fullName} - {item.email}
            </option>
          ))}
        </select>

        <label htmlFor="host">Host employee</label>
        <select
          id="host"
          name="host"
          value={form.host}
          onChange={handleChange}
        >
          <option value="">Select employee host</option>
          {employees.map((employee) => (
            <option key={employee._id} value={employee._id}>
              {employee.name} - {employee.email}
            </option>
          ))}
        </select>

        <label htmlFor="visitDate">Visit date and time</label>
        <input
          id="visitDate"
          name="visitDate"
          type="datetime-local"
          value={form.visitDate}
          onChange={handleChange}
        />

        <label htmlFor="notes">Notes</label>
        <textarea
          id="notes"
          name="notes"
          placeholder="Purpose details or instructions"
          value={form.notes}
          onChange={handleChange}
        />

        {error && <div className="auth-error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Creating...' : 'Create appointment'}
        </button>
      </form>

      <div className="card">
        <div className="section-head">
          <div>
            <h3>Appointments</h3>
            <p>Review meetings and update approval status.</p>
          </div>
        </div>

        {pageLoading ? (
          <p className="muted-text">Loading appointments...</p>
        ) : sortedAppointments.length === 0 ? (
          <div className="empty-state-box">
            <h4>No appointments found</h4>
            <p>Create a new appointment using the form.</p>
          </div>
        ) : (
          <div className="list-stack">
            {sortedAppointments.map((item) => {
              const currentStatus = String(item.status || 'pending').toLowerCase();

              return (
                <div className="list-item appointment-item" key={item._id}>
                  <div className="appointment-head">
                    <div>
                      <strong>{item.visitor?.fullName || 'Unknown visitor'}</strong>
                      <p className="muted-text">
                        Host: {item.host?.name || 'Unknown employee'}
                      </p>
                    </div>

                    <span className={getStatusClass(currentStatus)}>
                      {currentStatus}
                    </span>
                  </div>

                  <div className="visitor-meta-grid">
                    <span>
                      <strong>Host email:</strong> {item.host?.email || 'N/A'}
                    </span>
                    <span>
                      <strong>Visit:</strong>{' '}
                      {item.visitDate
                        ? new Date(item.visitDate).toLocaleString()
                        : 'N/A'}
                    </span>
                    <span>
                      <strong>Notes:</strong> {item.notes || 'No notes'}
                    </span>
                  </div>

                  {currentStatus === 'pending' && (
                    <div className="action-row">
                      <button
                        type="button"
                        className="btn small"
                        disabled={statusLoadingId === item._id}
                        onClick={() => changeStatus(item._id, 'approved')}
                      >
                        {statusLoadingId === item._id ? 'Updating...' : 'Approve'}
                      </button>

                      <button
                        type="button"
                        className="btn secondary small"
                        disabled={statusLoadingId === item._id}
                        onClick={() => changeStatus(item._id, 'rejected')}
                      >
                        {statusLoadingId === item._id ? 'Updating...' : 'Reject'}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;