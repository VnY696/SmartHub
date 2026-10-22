import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState('customer');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);

    try {
      await register({
        username,
        email,
        phone,
        city,
        address,
        password,
        confirm_password: confirmPassword,
        role,
      });

      setSuccess('Account created successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error('Registration error:', err);
      const errData = err.response?.data?.errors || err.response?.data;
      if (typeof errData === 'object') {
        const firstKey = Object.keys(errData)[0];
        const val = errData[firstKey];
        setError(`${firstKey}: ${Array.isArray(val) ? val[0] : val}`);
      } else {
        setError(err.response?.data?.message || 'Registration failed.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '520px', margin: '60px auto', padding: '0 24px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px auto' }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.8rem' }}>Create Your Account</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Join SmartHub as a customer or service provider</p>
        </div>

        {/* Role Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '24px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: 'var(--radius-sm)' }}>
          <button
            type="button"
            className={`btn ${role === 'customer' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => setRole('customer')}
          >
            I am a Customer
          </button>
          <button
            type="button"
            className={`btn ${role === 'provider' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '6px' }}
            onClick={() => setRole('provider')}
          >
            I am a Provider
          </button>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {success && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> {success}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Username</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="johndoe"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Phone Number</label>
              <input
                type="tel"
                required
                className="input-field"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>City</label>
              <input
                type="text"
                required
                className="input-field"
                placeholder="e.g. New York"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Address</label>
            <input
              type="text"
              className="input-field"
              placeholder="Street address..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
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
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-muted)' }}>Confirm Password</label>
              <input
                type="password"
                required
                className="input-field"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn btn-primary btn-lg" style={{ marginTop: '8px', width: '100%' }}>
            {submitting ? 'Creating Account...' : <><UserPlus size={18} /> Register as {role}</>}
          </button>
        </form>

        <p style={{ marginTop: '24px', textAlign: 'center', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
