import { useEffect, useMemo, useState } from 'react';
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

      const [passesRes, visitorsRes, appointmentsRes] = await Promise.all([
        api.get('/passes'),
        api.get('/visitors'),
        api.get('/appointments'),
      ]);

      setPasses(Array.isArray(passesRes.data) ? passesRes.data : []);
      setVisitors(Array.isArray(visitorsRes.data) ? visitorsRes.data : []);
      setAppointments(Array.isArray(appointmentsRes.data) ? appointmentsRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load passes data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const approvedAppointments = useMemo(() => {
    return appointments.filter((item) => item.status === 'approved');
  }, [appointments]);

  const getFileUrl = (path) => {
    if (!path) {
      return '';
    }

    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

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
        visitorId,
        appointmentId,
        validFrom,
        validTill,
      });

      setVisitorId('');
      setAppointmentId('');
      setValidFrom('');
      setValidTill('');

      await loadData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate pass');
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = () => {
    if (passes.length === 0) {
      alert('No pass data to export');
      return;
    }

    const headers = [
      'Pass Number',
      'Visitor Name',
      'Visitor Email',
      'Status',
      'Valid From',
      'Valid Till',
      'Appointment Host',
      'Issued By',
      'Created At',
    ];

    const rows = passes.map((pass) => [
      pass.passNumber || '',
      pass.visitor?.fullName || '',
      pass.visitor?.email || '',
      pass.status || '',
      pass.validFrom ? new Date(pass.validFrom).toLocaleString() : '',
      pass.validTill ? new Date(pass.validTill).toLocaleString() : '',
      pass.appointment?.host?.name || '',
      pass.issuedBy?.name || '',
      pass.createdAt ? new Date(pass.createdAt).toLocaleString() : '',
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) =>
        row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'passes-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
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
          {visitors.map((visitor) => (
            <option key={visitor._id} value={visitor._id}>
              {visitor.fullName} - {visitor.email}
            </option>
          ))}
        </select>

        <label htmlFor="appointmentId">Approved appointment (optional)</label>
        <select
          id="appointmentId"
          value={appointmentId}
          onChange={(e) => setAppointmentId(e.target.value)}
        >
          <option value="">Select approved appointment</option>
          {approvedAppointments.map((item) => (
            <option key={item._id} value={item._id}>
              {item.visitor?.fullName || 'Visitor'} - {item.host?.name || 'Host'}
            </option>
          ))}
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

                <span>
                  Visitor: {pass.visitor?.fullName || 'N/A'}
                </span>

                <span>
                  Status: {pass.status || 'N/A'}
                </span>

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