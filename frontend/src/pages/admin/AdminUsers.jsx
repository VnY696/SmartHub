import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import { Users, Trash2 } from 'lucide-react';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  const fetchUsers = async () => {
    try {
      const url = roleFilter ? `/accounts/users/?role=${roleFilter}` : '/accounts/users/';
      const res = await api.get(url);
      setUsers(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await api.delete(`/accounts/users/${id}/`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading registered users...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users color="var(--primary)" /> Registered User Directory
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Admin control for all platform customer and provider accounts.</p>
        </div>

        <select className="input-field" style={{ width: '180px' }} value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="provider">Provider</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      <div className="glass-panel" style={{ overflowX: 'auto', padding: '24px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <th style={{ padding: '12px' }}>User</th>
              <th style={{ padding: '12px' }}>Role</th>
              <th style={{ padding: '12px' }}>City</th>
              <th style={{ padding: '12px' }}>Phone</th>
              <th style={{ padding: '12px' }}>Joined Date</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--glass-border)', fontSize: '0.9rem' }}>
                <td style={{ padding: '14px 12px' }}>
                  <div style={{ fontWeight: 600 }}>{u.username}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>{u.email}</div>
                </td>
                <td style={{ padding: '14px 12px' }}>
                  <StatusBadge status={u.role} />
                </td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{u.city || 'N/A'}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-muted)' }}>{u.phone || 'N/A'}</td>
                <td style={{ padding: '14px 12px', color: 'var(--text-dim)' }}>
                  {new Date(u.date_joined).toLocaleDateString()}
                </td>
                <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                  {u.role !== 'admin' && (
                    <button onClick={() => handleDeleteUser(u.id)} className="btn btn-danger btn-sm">
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminUsers;
