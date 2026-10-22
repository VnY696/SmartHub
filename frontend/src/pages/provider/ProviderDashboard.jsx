import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import { LayoutDashboard, Layers, Calendar, DollarSign, Star, ChevronRight } from 'lucide-react';

const ProviderDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [services, setServices] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const profRes = await api.get('/accounts/providers/me/');
        setProfile(profRes.data);

        const svcRes = await api.get('/services/my/');
        setServices(svcRes.data.results || svcRes.data || []);

        const bkRes = await api.get('/bookings/provider/');
        setBookings(bkRes.data.results || bkRes.data || []);
      } catch (err) {
        console.error('Failed to load provider dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading provider dashboard...</div>;
  }

  const activeBookings = bookings.filter((b) => ['pending', 'accepted', 'confirmed', 'in_progress'].includes(b.status));
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + Number(b.price || 0), 0);

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LayoutDashboard color="var(--primary)" /> Provider Business Hub
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back, {profile?.business_name || profile?.user?.username}!</p>
        </div>

        <div>
          <StatusBadge status={profile?.verification_status} />
        </div>
      </div>

      {/* Analytics Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Earnings</span>
            <DollarSign size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--secondary)' }}>${totalRevenue.toFixed(2)}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Services</span>
            <Layers size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800 }}>{services.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Active Requests</span>
            <Calendar size={20} />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--status-pending)' }}>{activeBookings.length}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>Avg Customer Rating</span>
            <Star size={20} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#F59E0B' }}>
            {profile?.average_rating ? Number(profile.average_rating).toFixed(1) : '5.0'}
          </div>
        </div>
      </div>

      {/* Recent Bookings Section */}
      <section className="glass-panel" style={{ padding: '28px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '1.4rem' }}>Recent Booking Requests</h2>
          <Link to="/provider/bookings" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
            View All Bookings <ChevronRight size={16} />
          </Link>
        </div>

        {bookings.length === 0 ? (
          <p style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '30px 0' }}>No incoming booking requests yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {bookings.slice(0, 5).map((b) => (
              <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div>
                  <h4 style={{ fontSize: '1rem' }}>{b.service_title}</h4>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Customer: {b.customer_name} • Date: {b.booking_date}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--secondary)' }}>${b.price}</span>
                  <StatusBadge status={b.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProviderDashboard;
