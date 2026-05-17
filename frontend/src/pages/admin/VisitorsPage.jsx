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
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadVisitors = async () => {
    try {
      setError('');
      const res = await api.get('/visitors');
      setVisitors(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load visitors');
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  // Filter visitors from the main list instead of storing another copy in state.
  const filteredVisitors = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return visitors;
    }

    return visitors.filter((visitor) => {
      const valuesToSearch = [
        visitor.fullName,
        visitor.email,
        visitor.phone,
        visitor.company,
        visitor.purpose,
      ];

      return valuesToSearch.some((value) =>
        String(value || '').toLowerCase().includes(term)
      );
    });
  }, [search, visitors]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e, setter) => {
    const file = e.target.files?.[0] || null;
    setter(file);
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value || '');
      });

      if (photo) {
        formData.append('photo', photo);
      }

      if (idProof) {
        formData.append('idProof', idProof);
      }

      await api.post('/visitors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setForm(initialForm);
      setPhoto(null);
      setIdProof(null);
      await loadVisitors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to create visitor');
    } finally {
      setLoading(false);
    }
  };

  // Build a full file URL from the API base instead of hardcoding localhost.
  const getFileUrl = (path) => {
    if (!path) {
      return '';
    }

    const baseUrl = api.defaults.baseURL?.replace('/api', '') || '';
    return `${baseUrl}${path}`;
  };

  const exportCsv = () => {
    if (filteredVisitors.length === 0) {
      alert('No visitor data to export');
      return;
    }

    const headers = [
      'Full Name',
      'Email',
      'Phone',
      'Company',
      'Purpose',
      'ID Proof Type',
      'ID Proof Number',
      'Created At',
    ];

    const rows = filteredVisitors.map((visitor) => [
      visitor.fullName || '',
      visitor.email || '',
      visitor.phone || '',
      visitor.company || '',
      visitor.purpose || '',
      visitor.idProofType || '',
      visitor.idProofNumber || '',
      visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : '',
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
    link.download = 'visitors-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <h3>Add visitor</h3>

        <input
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />

        <input
          name="purpose"
          placeholder="Purpose"
          value={form.purpose}
          onChange={handleChange}
          required
        />

        <input
          name="idProofType"
          placeholder="ID proof type"
          value={form.idProofType}
          onChange={handleChange}
        />

        <input
          name="idProofNumber"
          placeholder="ID proof number"
          value={form.idProofNumber}
          onChange={handleChange}
        />

        <label>Visitor photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setPhoto)}
        />

        <label>ID proof image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => handleFileChange(e, setIdProof)}
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save visitor'}
        </button>
      </form>

      <div className="card">
        <div className="page-header-row">
          <h3>Visitors list</h3>

          <div className="page-actions-row">
            <input
              type="text"
              placeholder="Search by name, email, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <button type="button" className="btn" onClick={exportCsv}>
              Export CSV
            </button>
          </div>
        </div>

        <p className="muted-text">
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </p>

        <div className="list-stack">
          {filteredVisitors.length === 0 ? (
            <p>No visitors found.</p>
          ) : (
            filteredVisitors.map((visitor) => (
              <div className="list-item" key={visitor._id}>
                <strong>{visitor.fullName}</strong>
                <span>{visitor.email}</span>
                <span>{visitor.phone}</span>
                <span>{visitor.company || 'No company'}</span>
                <span>{visitor.purpose}</span>
                <span>
                  {visitor.createdAt
                    ? new Date(visitor.createdAt).toLocaleString()
                    : 'No date'}
                </span>

                {visitor.photoUrl ? (
                  <a
                    href={getFileUrl(visitor.photoUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open photo
                  </a>
                ) : null}

                {visitor.idProofUrl ? (
                  <a
                    href={getFileUrl(visitor.idProofUrl)}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open ID proof
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

export default VisitorsPage;