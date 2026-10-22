import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import StatusBadge from '../../components/common/StatusBadge';
import StarRating from '../../components/common/StarRating';
import { Calendar, Clock, MapPin, XCircle, Star, MessageSquare } from 'lucide-react';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Review Modal State
  const [reviewModal, setReviewModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings/my/');
      setBookings(res.data.results || res.data || []);
    } catch (err) {
      console.error('Failed to load customer bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await api.patch(`/bookings/${id}/cancel/`);
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const openReviewModal = (b) => {
    setSelectedBooking(b);
    setRating(5);
    setReviewText('');
    setReviewError('');
    setReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);

    try {
      await api.post('/reviews/', {
        booking: selectedBooking.id,
        rating,
        review: reviewText,
      });

      setReviewModal(false);
      fetchBookings();
    } catch (err) {
      console.error('Submit review error:', err);
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px 0', color: 'var(--text-dim)' }}>Loading your bookings...</div>;
  }

  return (
    <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Calendar color="var(--primary)" /> My Service Bookings
        </h1>
        <p style={{ color: 'var(--text-muted)' }}>Track appointment statuses, cancel pending requests, and leave verified reviews.</p>
      </div>

      {bookings.length === 0 ? (
        <div className="glass-panel" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Calendar size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
          <h3>No Bookings Yet</h3>
          <p style={{ marginTop: '8px' }}>Browse our catalog to book your first local service.</p>
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
                  Provider: <strong>{b.provider_name}</strong> • Price: <strong style={{ color: 'var(--secondary)' }}>${b.price}</strong>
                </div>

                {b.customer_notes && (
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontStyle: 'italic', marginTop: '6px' }}>
                    Note: "{b.customer_notes}"
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'flex-end' }}>
                {['pending', 'accepted', 'confirmed'].includes(b.status) && (
                  <button onClick={() => handleCancel(b.id)} className="btn btn-danger btn-sm">
                    <XCircle size={16} /> Cancel Booking
                  </button>
                )}

                {b.status === 'completed' && (
                  <button onClick={() => openReviewModal(b)} className="btn btn-primary btn-sm">
                    <Star size={16} /> Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal */}
      {reviewModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '440px', padding: '32px', background: '#111827' }}>
            <h2 style={{ fontSize: '1.4rem', marginBottom: '16px' }}>Review {selectedBooking?.service_title}</h2>

            {reviewError && <div style={{ color: '#EF4444', marginBottom: '12px', fontSize: '0.85rem' }}>{reviewError}</div>}

            <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '8px' }}>Select Rating</label>
                <StarRating rating={rating} interactive onRatingChange={setRating} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px' }}>Your Feedback</label>
                <textarea
                  required
                  rows={4}
                  className="input-field"
                  placeholder="Share details about your experience..."
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="button" onClick={() => setReviewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" disabled={submittingReview} className="btn btn-primary" style={{ flex: 1 }}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBookings;
