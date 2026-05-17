import { useState } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import api from '../../api/axios';

const ScanPage = () => {
  const [passNumber, setPassNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [scannerPaused, setScannerPaused] = useState(false);

  const scanPass = async (value) => {
    const finalValue = value?.trim();

    if (!finalValue || loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await api.post('/passes/scan', {
        passNumber: finalValue,
      });

      setPassNumber(finalValue);
      setResult(res.data);

      // Pause scanner after one successful read so it does not fire again and again
      setScannerPaused(true);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to scan pass');
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

    if (!scannedValue) {
      return;
    }

    await scanPass(scannedValue);
  };

  const handleQrError = (err) => {
    console.error('QR scanner error:', err);
    setError('Camera could not start. Please allow camera access or use manual entry.');
  };

  const resetForm = () => {
    setPassNumber('');
    setResult(null);
    setError('');
    setScannerPaused(false);
  };

  return (
    <div className="card form-card narrow">
      <h3>Scan pass</h3>

      <p className="muted-text" style={{ marginBottom: '12px' }}>
        Scan the QR code using your camera, or enter the pass number manually.
      </p>

      <div style={{ marginBottom: '16px', borderRadius: '12px', overflow: 'hidden' }}>
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

      <form onSubmit={handleSubmit}>
        <input
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

      {error ? (
        <p className="error-text" style={{ marginTop: '12px' }}>
          {error}
        </p>
      ) : null}

      {result ? (
        <div className="result-box">
          <p>
            <strong>{result.message || 'Scan recorded successfully'}</strong>
          </p>

          <p>
            Pass: {result.pass?.passNumber || 'N/A'}
          </p>

          <p>
            Status: {result.pass?.status || 'N/A'}
          </p>

          <p>
            Visitor: {result.pass?.visitor?.fullName || 'N/A'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ScanPage;