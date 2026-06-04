import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Store form values
  const [form, setForm] = useState({
    email: '',
    password: '',
  });

  // Store error message
  const [error, setError] = useState('');

  // Update form when user types
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Run when form is submitted
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // Send login data to backend
      const res = await axios.post('http://localhost:5000/api/auth/login', form);

      // Save token and user data in AuthContext + localStorage
      login(res.data);

      // Go to dashboard after successful login
      navigate('/');
    } catch (err) {
      // Show error from backend or default message
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Login</h2>

        {/* Show error if login fails */}
        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
          />

          <button type="submit" className="btn">
            Login
          </button>
        </form>

        <p>
          Don&apos;t have an account? <Link to="/register">Register</Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;