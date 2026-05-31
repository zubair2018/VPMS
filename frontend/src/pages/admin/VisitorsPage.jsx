import { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  purpose: '',
  idProofType: '',
  idProofNumber: '',
};

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);

  const [loading, setLoading] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchVisitors();
  }, []);

  const fetchVisitors = async () => {
    try {
      setPageLoading(true);
      setError('');
      const res = await api.get('/visitors');
      setVisitors(res.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not load visitors');
    } finally {
      setPageLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (error) setError('');
    if (success) setSuccess('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.fullName || !form.email || !form.phone || !form.purpose) {
      setError('Please fill all required fields');
      setSuccess('');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const data = new FormData();
      data.append('fullName', form.fullName);
      data.append('email', form.email);
      data.append('phone', form.phone);
      data.append('company', form.company);
      data.append('purpose', form.purpose);
      data.append('idProofType', form.idProofType);
      data.append('idProofNumber', form.idProofNumber);

      if (photo) data.append('photo', photo);
      if (idProof) data.append('idProof', idProof);

      await api.post('/visitors', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm(initialForm);
      setPhoto(null);
      setIdProof(null);
      setSuccess('Visitor saved successfully.');

      fetchVisitors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Could not save visitor');
      setSuccess('');
    } finally {
      setLoading(false);
    }
  };

  const getFileLink = (filePath) => {
    if (!filePath) return '';

    const base = api.defaults.baseURL
      ? api.defaults.baseURL.replace('/api', '')
      : '';

    return base + filePath;
  };

  const filteredVisitors = useMemo(() => {
    return visitors.filter((item) => {
      const combinedText = `
        ${item.fullName || ''}
        ${item.email || ''}
        ${item.phone || ''}
        ${item.company || ''}
        ${item.purpose || ''}
      `
        .toLowerCase()
        .trim();

      return combinedText.includes(searchText.toLowerCase());
    });
  }, [visitors, searchText]);

  const escapeCsvValue = (value) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };

  const handleExportCsv = () => {
    if (filteredVisitors.length === 0) {
      alert('No data to export');
      return;
    }

    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Company',
      'Purpose',
      'ID Type',
      'ID Number',
      'Created At',
    ];

    const rows = filteredVisitors.map((v) => [
      v.fullName || '',
      v.email || '',
      v.phone || '',
      v.company || '',
      v.purpose || '',
      v.idProofType || '',
      v.idProofNumber || '',
      v.createdAt ? new Date(v.createdAt).toLocaleString() : '',
    ]);

    const csvText = [
      headers.map(escapeCsvValue).join(','),
      ...rows.map((row) => row.map(escapeCsvValue).join(',')),
    ].join('\n');

    const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
    const fileUrl = window.URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = 'visitors.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    window.URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="grid two visitors-page">
      <form className="card form-card" onSubmit={handleSubmit}>
        <div className="section-head">
          <div>
            <h3>Add visitor</h3>
            <p>Enter visitor details and upload optional identity files.</p>
          </div>
        </div>

        <label htmlFor="fullName">Full name *</label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          placeholder="Enter full name"
          value={form.fullName}
          onChange={handleChange}
        />

        <label htmlFor="email">Email *</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter email"
          value={form.email}
          onChange={handleChange}
        />

        <label htmlFor="phone">Phone *</label>
        <input
          id="phone"
          name="phone"
          type="text"
          placeholder="Enter phone number"
          value={form.phone}
          onChange={handleChange}
        />

        <label htmlFor="company">Company</label>
        <input
          id="company"
          name="company"
          type="text"
          placeholder="Enter company name"
          value={form.company}
          onChange={handleChange}
        />

        <label htmlFor="purpose">Purpose *</label>
        <input
          id="purpose"
          name="purpose"
          type="text"
          placeholder="Enter visit purpose"
          value={form.purpose}
          onChange={handleChange}
        />

        <label htmlFor="idProofType">ID proof type</label>
        <input
          id="idProofType"
          name="idProofType"
          type="text"
          placeholder="Example: CNIC, Passport, Driving License"
          value={form.idProofType}
          onChange={handleChange}
        />

        <label htmlFor="idProofNumber">ID proof number</label>
        <input
          id="idProofNumber"
          name="idProofNumber"
          type="text"
          placeholder="Enter ID proof number"
          value={form.idProofNumber}
          onChange={handleChange}
        />

        <label htmlFor="photo">Visitor photo</label>
        <input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files?.[0] || null)}
        />

        <label htmlFor="idProof">ID proof image</label>
        <input
          id="idProof"
          type="file"
          accept="image/*"
          onChange={(e) => setIdProof(e.target.files?.[0] || null)}
        />

        {error && <div className="auth-error-box" role="alert">{error}</div>}
        {success && <div className="success-box">{success}</div>}

        <button className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save visitor'}
        </button>
      </form>

      <div className="card">
        <div className="page-header-row">
          <div>
            <h3>Visitors list</h3>
            <p className="muted-text">
              Showing {filteredVisitors.length} of {visitors.length} visitors
            </p>
          </div>

          <div className="page-actions-row">
            <input
              type="text"
              placeholder="Search visitor"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />

            <button type="button" className="btn" onClick={handleExportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        {pageLoading ? (
          <p className="muted-text">Loading visitors...</p>
        ) : filteredVisitors.length === 0 ? (
          <div className="empty-state-box">
            <h4>No visitors found</h4>
            <p>Try a different search or add a new visitor from the form.</p>
          </div>
        ) : (
          <div className="list-stack">
            {filteredVisitors.map((item) => (
              <div className="list-item visitor-item" key={item._id}>
                <div className="visitor-item-top">
                  <div>
                    <strong>{item.fullName || 'No name'}</strong>
                    <p className="muted-text">{item.purpose || 'No purpose provided'}</p>
                  </div>
                  <span className="badge">
                    {item.company || 'No company'}
                  </span>
                </div>

                <div className="visitor-meta-grid">
                  <span><strong>Email:</strong> {item.email || 'N/A'}</span>
                  <span><strong>Phone:</strong> {item.phone || 'N/A'}</span>
                  <span><strong>ID Type:</strong> {item.idProofType || 'N/A'}</span>
                  <span><strong>ID No:</strong> {item.idProofNumber || 'N/A'}</span>
                  <span>
                    <strong>Created:</strong>{' '}
                    {item.createdAt ? new Date(item.createdAt).toLocaleString() : 'No date'}
                  </span>
                </div>

                <div className="action-row">
                  {item.photoUrl && (
                    <a
                      href={getFileLink(item.photoUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn secondary btn.small"
                    >
                      Open photo
                    </a>
                  )}

                  {item.idProofUrl && (
                    <a
                      href={getFileLink(item.idProofUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn secondary btn.small"
                    >
                      Open ID proof
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitorsPage;