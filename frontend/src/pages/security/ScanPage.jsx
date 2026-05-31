import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../../api/axios';

const ScanPage = () => {
  const [passNumber, setPassNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  const scanPass = async (value) => {
    const finalValue = value?.trim();

    if (!finalValue || loading) return;

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setResult(null);

      const res = await api.post('/passes/scan', {
        passNumber: finalValue,
      });

      setPassNumber(finalValue);
      setResult(res.data);
      setSuccess(res.data?.message || 'Scan recorded successfully');
      setScannerPaused(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to scan pass');
      setSuccess('');
      setResult(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await scanPass(passNumber);
  };

  const handleQrScan = async (detectedCodes) => {
    if (!detectedCodes || detectedCodes.length === 0 || loading || scannerPaused) {
      return;
    }

    const scannedValue = detectedCodes[0]?.rawValue;

    if (!scannedValue) return;

    await scanPass(scannedValue);
  };

  const handleQrError = () => {
    setError('Camera could not start. Please allow camera access or use manual entry.');
  };

  const resetForm = () => {
    setPassNumber('');
    setResult(null);
    setError('');
    setSuccess('');
    setScannerPaused(false);
  };

  const getStatusClass = (status) => {
    const value = String(status || '').toLowerCase();

    if (value === 'checked-in') return 'status-badge approved';
    if (value === 'checked-out') return 'status-badge rejected';
    return 'status-badge pending';
  };

  return (
    <div className="scan-page-shell">
      <div className="card scan-card">
        <div className="section-head">
          <div>
            <h3>Scan pass</h3>
            <p>Use the device camera or enter the pass number manually.</p>
          </div>
        </div>

        <div className="scanner-box">
          <Scanner
            onScan={handleQrScan}
            onError={handleQrError}
            formats={['qr_code']}
            paused={scannerPaused}
            scanDelay={1500}
            constraints={{ facingMode: 'environment' }}
            components={{
              audio: true,
              finder: true,
              torch: true,
            }}
            styles={{
              container: {
                width: '100%',
                minHeight: '280px',
              },
            }}
          />
        </div>

        <div className="scanner-helper-row">
          <span className={scannerPaused ? 'badge' : 'muted-text'}>
            {scannerPaused ? 'Scanner paused after successful read' : 'Scanner is active'}
          </span>

          {scannerPaused && (
            <button
              type="button"
              className="btn secondary small"
              onClick={() => setScannerPaused(false)}
            >
              Resume scanner
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit}>
          <label htmlFor="passNumber">Manual pass number</label>
          <input
            id="passNumber"
            placeholder="Enter pass number"
            value={passNumber}
            onChange={(e) => setPassNumber(e.target.value)}
          />

          <div className="action-row">
            <button className="btn" type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Record scan'}
            </button>

            <button
              type="button"
              className="btn secondary"
              onClick={resetForm}
            >
              Reset
            </button>
          </div>
        </form>

        {error && (
          <div className="auth-error-box" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="success-box">
            {success}
          </div>
        )}

        {result && (
          <div className="scan-result-card">
            <div className="appointment-head">
              <div>
                <strong>{result.pass?.passNumber || 'N/A'}</strong>
                <p className="muted-text">
                  Visitor: {result.pass?.visitor?.fullName || 'N/A'}
                </p>
              </div>

              <span className={getStatusClass(result.pass?.status)}>
                {result.pass?.status || 'N/A'}
              </span>
            </div>

            <div className="visitor-meta-grid">
              <span>
                <strong>Visitor:</strong> {result.pass?.visitor?.fullName || 'N/A'}
              </span>
              <span>
                <strong>Email:</strong> {result.pass?.visitor?.email || 'N/A'}
              </span>
              <span>
                <strong>Pass:</strong> {result.pass?.passNumber || 'N/A'}
              </span>
              <span>
                <strong>Status:</strong> {result.pass?.status || 'N/A'}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScanPage;