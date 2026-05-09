import { useEffect, useState } from 'react';
import api from '../../api/axios';

const PassesPage = () => {
  const [passes, setPasses] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [visitorId, setVisitorId] = useState('');
  const [appointmentId, setAppointmentId] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validTill, setValidTill] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setError('');

      const passesRes = await api.get('/passes');
      const visitorsRes = await api.get('/visitors');
      const appointmentsRes = await api.get('/appointments');

      setPasses(Array.isArray(passesRes.data) ? passesRes.data : []);
      setVisitors(Array.isArray(visitorsRes.data) ? visitorsRes.data : []);

      const approvedAppointments = Array.isArray(appointmentsRes.data)
        ? appointmentsRes.data.filter(function (item) {
            return item.status === 'approved';
          })
        : [];

      setAppointments(approvedAppointments);
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to load passes data'
      );
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!visitorId || !validFrom || !validTill) {
      setError('Please select visitor, valid from, and valid till.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/passes', {
        visitorId: visitorId,
        appointmentId: appointmentId,
        validFrom: validFrom,
        validTill: validTill
      });

      setVisitorId('');
      setAppointmentId('');
      setValidFrom('');
      setValidTill('');

      await loadData();
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to generate pass'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <h3>Issue pass</h3>

        <label htmlFor="visitorId">Visitor</label>
        <select
          id="visitorId"
          value={visitorId}
          onChange={(e) => setVisitorId(e.target.value)}
        >
          <option value="">Select visitor</option>
          {visitors.map(function (visitor) {
            return (
              <option key={visitor._id} value={visitor._id}>
                {visitor.fullName} - {visitor.email}
              </option>
            );
          })}
        </select>

        <label htmlFor="appointmentId">Approved appointment (optional)</label>
        <select
          id="appointmentId"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        >
          <option value="">Select approved appointment</option>
          {appointments.map(function (item) {
            return (
              <option key={item._id} value={item._id}>
                {(item.visitor && item.visitor.fullName) || 'Visitor'} - {(item.host && item.host.name) || 'Host'}
              </option>
            );
          })}
        </select>

        <label htmlFor="validFrom">Valid from</label>
        <input
          id="validFrom"
          type="datetime-local"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
        />

        <label htmlFor="validTill">Valid till</label>
        <input
          id="validTill"
          type="datetime-local"
          value={validTill}
          onChange={(e) => setValidTill(e.target.value)}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn" disabled={loading}>
          {loading ? 'Generating...' : 'Generate pass'}
        </button>
      </form>

      <div className="card">
        <h3>Issued passes</h3>

        <div className="list-stack">
          {passes.length === 0 ? (
            <p>No passes found.</p>
          ) : (
            passes.map(function (pass) {
              return (
                <div className="list-item" key={pass._id}>
                  <strong>{pass.passNumber}</strong>
                  <span>
                    Visitor: {(pass.visitor && pass.visitor.fullName) || 'N/A'}
                  </span>
                  <span>Status: {pass.status || 'N/A'}</span>
                  <span>
                    Valid till:{' '}
                    {pass.validTill
                      ? new Date(pass.validTill).toLocaleString()
                      : 'N/A'}
                  </span>

                  {pass.qrCodeDataUrl ? (
                    <img
                      src={pass.qrCodeDataUrl}
                      alt={pass.passNumber}
                      style={{ width: '140px', borderRadius: '12px' }}
                    />
                  ) : null}

                  {pass.pdfPath ? (
                    <a
                      href={`http://localhost:5000${pass.pdfPath}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open PDF pass
                    </a>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default PassesPage;