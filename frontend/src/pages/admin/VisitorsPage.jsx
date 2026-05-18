import { useEffect, useState } from 'react';
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
      const response = await api.get('/visitors');
      setVisitors(response.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load visitors');
    }
  };

  useEffect(() => {
    loadVisitors();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setError('');

      const formData = new FormData();
      formData.append('fullName', form.fullName);
      formData.append('email', form.email);
      formData.append('phone', form.phone);
      formData.append('company', form.company);
      formData.append('purpose', form.purpose);
      formData.append('idProofType', form.idProofType);
      formData.append('idProofNumber', form.idProofNumber);

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
      loadVisitors();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save visitor');
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = (path) => {
    if (!path) {
      return '';
    }

    const baseUrl = api.defaults.baseURL
      ? api.defaults.baseURL.replace('/api', '')
      : '';

    return baseUrl + path;
  };

  const filteredVisitors = visitors.filter((visitor) => {
    const text =
      (
        (visitor.fullName || '') +
        ' ' +
        (visitor.email || '') +
        ' ' +
        (visitor.phone || '') +
        ' ' +
        (visitor.company || '') +
        ' ' +
        (visitor.purpose || '')
      ).toLowerCase();

    return text.includes(search.toLowerCase());
  });

  const exportCsv = () => {
    if (filteredVisitors.length === 0) {
      alert('No visitors to export');
      return;
    }

    let csv =
      'Full Name,Email,Phone,Company,Purpose,ID Proof Type,ID Proof Number,Created At\n';

    filteredVisitors.forEach((visitor) => {
      csv +=
        `${visitor.fullName || ''},` +
        `${visitor.email || ''},` +
        `${visitor.phone || ''},` +
        `${visitor.company || ''},` +
        `${visitor.purpose || ''},` +
        `${visitor.idProofType || ''},` +
        `${visitor.idProofNumber || ''},` +
        `${visitor.createdAt ? new Date(visitor.createdAt).toLocaleString() : ''}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'visitors.csv';
    link.click();

    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="grid two">
      <form className="card form-card" onSubmit={submitHandler}>
        <h3>Add visitor</h3>

        <input
          type="text"
          name="fullName"
          placeholder="Full name"
          value={form.fullName}
          onChange={handleChange}
          required
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="phone"
          placeholder="Phone"
          value={form.phone}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="company"
          placeholder="Company"
          value={form.company}
          onChange={handleChange}
        />

        <input
          type="text"
          name="purpose"
          placeholder="Purpose"
          value={form.purpose}
          onChange={handleChange}
          required
        />

        <input
          type="text"
          name="idProofType"
          placeholder="ID proof type"
          value={form.idProofType}
          onChange={handleChange}
        />

        <input
          type="text"
          name="idProofNumber"
          placeholder="ID proof number"
          value={form.idProofNumber}
          onChange={handleChange}
        />

        <label>Visitor photo</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setPhoto(e.target.files[0])}
        />

        <label>ID proof image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setIdProof(e.target.files[0])}
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
              placeholder="Search visitor"
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