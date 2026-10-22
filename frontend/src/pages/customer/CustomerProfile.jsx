import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/client';
import { User, Save, CheckCircle, AlertCircle } from 'lucide-react';

const CustomerProfile = () => {
  const { user, updateUserProfile } = useAuth();

  const [username, setUsername] = useState(user?.username || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [city, setCity] = useState(user?.city || '');
  const [address, setAddress] = useState(user?.address || '');

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      const res = await api.patch('/accounts/profile/', {
        username,
        phone,
        city,
        address,
      });
      updateUserProfile(res.data);
      setMessage('Profile updated successfully!');
    } catch (err) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <User size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Customer Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage your contact details and default address</p>
          </div>
        </div>

        {message && (
          <div style={{ background: 'rgba(16, 185, 129, 0.15)', border: '1px solid rgba(16, 185, 129, 0.3)', color: '#10B981', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle size={16} /> {message}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#F87171', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Email (Read-only)</label>
            <input type="email" disabled className="input-field" value={user?.email || ''} style={{ opacity: 0.6 }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Username</label>
            <input
              type="text"
              required
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Phone</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>City</label>
              <input
                type="text"
                className="input-field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Address</label>
            <textarea
              rows={3}
              className="input-field"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
            <Save size={18} /> {saving ? 'Saving Changes...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CustomerProfile;
