import { useState } from 'react';
import axios from 'axios';
import './VisitorPassLookupPage.css';

const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api';

function VisitorPassLookupPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);

  const resetMessages = () => {
    setError('');
    setResult(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setError('Please enter your email');
      setResult(null);
      return;
    }

    try {
      setLoading(true);
      resetMessages();

      const response = await axios.get(`${API_BASE_URL}/visitors/public/pass`, {
        params: { email: trimmedEmail },
      });

      setResult(response.data);
    } catch (err) {
      setResult(null);
      setError(err?.response?.data?.message || 'Pass not found');
    } finally {
      setLoading(false);
    }
  };

  const getPdfUrl = () => {
    if (!result?.pass?.pdfPath) {
      return '';
    }

    return `${API_BASE_URL.replace('/api', '')}${result.pass.pdfPath}`;
  };

  return (
    <div className="pass-lookup-page">
      <div className="pass-lookup-card">
        <h1 className="pass-lookup-title">View Digital Pass</h1>

        <p className="pass-lookup-subtext">
          Enter your email to check whether your visitor pass has been issued.
        </p>

        <form onSubmit={handleSearch} className="pass-lookup-form">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="pass-lookup-input"
            required
          />

          <button
            type="submit"
            className="pass-lookup-button"
            disabled={loading}
          >
            {loading ? 'Checking...' : 'Check Pass'}
          </button>
        </form>

        {error ? <p className="pass-lookup-error">{error}</p> : null}

        {result ? (
          <div className="pass-lookup-result">
            <h2 className="pass-lookup-result-title">Pass Found</h2>

            <p><strong>Name:</strong> {result.visitor?.fullName || 'N/A'}</p>
            <p><strong>Email:</strong> {result.visitor?.email || 'N/A'}</p>
            <p><strong>Phone:</strong> {result.visitor?.phone || 'N/A'}</p>
            <p><strong>Purpose:</strong> {result.visitor?.purpose || 'N/A'}</p>
            <p><strong>Pass Number:</strong> {result.pass?.passNumber || 'N/A'}</p>
            <p><strong>Status:</strong> {result.pass?.status || 'N/A'}</p>
            <p>
              <strong>Valid From:</strong>{' '}
              {result.pass?.validFrom
                ? new Date(result.pass.validFrom).toLocaleString()
                : 'N/A'}
            </p>
            <p>
              <strong>Valid Till:</strong>{' '}
              {result.pass?.validTill
                ? new Date(result.pass.validTill).toLocaleString()
                : 'N/A'}
            </p>

            {result.pass?.qrCodeDataUrl ? (
              <div className="pass-lookup-qr-box">
                <img
                  src={result.pass.qrCodeDataUrl}
                  alt="Visitor QR Code"
                  className="pass-lookup-qr-image"
                />
              </div>
            ) : null}

            {result.pass?.pdfPath ? (
              <a
                href={getPdfUrl()}
                target="_blank"
                rel="noreferrer"
                className="pass-lookup-link"
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

export default VisitorPassLookupPage;