import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function VisitorRegisterPage() {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    company: '',
    purpose: '',
    idProofType: '',
    idProofNumber: ''
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const { data } = await axios.post(`${API_BASE_URL}/visitors/public/register`, form);
      setMessage(data.message || 'Visitor registered successfully');
      setForm({
        fullName: '',
        email: '',
        phone: '',
        company: '',
        purpose: '',
        idProofType: '',
        idProofNumber: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.heading}>Visitor Pre-Registration</h1>
        <p style={styles.subtext}>
          Fill this form before visiting. Your pass can be issued by the office after approval.
        </p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            name="fullName"
            placeholder="Full Name"
            value={form.fullName}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="phone"
            placeholder="Phone"
            value={form.phone}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="company"
            placeholder="Company"
            value={form.company}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="purpose"
            placeholder="Purpose of Visit"
            value={form.purpose}
            onChange={handleChange}
            style={styles.input}
            required
          />

          <input
            name="idProofType"
            placeholder="ID Proof Type (Aadhaar, Passport, etc.)"
            value={form.idProofType}
            onChange={handleChange}
            style={styles.input}
          />

          <input
            name="idProofNumber"
            placeholder="ID Proof Number"
            value={form.idProofNumber}
            onChange={handleChange}
            style={styles.input}
          />

          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Submitting...' : 'Register Visitor'}
          </button>
        </form>

        {message ? <p style={styles.success}>{message}</p> : null}
        {error ? <p style={styles.error}>{error}</p> : null}
      </div>
    </div>
  );
}

const styles = {
  wrapper: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f4f7fb',
    padding: '24px'
  },
  card: {
    width: '100%',
    maxWidth: '520px',
    background: '#fff',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)'
  },
  heading: {
    marginBottom: '8px'
  },
  subtext: {
    marginBottom: '20px',
    color: '#555'
  },
  form: {
    display: 'grid',
    gap: '12px'
  },
  input: {
    padding: '12px',
    borderRadius: '8px',
    border: '1px solid #ccc',
    fontSize: '14px'
  },
  button: {
    padding: '12px',
    borderRadius: '8px',
    border: 'none',
    background: '#0f62fe',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer'
  },
  success: {
    marginTop: '16px',
    color: 'green'
  },
  error: {
    marginTop: '16px',
    color: 'crimson'
  }
};

export default VisitorRegisterPage;