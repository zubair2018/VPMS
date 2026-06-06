import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const initialForm = {
  visitorId: '',
  appointmentId: '',
  validFrom: '',
  validTill: '',
};

const PassesPage = () => {
  const [passes, setPasses] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [form, setForm] = useState(initialForm);

  const [statusFilter, setStatusFilter] = useState('all');
  const [searchText, setSearchText] = useState('');

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchData = async () => {
    try {
      setPageLoading(true);
      setError('');

      const [passRes, visitorRes, appointmentRes] = await Promise.all([
        api.get('/passes'),
        api.get('/visitors'),
        api.get('/appointments'),
      ]);

      setPasses(Array.isArray(passRes.data) ? passRes.data : []);
      setVisitors(Array.isArray(visitorRes.data) ? visitorRes.data : []);
      setAppointments(Array.isArray(appointmentRes.data) ? appointmentRes.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load data');
    } finally {
      setPageLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'visitorId' ? { appointmentId: '' } : {}),
    }));

    if (error) setError('');
    if (success) setSuccess('');
  };

  const getFileLink = (filePath) => {
    if (!filePath) return '';

    const baseURL = api.defaults.baseURL
      ? api.defaults.baseURL.replace('/api', '')
      : '';

    return baseURL + filePath;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.visitorId || !form.validFrom || !form.validTill) {
      setError('Please fill all required fields');
      setSuccess('');
      return;
    }

    if (new Date(form.validFrom) > new Date(form.validTill)) {
      setError('Valid till must be after valid from');
      setSuccess('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      await api.post('/passes', form);

      setForm(initialForm);
      setSuccess('Pass generated successfully.');
      await fetchData();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not generate pass');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const approvedAppointments = useMemo(() => {
    return appointments.filter((item) => {
      const isApproved = item.status === 'approved';
      const sameVisitor = form.visitorId
        ? item?.visitor?._id === form.visitorId || item?.visitor === form.visitorId
        : true;

      return isApproved && sameVisitor;
    });
  }, [appointments, form.visitorId]);

  const filteredPasses = useMemo(() => {
    return passes.filter((item) => {
      const matchesStatus =
        statusFilter === 'all' ? true : item.status === statusFilter;

      const text = `
        ${item.passNumber || ''}
        ${item.visitor?.fullName || ''}
        ${item.visitor?.email || ''}
        ${item.issuedBy?.name || ''}
      `
        .toLowerCase()
        .trim();

      const matchesSearch = text.includes(searchText.toLowerCase());

      return matchesStatus && matchesSearch;
    });
  }, [passes, statusFilter, searchText]);

  const sortedPasses = useMemo(() => {
    return [...filteredPasses].sort((a, b) => {
      const aTime = a?.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b?.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });
  }, [filteredPasses]);

  const escapeCsvValue = (value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (sortedPasses.length === 0) {
      alert('No passes to export');
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

    const rows = sortedPasses.map((item) => [
      item.passNumber || '',
      item.visitor?.fullName || '',
      item.visitor?.email || '',
      item.status || '',
      item.validFrom ? new Date(item.validFrom).toLocaleString() : '',
      item.validTill ? new Date(item.validTill).toLocaleString() : '',
      item.appointment?.host?.name || '',
      item.issuedBy?.name || '',
      item.createdAt ? new Date(item.createdAt).toLocaleString() : '',
    ]);

    const csvText = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'passes.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(url);
  };

  const getStatusClass = (status) => {
    const value = String(status || 'issued').toLowerCase();

    if (value === 'checked-in') return 'status-badge approved';
    if (value === 'checked-out') return 'status-badge rejected';
    return 'status-badge pending';
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <h3>Issue pass</h3>
            <p>Create a visitor pass with optional appointment mapping.</p>
          </div>
        </div>

        <label htmlFor="visitorId">Visitor</label>
        <select
          id="visitorId"
          name="visitorId"
          value={form.visitorId}
          onChange={handleChange}
        >
          <option value="">Select visitor</option>
          {visitors.map((item) => (
            <option key={item._id} value={item._id}>
              {item.fullName} - {item.email}
            </option>
          ))}
        </select>

        <label htmlFor="appointmentId">Approved appointment (optional)</label>
        <select
          id="appointmentId"
          name="appointmentId"
          value={form.appointmentId}
          onChange={handleChange}
          disabled={!form.visitorId}
        >
          <option value="">
            {form.visitorId ? 'Select approved appointment' : 'Select visitor first'}
          </option>
          {approvedAppointments.map((item) => (
            <option key={item._id} value={item._id}>
              {item.visitor?.fullName || 'Visitor'} - {item.host?.name || 'Host'}
            </option>
          ))}
        </select>

        <label htmlFor="validFrom">Valid from</label>
        <input
          id="validFrom"
          name="validFrom"
          type="datetime-local"
          value={form.validFrom}
          onChange={handleChange}
        />

        <label htmlFor="validTill">Valid till</label>
        <input
          id="validTill"
          name="validTill"
          type="datetime-local"
          value={form.validTill}
          onChange={handleChange}
        />

        {error && <div className="auth-error-box">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Generating...' : 'Generate pass'}
        </button>
      </form>

      <div className="card">
        <div className="page-header-row">
          <div>
            <h3>Issued passes</h3>
            <p className="muted-text">
              Showing {sortedPasses.length} of {passes.length} passes
            </p>
          </div>

          <button type="button" className="btn" onClick={handleExportCsv}>
            Export CSV
          </button>
        </div>

        <div className="page-actions-row" style={{ marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search by pass number or visitor"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All status</option>
            <option value="issued">Issued</option>
            <option value="checked-in">Checked In</option>
            <option value="checked-out">Checked Out</option>
          </select>
        </div>

        {pageLoading ? (
          <p className="muted-text">Loading passes...</p>
        ) : sortedPasses.length === 0 ? (
          <div className="empty-state-box">
            <h4>No passes found</h4>
            <p>Try another filter or generate a new visitor pass.</p>
          </div>
        ) : (
          <div className="list-stack">
            {sortedPasses.map((item) => (
              <div className="list-item pass-item" key={item._id}>
                <div className="appointment-head">
                  <div>
                    <strong>{item.passNumber || 'No pass number'}</strong>
                    <p className="muted-text">
                      Visitor: {item.visitor?.fullName || 'N/A'}
                    </p>
                  </div>

                  <span className={getStatusClass(item.status)}>
                    {item.status || 'issued'}
                  </span>
                </div>

                <div className="visitor-meta-grid">
                  <span><strong>Email:</strong> {item.visitor?.email || 'N/A'}</span>
                  <span>
                    <strong>Valid from:</strong>{' '}
                    {item.validFrom ? new Date(item.validFrom).toLocaleString() : 'N/A'}
                  </span>
                  <span>
                    <strong>Valid till:</strong>{' '}
                    {item.validTill ? new Date(item.validTill).toLocaleString() : 'N/A'}
                  </span>
                  <span>
                    <strong>Host:</strong> {item.appointment?.host?.name || 'N/A'}
                  </span>
                  <span>
                    <strong>Issued by:</strong> {item.issuedBy?.name || 'N/A'}
                  </span>
                </div>

                <div className="pass-assets-row">
                  {item.qrCodeDataUrl && (
                    <img
                      src={item.qrCodeDataUrl}
                      alt={`QR for ${item.passNumber || 'visitor pass'}`}
                      className="pass-qr-image"
                    />
                  )}

                  <div className="action-row">
                    {item.pdfPath && (
                      <a
                        href={getFileLink(item.pdfPath)}
                        target="_blank"
                        rel="noreferrer"
                        className="btn secondary small"
                      >
                        Open PDF pass
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PassesPage;