import React, { useEffect, useState } from 'react';
import api from '../../api/client';
import ServiceCard from './ServiceCard';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

const RecommendationCarousel = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const res = await api.get('/recommendations/');
        const data = res.data.data || [];
        setRecommendations(data);
      } catch (err) {
        console.error('Failed to load recommendations:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecommendations();
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-dim)' }}>Loading AI recommendations...</div>;
  }

  if (recommendations.length === 0) return null;

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % Math.ceil(recommendations.length / 3));
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + Math.ceil(recommendations.length / 3)) % Math.ceil(recommendations.length / 3));
  };

  const visibleServices = recommendations.slice(currentIndex * 3, currentIndex * 3 + 3);

  return (
    <section style={{ margin: '60px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary)', fontWeight: 600, fontSize: '0.85rem' }}>
            <Sparkles size={16} /> AI Personalization
          </div>
          <h2 style={{ fontSize: '1.8rem', marginTop: '4px' }}>Recommended For You</h2>
        </div>

        {recommendations.length > 3 && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={prevSlide} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <ChevronLeft size={18} />
            </button>
            <button onClick={nextSlide} className="btn btn-secondary" style={{ padding: '8px 12px' }}>
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
        {visibleServices.map((service) => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>
    </section>
  );
};

export default RecommendationCarousel;
