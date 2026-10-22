import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import StarRating from '../../components/common/StarRating';
import { MapPin, Clock, Briefcase, Calendar, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const ServiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCustomer } = useAuth();

  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking Modal State
  const [bookingModal, setBookingModal] = useState(false);
  const [bookingDate, setBookingDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('10:00');
  const [address, setAddress] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const svcRes = await api.get(`/services/${id}/`);
        setService(svcRes.data);

        const revRes = await api.get(`/reviews/service/${id}/`);
        setReviews(revRes.data.results || revRes.data || []);
      } catch (err) {
        console.error('Failed to load service detail:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingSuccess('');
    setSubmitting(true);

    try {
      await api.post('/bookings/', {
        service: service.id,
        booking_date: bookingDate,
        preferred_time: preferredTime,
        address,
        customer_notes: customerNotes,
      });

      setBookingSuccess('Booking submitted successfully! You can view it in your bookings dashboard.');
      setTimeout(() => {
        setBookingModal(false);
        navigate('/customer/bookings');
      }, 2000);
    } catch (err) {
      console.error('Booking failed:', err);
      const msg = err.response?.data?.message || err.response?.data?.errors?.booking_date?.[0] || 'Booking failed.';
      setBookingError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading service details...</div>;
  }

  if (!service) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-muted)' }}>Service not found.</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '32px', marginBottom: '32px', display: 'grid', gridTemplateColumns: '1fr 340px', gap: '32px', alignItems: 'start' }}>
        <div>
          <span className="badge badge-accepted" style={{ marginBottom: '12px' }}>
            {service.category_name}
          </span>
          <h1 style={{ fontSize: '2.4rem', marginBottom: '12px' }}>{service.title}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
            <StarRating rating={service.average_rating} totalReviews={service.total_reviews} />
            <span style={{ color: 'var(--text-dim)' }}>•</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              <MapPin size={16} /> {service.city}
            </span>
          </div>

          <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Service Description</h3>
          <p style={{ color: 'var(--text-muted)', lineHeight: '1.7', whiteSpace: 'pre-line' }}>{service.description}</p>
        </div>

        {/* Pricing & Booking Card */}
        <div style={{ background: 'rgba(17, 24, 39, 0.9)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '24px' }}>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--secondary)', marginBottom: '4px' }}>
            ${service.price} <span style={{ fontSize: '0.9rem', color: 'var(--text-dim)', fontWeight: 400 }}>/{service.pricing_type}</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '20px' }}>
            {service.availability || 'Flexible Availability'}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Briefcase size={16} color="var(--primary)" /> Provided by <strong>{service.provider_name}</strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={16} color="var(--primary)" /> {service.experience} years experience
            </div>
          </div>

          {isAuthenticated ? (
            isCustomer ? (
              <button onClick={() => setBookingModal(true)} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
                Book This Service
              </button>
            ) : (
              <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                LoggedIn as provider/admin. Switch to customer account to book.
              </div>
            )
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-primary btn-lg" style={{ width: '100%' }}>
              Log In to Book Service
            </button>
          )}
        </div>
      </div>

      {/* Reviews Section */}
      <section className="glass-panel" style={{ padding: '32px' }}>
        <h2 style={{ fontSize: '1.6rem', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={22} color="var(--primary)" /> Customer Reviews ({reviews.length})
        </h2>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--text-dim)' }}>No reviews yet for this service.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {reviews.map((rev) => (
              <div key={rev.id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>{rev.customer_name}</span>
                  <StarRating rating={rev.rating} />
                </div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '8px' }}>{rev.review}</p>
                {rev.provider_response && (
                  <div style={{ background: 'rgba(99, 102, 241, 0.08)', borderLeft: '3px solid var(--primary)', padding: '10px 14px', borderRadius: '4px', fontSize: '0.85rem' }}>
                    <strong style={{ color: 'var(--primary)' }}>Provider Response:</strong> {rev.provider_response}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Booking Modal */}
      {bookingModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '480px', padding: '32px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>Book {service.title}</h2>

            {bookingError && <div style={{ color: '#EF4444', marginBottom: '16px', fontSize: '0.85rem' }}>{bookingError}</div>}
            {bookingSuccess && <div style={{ color: '#10B981', marginBottom: '16px', fontSize: '0.85rem' }}>{bookingSuccess}</div>}

            <form onSubmit={handleBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Preferred Date</label>
                <input
                  type="date"
                  required
                  className="input-field"
                  value={bookingDate}
                  onChange={(e) => setBookingDate(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Preferred Time</label>
                <input
                  type="time"
                  className="input-field"
                  value={preferredTime}
                  onChange={(e) => setPreferredTime(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Service Address</label>
                <textarea
                  required
                  rows={2}
                  className="input-field"
                  placeholder="Enter complete delivery address..."
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Notes / Requirements</label>
                <textarea
                  rows={2}
                  className="input-field"
                  placeholder="Describe your issue or specific instructions..."
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" onClick={() => setBookingModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className="btn btn-primary" style={{ flex: 1 }}>
                  {submitting ? 'Submitting...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetail;
