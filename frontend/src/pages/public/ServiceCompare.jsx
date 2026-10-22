import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../api/client';
import StarRating from '../../components/common/StarRating';
import { Layers, MapPin, Check, X } from 'lucide-react';

const ServiceCompare = () => {
  const [searchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompare = async () => {
      const ids = searchParams.get('ids') || '1,2,3';
      try {
        const res = await api.get(`/services/compare/?ids=${ids}`);
        setServices(res.data.data || []);
      } catch (err) {
        console.error('Failed to load compare services:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCompare();
  }, [searchParams]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading comparison matrix...</div>;
  }

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Layers color="var(--primary)" /> Side-by-Side Service Comparison
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Compare prices, ratings, provider experience, and availability.</p>
      </div>

      {services.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <p>No services selected for comparison. Pass ?ids=1,2 in URL query parameters.</p>
        </div>
      ) : (
        <div className="glass-panel" style={{ overflowX: 'auto', padding: '24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '700px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <th style={{ padding: '16px', width: '200px' }}>Feature</th>
                {services.map((s) => (
                  <th key={s.id} style={{ padding: '16px', fontSize: '1.1rem', color: 'var(--primary)' }}>
                    {s.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Price</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px', fontWeight: 800, fontSize: '1.2rem', color: 'var(--secondary)' }}>
                    ${s.price} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 400 }}>/{s.pricing_type}</span>
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Average Rating</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px' }}>
                    <StarRating rating={s.average_rating} totalReviews={s.total_reviews} />
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Provider</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px', color: 'var(--text-main)' }}>
                    {s.provider_name} ({s.experience} yrs exp)
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Location / City</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px', color: 'var(--text-muted)' }}>
                    <MapPin size={14} inline /> {s.city}
                  </td>
                ))}
              </tr>

              <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
                <td style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600 }}>Availability</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px' }}>
                    {s.is_available ? (
                      <span className="badge badge-approved"><Check size={12} /> Available Now</span>
                    ) : (
                      <span className="badge badge-rejected"><X size={12} /> Unavailable</span>
                    )}
                  </td>
                ))}
              </tr>

              <tr>
                <td style={{ padding: '16px' }}>Action</td>
                {services.map((s) => (
                  <td key={s.id} style={{ padding: '16px' }}>
                    <Link to={`/services/${s.id}`} className="btn btn-primary btn-sm">
                      View Service
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ServiceCompare;
