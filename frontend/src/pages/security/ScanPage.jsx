import { useState } from 'react';
import api from '../../api/axios';

const ScanPage = () => {
  const [passNumber, setPassNumber] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const scanPass = async (value) => {
    if (!value || loading) {
      return;
    }

    try {
      setLoading(true);
      setError('');
      setResult(null);

      const res = await api.post('/passes/scan', {
        passNumber: value
      });

      setResult(res.data);
    } catch (err) {
      setError(
        (err &&
          err.response &&
          err.response.data &&
          err.response.data.message) ||
          'Failed to scan pass'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await scanPass(passNumber);
  };

  const resetForm = () => {
    setPassNumber('');
    setResult(null);
    setError('');
  };

  return (
    <div className="card form-card narrow">
      <h3>Scan pass</h3>

      <p style={{ marginBottom: '12px', color: '#667085' }}>
        Enter the pass number manually and record the scan.
      </p>

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
            Pass:{' '}
            {result.pass && result.pass.passNumber
              ? result.pass.passNumber
              : 'N/A'}
          </p>

          <p>
            Status:{' '}
            {result.pass && result.pass.status ? result.pass.status : 'N/A'}
          </p>

          <p>
            Visitor:{' '}
            {result.pass &&
            result.pass.visitor &&
            result.pass.visitor.fullName
              ? result.pass.visitor.fullName
              : 'N/A'}
          </p>
        </div>
      ) : null}
    </div>
  );
};

export default ScanPage;