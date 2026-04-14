import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'ANALYST' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚔ WAR ROOM</div>
        <h2>Create Account</h2>
        {error && <p className="auth-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input
              type="text" name="username" value={form.username}
              onChange={handleChange} required autoComplete="username"
              placeholder="commander01"
            />
          </div>
          <div className="field">
            <label>Email</label>
            <input
              type="email" name="email" value={form.email}
              onChange={handleChange} required autoComplete="email"
              placeholder="commander@corp.com"
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input
              type="password" name="password" value={form.password}
              onChange={handleChange} required minLength={8}
              autoComplete="new-password" placeholder="min. 8 characters"
            />
          </div>
          <div className="field">
            <label>Role</label>
            <select name="role" value={form.role} onChange={handleChange}>
              <option value="ANALYST">ANALYST</option>
              <option value="COMMANDER">COMMANDER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Creating account…' : 'Join War Room'}
          </button>
        </form>
        <p className="auth-footer">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;