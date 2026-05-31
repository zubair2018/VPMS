import { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const RegisterPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form state
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'visitor',
  });

  // Error state
  const [error, setError] = useState('');

  // Handle input change
  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', form);

      // Save token + user in context
      login(res.data);

      // Go to dashboard
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not register user');
    }
  };

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <h2>Register</h2>

        {error && <p className="error-text">{error}</p>}

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full name"
            value={form.name}
            onChange={handleChange}
          />

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

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="admin">Admin</option>
            <option value="employee">Employee</option>
            <option value="security">Security</option>
            <option value="visitor">Visitor</option>
          </select>

          <button type="submit" className="btn">
            Create account
          </button>
        </form>

        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;