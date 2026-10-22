import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import { Layers, CheckCircle, XCircle, Trash2, Filter } from 'lucide-react';

const AdminServices = () => {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchServices = async () => {
    try {
      const res = await api.get('/services/admin/');
      let list = res.data.results || res.data || [];
      if (statusFilter) {
        list = list.filter((s) => s.status === statusFilter);
      }
      setServices(list);
    } catch (err) {
      console.error('Failed to fetch admin services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [statusFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/services/admin/${id}/`, { status: newStatus });
      fetchServices();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update service status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this service listing?')) return;
    try {
      await api.delete(`/services/${id}/delete/`);
      fetchServices();
    } catch (err) {
      alert('Failed to delete service.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading platform services...</div>;
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers color="var(--primary)" /> Service Listing Moderation
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Moderate, approve, deactivate, or delete service listings across the platform.</p>
        </div>

        <select className="input-field" style={{ width: '180px' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>Service Title</th>
              <th style={{ padding: '12px' }}>Category</th>
              <th style={{ padding: '12px' }}>Provider</th>
              <th style={{ padding: '12px' }}>Price</th>
              <th style={{ padding: '12px' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{s.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>City: {s.city}</div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <span className="badge badge-accepted">{s.category_name}</span>
                </td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{s.provider_name}</td>
                <td style={{ padding: '14px 12px', fontWeight: 700, color: 'var(--secondary)' }}>${s.price}</td>
                <td style={{ padding: '14px 12px' }}>
                  <StatusBadge status={s.status} />
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    {s.status !== 'active' && (
                      <button onClick={() => handleStatusChange(s.id, 'active')} className="btn btn-primary btn-sm">
                        <CheckCircle size={14} /> Activate
                      </button>
                    )}
                    {s.status === 'active' && (
                      <button onClick={() => handleStatusChange(s.id, 'inactive')} className="btn btn-secondary btn-sm">
                        <XCircle size={14} /> Deactivate
                      </button>
                    )}
                    <button onClick={() => handleDelete(s.id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminServices;
