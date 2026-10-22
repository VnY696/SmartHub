import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import { Calendar, CheckCircle, XCircle, Play, CheckCheck, Clock, MapPin } from 'lucide-react';

const ProviderBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/provider/');
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to fetch provider bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleStatusChange = async (id, action) => {
    try {
      await api.patch(`/bookings/${id}/${action}/`, {});
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || `Failed to ${action} booking.`);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading incoming bookings...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--primary)" /> Manage Incoming Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Accept, reject, track, and complete service requests from customers.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Incoming Bookings</h3>
          <p style={{ marginTop: '8px' }}>When customers book your services, they will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {bookings.map((b) => (
            <div key={b.id} className="glass-panel" style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '1.2rem' }}>{b.service_title}</h3>
                  <StatusBadge status={b.status} />
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    Customer: <strong>{b.customer_name}</strong> ({b.customer_email})
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={14} /> Date: {b.booking_date}
                  </span>
                  {b.preferred_time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> Time: {b.preferred_time}
                    </span>
                  )}
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <MapPin size={14} /> {b.address}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>
                  Payout: <strong style={{ color: 'var(--secondary)' }}>${b.price}</strong>
                </div>

                {b.customer_notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '6px' }}>
                    Customer Note: "{b.customer_notes}"
                  </div>
                )}
              </div>

              {/* Action State Buttons */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {b.status === 'pending' && (
                  <>
                    <button onClick={() => handleStatusChange(b.id, 'accept')} className="btn btn-primary btn-sm">
                      <CheckCircle size={16} /> Accept
                    </button>
                    <button onClick={() => handleStatusChange(b.id, 'reject')} className="btn btn-danger btn-sm">
                      <XCircle size={16} /> Reject
                    </button>
                  </>
                )}

                {b.status === 'accepted' && (
                  <button onClick={() => handleStatusChange(b.id, 'start')} className="btn btn-secondary btn-sm">
                    <Play size={16} /> Start Service
                  </button>
                )}

                {b.status === 'in_progress' && (
                  <button onClick={() => handleStatusChange(b.id, 'complete')} className="btn btn-primary btn-sm">
                    <CheckCheck size={16} /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProviderBookings;
