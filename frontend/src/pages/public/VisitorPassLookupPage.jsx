import { useState } from 'react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

function VisitorPassLookupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data } = await axios.get(`${API_BASE_URL}/visitors/public/pass`, {
        params: { email }
      });
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Pass not found');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.heading}>View Digital Pass</h1>
        <p style={styles.subtext}>
          Enter your email to check whether your visitor pass has been issued.
        </p>

        <form onSubmit={handleSearch} style={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Checking...' : 'Check Pass'}
          </button>
        </form>

        {error ? <p style={styles.error}>{error}</p> : null}

        {result ? (
          <div style={styles.resultBox}>
            <h2 style={styles.resultHeading}>Pass Found</h2>
            <p><strong>Name:</strong> {result.visitor.fullName}</p>
            <p><strong>Email:</strong> {result.visitor.email}</p>
            <p><strong>Phone:</strong> {result.visitor.phone}</p>
            <p><strong>Purpose:</strong> {result.visitor.purpose}</p>
            <p><strong>Pass Number:</strong> {result.pass.passNumber}</p>
            <p><strong>Status:</strong> {result.pass.status}</p>
            <p><strong>Valid From:</strong> {new Date(result.pass.validFrom).toLocaleString()}</p>
            <p><strong>Valid Till:</strong> {new Date(result.pass.validTill).toLocaleString()}</p>

            {result.pass.qrCodeDataUrl ? (
              <div style={styles.qrBox}>
                <img
                  src={result.pass.qrCodeDataUrl}
                  alt="Visitor QR Code"
                  style={styles.qrImage}
                />
              </div>
            ) : null}

            {result.pass.pdfPath ? (
              <a
                href={`${API_BASE_URL.replace('/api', '')}${result.pass.pdfPath}`}
                target="_blank"
                rel="noreferrer"
                style={styles.link}
              >
                Open PDF Pass
              </a>
            ) : null}
          </div>
        ) : null}
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
    maxWidth: '560px',
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
    background: '#198754',
    color: '#fff',
    fontWeight: '600',
    cursor: 'pointer'
  },
  error: {
    marginTop: '16px',
    color: 'crimson'
  },
  resultBox: {
    marginTop: '20px',
    padding: '16px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    background: '#fafafa'
  },
  resultHeading: {
    marginBottom: '12px'
  },
  qrBox: {
    marginTop: '16px'
  },
  qrImage: {
    width: '180px',
    height: '180px',
    objectFit: 'contain'
  },
  link: {
    display: 'inline-block',
    marginTop: '16px',
    color: '#0f62fe',
    fontWeight: '600',
    textDecoration: 'none'
  }
};

export default VisitorPassLookupPage;