import { useEffect, useState } from 'react';
import api from '../../api/axios';

const initialForm = {
  fullName: '',
  email: '',
  phone: '',
  company: '',
  purpose: '',
  idProofType: '',
  idProofNumber: ''
};

const VisitorsPage = () => {
  const [visitors, setVisitors] = useState([]);
  const [filteredVisitors, setFilteredVisitors] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(initialForm);
  const [photo, setPhoto] = useState(null);
  const [idProof, setIdProof] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Keep this hard-coded to avoid env issues for now
  const fileBaseUrl = 'http://localhost:5000';

  const loadVisitors = async () => {
    try {
      setError('');
      const res = await api.get('/visitors');
      const data = Array.isArray(res.data) ? res.data : [];
      setVisitors(data);
      setFilteredVisitors(data);
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to load visitors'
      );
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  useEffect(() => {
    const term = search.toLowerCase().trim();

    if (!term) {
      setFilteredVisitors(visitors);
      return;
    }

    const filtered = visitors.filter(function (visitor) {
      const fullName =
        visitor.fullName && typeof visitor.fullName === 'string'
          ? visitor.fullName.toLowerCase()
          : '';
      const email =
        visitor.email && typeof visitor.email === 'string'
          ? visitor.email.toLowerCase()
          : '';
      const phone =
        visitor.phone && typeof visitor.phone === 'string'
          ? visitor.phone.toLowerCase()
          : '';
      const company =
        visitor.company && typeof visitor.company === 'string'
          ? visitor.company.toLowerCase()
          : '';
      const purpose =
        visitor.purpose && typeof visitor.purpose === 'string'
          ? visitor.purpose.toLowerCase()
          : '';

      return (
        fullName.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        company.includes(term) ||
        purpose.includes(term)
      );
    });

    setFilteredVisitors(filtered);
  }, [search, visitors]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();

      Object.keys(form).forEach(function (key) {
        formData.append(key, form[key] || '');
      });

      if (photo) {
        formData.append('photo', photo);
      }

      if (idProof) {
        formData.append('idProof', idProof);
      }

      await api.post('/visitors', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setForm(initialForm);
      setPhoto(null);
      setIdProof(null);
      await loadVisitors();
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to create visitor'
      );
    } finally {
      setLoading(false);
    }
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
      'Created At'
    ];

    const rows = filteredVisitors.map(function (visitor) {
      return [
        visitor.fullName || '',
        visitor.email || '',
        visitor.phone || '',
        visitor.company || '',
        visitor.purpose || '',
        visitor.idProofType || '',
        visitor.idProofNumber || '',
        visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : ''
      ];
    });

    const csvRows = [
      headers.join(','),
      ...rows.map(function (row) {
        return row
          .map(function (value) {
            return '"' + String(value).replace(/"/g, '""') + '"';
          })
          .join(',');
      })
    ];

    const blob = new Blob([csvRows.join('\n')], {
      type: 'text/csv;charset=utf-8;'
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
          onChange={(e) =>
            setPhoto(
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
        />

        <label>ID proof image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setIdProof(
              e.target.files && e.target.files[0] ? e.target.files[0] : null
            )
          }
        />

        {error ? <p className="error-text">{error}</p> : null}

        <button className="btn" disabled={loading}>
          {loading ? 'Saving...' : 'Save visitor'}
        </button>
      </form>

      <div className="card">
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px'
          }}
        >
          <h3 style={{ margin: 0 }}>Visitors list</h3>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
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

        <p style={{ marginBottom: '12px' }}>
          Showing {filteredVisitors.length} of {visitors.length} visitors
        </p>

        <div className="list-stack">
          {filteredVisitors.length === 0 ? (
            <p>No visitors found.</p>
          ) : (
            filteredVisitors.map(function (visitor) {
              return (
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
                      href={fileBaseUrl + visitor.photoUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open photo
                    </a>
                  ) : null}

                  {visitor.idProofUrl ? (
                    <a
                      href={fileBaseUrl + visitor.idProofUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open ID proof
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

export default VisitorsPage;