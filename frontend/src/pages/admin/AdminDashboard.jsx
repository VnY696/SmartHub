import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { ShieldCheck, Users, Briefcase, Layers, Calendar, Star, CheckCircle, Clock } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const res = await api.get('/admin/dashboard/');
        setStats(res.data.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardStats();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading admin platform statistics...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ShieldCheck color="var(--primary)" /> Admin Platform Control Center
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Real-time statistics across users, provider applications, bookings, and service offerings.</p>
      </div>

      {/* Analytics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--primary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Registered Users</span>
            <Users size={24} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{stats?.users?.total || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            {stats?.users?.customers || 0} Customers • {stats?.users?.providers || 0} Providers
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--status-pending)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Pending Verifications</span>
            <Clock size={24} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--status-pending)' }}>{stats?.providers?.pending || 0}</div>
          <Link to="/admin/verifications" style={{ fontSize: '0.8rem', color: 'var(--primary)', display: 'inline-block', marginTop: '6px', fontWeight: 600 }}>
            Review Applications →
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--secondary)', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Service Listings</span>
            <Layers size={24} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--secondary)' }}>{stats?.services?.total || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            {stats?.services?.active || 0} Active • {stats?.categories?.total || 0} Categories
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#10B981', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Bookings</span>
            <Calendar size={24} />
          </div>
          <div style={{ fontSize: '2.2rem', fontWeight: 800, color: '#10B981' }}>{stats?.bookings?.total || 0}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: '6px' }}>
            {stats?.bookings?.completed || 0} Completed • {stats?.bookings?.pending || 0} Pending
          </div>
        </div>
      </div>

      {/* Admin Action Shortcut Panels */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>Provider Verification Queue</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            There are currently <strong>{stats?.providers?.pending || 0}</strong> provider applications awaiting verification review.
          </p>
          <Link to="/admin/verifications" className="btn btn-primary">
            Manage Provider Approvals
          </Link>
        </div>

        <div className="glass-panel" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1.3rem', marginBottom: '12px' }}>User Directory Control</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
            View, filter, or manage all <strong>{stats?.users?.total || 0}</strong> registered accounts across customer and provider roles.
          </p>
          <Link to="/admin/users" className="btn btn-secondary">
            Manage Registered Users
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
