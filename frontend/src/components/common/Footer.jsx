import React from 'react';
import { Sparkles, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer
      style={{
        background: '#070A12',
        borderTop: '1px solid var(--glass-border)',
        padding: '48px 24px 24px 24px',
        marginTop: '80px',
        color: 'var(--text-muted)',
      }}
    >
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '32px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#fff" />
            </div>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'Outfit' }} className="gradient-text">
              SmartHub
            </span>
          </div>
          <p style={{ fontSize: '0.9rem', lineHeight: '1.6' }}>
            AI-powered local service marketplace connecting customers with verified professional service providers.
          </p>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '1rem' }}>Popular Categories</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li>Plumbing & Repairs</li>
            <li>Electrical Services</li>
            <li>Home Deep Cleaning</li>
            <li>Tutoring & Education</li>
            <li>Landscaping & Gardening</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '1rem' }}>For Providers</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li>Become a Verified Partner</li>
            <li>List Your Services</li>
            <li>Provider Guidelines</li>
            <li>Success Stories</li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '16px', fontSize: '1rem' }}>Platform Features</h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <li>AI Service Recommendations</li>
            <li>Smart Chatbot Assistant</li>
            <li>Verified Reviews</li>
            <li>Secure Booking Lifecycle</li>
          </ul>
        </div>
      </div>

      <div style={{ maxWidth: '1280px', margin: '32px auto 0 auto', paddingTop: '24px', borderTop: '1px solid rgba(255,255,255,0.05)', textAlign: 'center', fontSize: '0.85rem' }}>
        <p>© 2026 SmartHub Marketplace. Built with Django REST Framework & React.</p>
      </div>
    </footer>
  );
};

export default Footer;
