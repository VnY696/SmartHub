import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Briefcase, Save, CheckCircle, AlertCircle } from 'lucide-react';

const ProviderProfile = () => {
  const [businessName, setBusinessName] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [experienceYears, setExperienceYears] = useState(0);
  const [skills, setSkills] = useState('');
  const [isAvailable, setIsAvailable] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/accounts/providers/me/');
        const p = res.data;
        setBusinessName(p.business_name || '');
        setDescription(p.description || '');
        setPhone(p.phone || '');
        setEmail(p.email || '');
        setCity(p.city || '');
        setAddress(p.address || '');
        setExperienceYears(p.experience_years || 0);
        setSkills(p.skills || '');
        setIsAvailable(p.is_available ?? true);
      } catch (err) {
        console.error('Failed to load provider profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setSaving(true);

    try {
      await api.patch('/accounts/providers/me/', {
        business_name: businessName,
        description,
        phone,
        email,
        city,
        address,
        experience_years: Number(experienceYears),
        skills,
        is_available: isAvailable,
      });
      setMessage('Business profile updated successfully!');
    } catch (err) {
      console.error('Provider profile update error:', err);
      setError(err.response?.data?.message || 'Failed to update business profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading business profile...</div>;
  }

  return (
    <div style={{ maxWidth: '650px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div className="glass-panel" style={{ padding: '36px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Briefcase size={20} color="#fff" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem' }}>Business Profile</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage business details visible to potential customers</p>
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
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Business Name</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g. Apex Plumbing Solutions"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Business Phone</label>
              <input
                type="tel"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Business Email</label>
              <input
                type="email"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>City</label>
              <input
                type="text"
                className="input-field"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Years of Experience</label>
              <input
                type="number"
                className="input-field"
                value={experienceYears}
                onChange={(e) => setExperienceYears(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Skills (comma separated)</label>
            <input
              type="text"
              className="input-field"
              placeholder="Pipe repair, Drain cleaning, Boiler installation"
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Business Bio / Description</label>
            <textarea
              rows={3}
              className="input-field"
              placeholder="Describe your background and expertise..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <button type="submit" disabled={saving} className="btn btn-primary btn-lg" style={{ marginTop: '8px' }}>
            <Save size={18} /> {saving ? 'Saving...' : 'Update Business Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProviderProfile;
