import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogIn, AlertCircle } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const user = await login(email, password);
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'provider') {
        navigate('/provider/dashboard');
      } else {
        navigate('/customer/bookings');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.detail || err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '440px', margin: '80px auto', padding: '0 24px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '36px', textAlign: 'center' }}>
        <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', boxShadow: 'var(--shadow-glow)' }}>
          <Sparkles size={24} color="#fff" />
        </div>

        <h2 style={{ fontSize: '1.8rem', marginBottom: '8px' }}>Welcome Back</h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '28px' }}>Log in to access your SmartHub account</p>

        {searchParams.get('expired') && (
          <div style={{ background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.3)', color: 'var(--status-pending)', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px' }}>
            Session expired. Please log in again.
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'left' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Email Address</label>
            <input
              type="email"
              required
              className="input-field"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Password</label>
            <input
              type="password"
              required
              className="input-field"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '8px', width: '100%' }}>
            {submitting ? 'Logging in...' : <><LogIn size={18} /> Log In</>}
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
