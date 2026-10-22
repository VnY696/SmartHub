import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { Sparkles, Bell, User, LogOut, LayoutDashboard, Calendar, Layers, ShieldCheck, Search, GitCompare } from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isCustomer, isProvider, isAdmin } = useAuth();
  const { unreadCount, setDrawerOpen } = useNotification();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(11, 15, 25, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--glass-border)',
        padding: '12px 24px',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Sparkles size={22} color="#fff" />
          </div>
          <div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">
              SmartHub
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-dim)', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Local Services AI
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <Link to="/services" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Search size={16} /> Explore Services
          </Link>
          <Link to="/services/compare" style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitCompare size={16} /> Compare
          </Link>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Notification Bell */}
              <button
                onClick={() => setDrawerOpen(true)}
                style={{
                  position: 'relative',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '10px',
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-main)',
                  cursor: 'pointer',
                }}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '-4px',
                      right: '-4px',
                      background: '#EF4444',
                      color: '#fff',
                      borderRadius: '50%',
                      width: '18px',
                      height: '18px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {/* User Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '30px',
                    padding: '4px 14px 4px 6px',
                    cursor: 'pointer',
                    color: 'var(--text-main)',
                  }}
                >
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.9rem',
                    }}
                  >
                    {user?.username?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{user?.username}</span>
                  <span className={`badge badge-${user?.role}`}>{user?.role}</span>
                </button>

                {dropdownOpen && (
                  <div
                    className="glass-panel animate-fade-in"
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '50px',
                      width: '220px',
                      padding: '8px',
                      background: '#111827',
                      zIndex: 110,
                    }}
                  >
                    {isCustomer && (
                      <>
                        <Link to="/customer/bookings" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <Calendar size={16} /> My Bookings
                        </Link>
                        <Link to="/customer/profile" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <User size={16} /> Edit Profile
                        </Link>
                      </>
                    )}

                    {isProvider && (
                      <>
                        <Link to="/provider/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <LayoutDashboard size={16} /> Dashboard
                        </Link>
                        <Link to="/provider/bookings" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <Calendar size={16} /> Bookings
                        </Link>
                        <Link to="/provider/services" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <Layers size={16} /> My Listings
                        </Link>
                        <Link to="/provider/profile" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <User size={16} /> Business Profile
                        </Link>
                      </>
                    )}

                    {isAdmin && (
                      <>
                        <Link to="/admin/dashboard" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <ShieldCheck size={16} /> Admin Analytics
                        </Link>
                        <Link to="/admin/verifications" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <ShieldCheck size={16} /> Provider Approvals
                        </Link>
                        <Link to="/admin/services" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <Layers size={16} /> Moderate Services
                        </Link>
                        <Link to="/admin/categories" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <Layers size={16} /> Manage Categories
                        </Link>
                        <Link to="/admin/users" className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start', border: 'none' }} onClick={() => setDropdownOpen(false)}>
                          <User size={16} /> Users Management
                        </Link>
                      </>
                    )}

                    <hr style={{ borderColor: 'var(--glass-border)', margin: '6px 0' }} />
                    <button onClick={handleLogout} className="btn btn-danger" style={{ width: '100%', justifyContent: 'flex-start' }}>
                      <LogOut size={16} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px' }}>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
