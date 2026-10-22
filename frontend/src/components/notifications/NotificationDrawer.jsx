import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { X, Bell, CheckCircle, Clock } from 'lucide-react';

const NotificationDrawer = () => {
  const { notifications, drawerOpen, setDrawerOpen, markAsRead, markAllAsRead } = useNotification();

  if (!drawerOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 200,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={() => setDrawerOpen(false)}
    >
      <div
        className="glass-panel animate-fade-in"
        style={{
          width: '100%',
          maxWidth: '400px',
          height: '100%',
          background: '#111827',
          borderRadius: '0',
          borderLeft: '1px solid var(--glass-border)',
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Bell size={20} color="var(--primary)" />
            <h3 style={{ fontSize: '1.2rem' }}>Notifications</h3>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={markAllAsRead} className="btn btn-secondary btn-sm">
              Mark all read
            </button>
            <button onClick={() => setDrawerOpen(false)} className="btn btn-secondary btn-sm" style={{ padding: '6px' }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>
              <Clock size={36} style={{ marginBottom: '8px', opacity: 0.5 }} />
              <p>No notifications yet</p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                style={{
                  background: n.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(99, 102, 241, 0.08)',
                  border: `1px solid ${n.is_read ? 'var(--glass-border)' : 'rgba(99, 102, 241, 0.3)'}`,
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: '0.2s',
                }}
                onClick={() => !n.is_read && markAsRead(n.id)}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 700, color: n.is_read ? 'var(--text-muted)' : 'var(--primary)' }}>
                    {n.title}
                  </span>
                  {!n.is_read && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--primary)' }} />}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{n.message}</p>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', alignSelf: 'flex-end' }}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationDrawer;
