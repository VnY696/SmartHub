import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import { ShieldCheck, CheckCircle, XCircle } from 'lucide-react';

const AdminVerifications = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingProviders = async () => {
    try {
      const res = await api.get('/accounts/providers/pending/');
      setProviders(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch pending providers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingProviders();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      await api.patch(`/accounts/providers/${id}/verify/`, {
        verification_status: status,
      });
      fetchPendingProviders();
    } catch (err) {
      alert(err.response?.data?.message || 'Verification update failed.');
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading provider verification applications...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="var(--primary)" /> Provider Verification Queue
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Approve or reject service provider business profiles before they can accept customer bookings.</p>
      </div>

      {providers.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <CheckCircle size={48} style={{ marginBottom: '16px', color: '#10B981' }} />
          <h3>Queue Empty</h3>
          <p style={{ marginTop: '8px' }}>All provider applications have been processed.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {providers.map((p) => (
            <div key={p.id} className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{p.business_name || p.user?.email}</h3>
                  <StatusBadge status={p.verification_status} />
                </div>

                <div style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  User Email: <strong>{p.user?.email}</strong> • Experience: {p.experience_years} years • City: {p.city || 'N/A'}
                </div>

                {p.skills && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                    Skills: {p.skills}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => handleVerify(p.id, 'approved')} className="btn btn-primary btn-sm">
                  <CheckCircle size={16} /> Approve
                </button>
                <button onClick={() => handleVerify(p.id, 'rejected')} className="btn btn-danger btn-sm">
                  <XCircle size={16} /> Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminVerifications;
