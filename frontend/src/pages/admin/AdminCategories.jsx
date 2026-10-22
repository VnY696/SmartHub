import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import { Layers, Plus, Trash2, Edit3, CheckCircle } from 'lucide-react';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/services/categories/');
      setCategories(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await api.post('/services/categories/', {
        name,
        description,
        is_active: true,
      });

      setModalOpen(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err) {
      console.error('Create category error:', err);
      setError(err.response?.data?.message || err.response?.data?.name?.[0] || 'Failed to create category.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await api.delete(`/services/categories/${id}/`);
      fetchCategories();
    } catch (err) {
      alert('Failed to delete category.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading categories...</div>;
  }

  return (
    <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--primary)" /> Service Category Management
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Create, edit, or delete platform service categories.</p>
        </div>

        <button onClick={() => setModalOpen(true)} className="btn btn-primary btn-lg">
          <Plus size={18} /> Add New Category
        </button>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>Category Name</th>
              <th style={{ padding: '12px' }}>Slug</th>
              <th style={{ padding: '12px' }}>Description</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => (
              <tr key={c.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-dim)', fontSize: '0.8rem' }}>{c.slug}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{c.description || 'No description'}</td>
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  <button onClick={() => handleDelete(c.id)} className="btn btn-danger btn-sm">
                    <Trash2 size={14} /> Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Modal */}
      {modalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Create Category</h2>

            {error && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '0.85rem' }}>{error}</div>}

            <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Category Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="e.g. Plumbing Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Description</label>
                <textarea
                  rows={3}
                  className="input-field"
                  placeholder="Category overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setModalOpen(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
