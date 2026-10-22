import React from 'react';
import { Link } from 'react-router-dom';
import StarRating from '../common/StarRating';
import { MapPin, Clock, Briefcase, ChevronRight } from 'lucide-react';

const ServiceCard = ({ service }) => {
  return (
    <div
      className="glass-panel animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        height: '100%',
        transition: 'transform 0.3s, border-color 0.3s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-6px)';
        e.currentTarget.style.borderColor = 'var(--primary)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.borderColor = 'var(--glass-border)';
      }}
    >
      {/* Service Header / Image Placeholder */}
      <div
        style={{
          height: '160px',
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2), rgba(6, 182, 212, 0.2))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '16px',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <span className="badge badge-accepted" style={{ marginBottom: '8px' }}>
            {service.category_name || 'Service'}
          </span>
          <h4 style={{ fontSize: '1.1rem', color: '#fff', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {service.title}
          </h4>
        </div>

        {/* Pricing Pill */}
        <div
          style={{
            position: 'absolute',
            bottom: '12px',
            right: '12px',
            background: 'rgba(11, 15, 25, 0.9)',
            border: '1px solid var(--glass-border)',
            borderRadius: '20px',
            padding: '4px 12px',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--secondary)',
          }}
        >
          ${service.price} <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>/{service.pricing_type || 'fixed'}</span>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
        <div>
          {/* Provider Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Briefcase size={14} color="var(--primary)" /> By {service.provider_name || 'Provider'}
            </span>
            <StarRating rating={service.average_rating} totalReviews={service.total_reviews} />
          </div>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '16px', lineHeight: '1.5' }}>
            {service.description}
          </p>
        </div>

        <div>
          <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '16px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} /> {service.city}
            </span>
            {service.experience > 0 && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Clock size={14} /> {service.experience} yrs exp
              </span>
            )}
          </div>

          <Link
            to={`/services/${service.id}`}
            className="btn btn-primary btn-sm"
            style={{ width: '100%', justifyContent: 'center' }}
          >
            View Details & Book <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard;
