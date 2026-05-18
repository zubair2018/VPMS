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

      setPasses(passesRes.data || []);
      setVisitors(visitorsRes.data || []);
      setAppointments(appointmentsRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const getFileUrl = (path) => {
    if (!path) return '';

    const baseUrl = api.defaults.baseURL
      ? api.defaults.baseURL.replace('/api', '')
      : '';

    return baseUrl + path;
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!visitorId || !validFrom || !validTill) {
      setError('Please fill all required fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await api.post('/passes', {
        visitorId: visitorId,
        appointmentId: appointmentId,
        validFrom: validFrom,
        validTill: validTill,
      });

      setVisitorId('');
      setAppointmentId('');
      setValidFrom('');
      setValidTill('');

      loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate pass');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (passes.length === 0) {
      alert('No passes to export');
      return;
    }

    let csv =
      'Pass Number,Visitor Name,Visitor Email,Status,Valid From,Valid Till,Appointment Host,Issued By,Created At\n';

    passes.forEach((pass) => {
      csv +=
        `${pass.passNumber || ''},` +
        `${pass.visitor?.fullName || ''},` +
        `${pass.visitor?.email || ''},` +
        `${pass.status || ''},` +
        `${pass.validFrom ? new Date(pass.validFrom).toLocaleString() : ''},` +
        `${pass.validTill ? new Date(pass.validTill).toLocaleString() : ''},` +
        `${pass.appointment?.host?.name || ''},` +
        `${pass.issuedBy?.name || ''},` +
        `${pass.createdAt ? new Date(pass.createdAt).toLocaleString() : ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'passes.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  };

  const approvedAppointments = appointments.filter(
    (item) => item.status === 'approved'
  );

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <h3>Issue pass</h3>

        <label>Visitor</label>
        <select value={visitorId} onChange={(e) => setVisitorId(e.target.value)}>
          <option value="">Select visitor</option>
          {visitors.map((visitor) => (
            <option key={visitor._id} value={visitor._id}>
              {visitor.fullName} - {visitor.email}
            </option>
          ))}
        </select>

        <label>Approved appointment (optional)</label>
        <select
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        >
          <option value="">Select approved appointment</option>
          {approvedAppointments.map((item) => (
            <option key={item._id} value={item._id}>
              {(item.visitor && item.visitor.fullName) || 'Visitor'} -{' '}
              {(item.host && item.host.name) || 'Host'}
            </option>
          ))}
        </select>

        <label>Valid from</label>
        <input
          type="datetime-local"
          value={validFrom}
          onChange={(e) => setValidFrom(e.target.value)}
        />

        <label>Valid till</label>
        <input
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
        <div className="page-header-row">
          <h3>Issued passes</h3>
          <button type="button" className="btn" onClick={exportCsv}>
            Export CSV
          </button>
        </div>

        <div className="list-stack">
          {passes.length === 0 ? (
            <p>No passes found.</p>
          ) : (
            passes.map((pass) => (
              <div className="list-item" key={pass._id}>
                <strong>{pass.passNumber}</strong>

                <span>Visitor: {pass.visitor?.fullName || 'N/A'}</span>
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
                    alt="QR Code"
                    className="pass-qr-image"
                  />
                ) : null}

                {pass.pdfPath ? (
                  <a
                    href={getFileUrl(pass.pdfPath)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF pass
                  </a>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PassesPage;