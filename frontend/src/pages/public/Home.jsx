import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../api/client';
import ServiceCard from '../../components/services/ServiceCard';
import RecommendationCarousel from '../../components/services/RecommendationCarousel';
import { Search, Sparkles, ShieldCheck, Zap, Award, ArrowRight, Layers } from 'lucide-react';

const Home = () => {
  const [categories, setCategories] = useState([]);
  const [featuredServices, setFeaturedServices] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const catRes = await api.get('/services/categories/');
        setCategories(catRes.data.results || catRes.data || []);

        const svcRes = await api.get('/services/?page_size=6');
        setFeaturedServices(svcRes.data.results || svcRes.data || []);
      } catch (err) {
        console.error('Home data load error:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/services?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="animate-fade-in" style={{ paddingBottom: '40px' }}>
      {/* Hero Section */}
      <section
        style={{
          background: 'var(--hero-gradient)',
          padding: '80px 24px 100px 24px',
          textAlign: 'center',
          borderBottom: '1px solid var(--glass-border)',
          position: 'relative',
        }}
      >
        <div style={{ maxWidth: '850px', margin: '0 auto' }}>
          <div
            className="badge badge-accepted"
            style={{ padding: '8px 16px', fontSize: '0.85rem', marginBottom: '20px', display: 'inline-flex', gap: '8px' }}
          >
            <Sparkles size={16} /> AI-Powered Local Service Marketplace
          </div>

          <h1 style={{ fontSize: '3.2rem', lineHeight: '1.15', marginBottom: '20px' }}>
            Find Expert Local Services <br />
            <span className="gradient-text">Powered by Smart AI</span>
          </h1>

          <p style={{ fontSize: '1.2rem', color: 'var(--text-muted)', marginBottom: '36px', maxWidth: '700px', margin: '0 auto 36px auto' }}>
            Connect with background-verified plumbers, electricians, cleaners, and tutors in your city with instant AI recommendations and seamless booking.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="glass-panel"
            style={{
              display: 'flex',
              gap: '12px',
              padding: '10px 16px',
              maxWidth: '650px',
              margin: '0 auto',
              alignItems: 'center',
              boxShadow: 'var(--shadow-glow)',
            }}
          >
            <Search size={22} color="var(--primary)" />
            <input
              type="text"
              placeholder="What service do you need today? (e.g. plumber, tutor...)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-main)',
                fontSize: '1.05rem',
                outline: 'none',
              }}
            />
            <button type="submit" className="btn btn-primary btn-lg">
              Search Services
            </button>
          </form>
        </div>
      </section>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px' }}>
        {/* Category Pills */}
        <section style={{ margin: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Browse Categories</h2>
            <Link to="/services" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All Services <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {categories.map((c) => (
              <Link
                key={c.id}
                to={`/services?category=${c.id}`}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderRadius: 'var(--radius-md)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  transition: '0.2s',
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
                  <Layers size={24} />
                </div>
                <h4 style={{ fontSize: '1rem' }}>{c.name}</h4>
              </Link>
            ))}
          </div>
        </section>

        {/* AI Recommendations Section */}
        <RecommendationCarousel />

        {/* Featured Services Grid */}
        <section style={{ margin: '60px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.8rem' }}>Top Rated Local Services</h2>
            <Link to="/services" style={{ color: 'var(--primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              Explore All <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
            {featuredServices.map((svc) => (
              <ServiceCard key={svc.id} service={svc} />
            ))}
          </div>
        </section>

        {/* Value Proposition Cards */}
        <section style={{ margin: '80px 0' }}>
          <div className="glass-panel" style={{ padding: '48px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '32px' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--primary)' }}>
                <ShieldCheck size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Verified Providers</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Every provider undergoes identity and skill verification before receiving customer bookings.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: 'var(--secondary)' }}>
                <Sparkles size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>AI Matchmaking</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Get instant recommendations tailored to your past bookings, city location, and preferences.</p>
            </div>

            <div style={{ textAlign: 'center' }}>
              <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto', color: '#10B981' }}>
                <Zap size={28} />
              </div>
              <h3 style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Seamless Bookings</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Track status changes from pending to completed with real-time in-app notifications.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
