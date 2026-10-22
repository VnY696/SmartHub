import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Layers, Plus, Trash2, Edit3, Check, X } from 'lucide-react';

const ProviderServices = () => {
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [pricingType, setPricingType] = useState('fixed');
  const [duration, setDuration] = useState('1 hour');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [experience, setExperience] = useState(1);
  const [availability, setAvailability] = useState('Mon-Fri 9AM-6PM');

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/my/');
      setServices(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch provider services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/services/categories/');
        const list = res.data.results || res.data || [];
        setCategories(list);
        if (list.length > 0) setCategory(list[0].id);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
    fetchServices();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this service listing?')) return;
    try {
      await api.delete(`/services/${id}/delete/`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/services/create/', {
        title,
        category,
        description,
        price,
        pricing_type: pricingType,
        duration,
        city,
        address,
        experience,
        availability,
        is_available: true,
        status: 'active',
      });

      setModalOpen(false);
      setTitle('');
      setDescription('');
      setPrice('');
      fetchServices();
    } catch (err) {
      console.error('Create service error:', err);
      setError(err.response?.data?.message || 'Failed to create service listing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading your service listings...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--primary)" /> Manage Service Listings
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage services offered on SmartHub.</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-lg">
          <Plus size={18} /> Add New Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Layers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Service Listings Yet</h3>
          <p style={{ marginTop: '8px' }}>Click "Add New Service" above to publish your first listing.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {services.map((s) => (
            <div key={s.id} className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="badge badge-accepted">{s.category_name}</span>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--secondary)' }}>${s.price}</span>
                </div>
                <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{s.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.5', marginBottom: '16px' }}>{s.description}</p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '16px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>City: {s.city}</span>
                <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                  <Trash2 size={16} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Service Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '520px', padding: '32px', background: '#111827', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Publish New Service</h2>

            {error && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Service Title</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Master Pipe Leak Repair"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Category</label>
                <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="input-field"
                    placeholder="100.00"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Pricing Type</label>
                  <select className="input-field" value={pricingType} onChange={(e) => setPricingType(e.target.value)}>
                    <option value="fixed">Fixed</option>
                    <option value="hourly">Hourly</option>
                    <option value="negotiable">Negotiable</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>City</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="e.g. New York"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Experience (Years)</label>
                  <input
                    type="number"
                    required
                    className="input-field"
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Description (Min 20 chars)</label>
                <textarea
                  required
                  rows={3}
                  className="input-field"
                  placeholder="Provide detailed description of what your service includes..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Publish Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProviderServices;
