import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/client';
import ServiceCard from '../../components/services/ServiceCard';
import ServiceFilter from '../../components/services/ServiceFilter';
import { Layers, ChevronLeft, ChevronRight } from 'lucide-react';

const ServiceCatalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [city, setCity] = useState(searchParams.get('city') || '');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [ordering, setOrdering] = useState('-created_at');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/services/categories/');
        setCategories(res.data.results || res.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (selectedCategory) params.append('category', selectedCategory);
      if (city) params.append('city', city);
      if (minPrice) params.append('min_price', minPrice);
      if (maxPrice) params.append('max_price', maxPrice);
      if (ordering) params.append('ordering', ordering);
      params.append('page', page);

      const res = await api.get(`/services/?${params.toString()}`);
      const data = res.data;
      setServices(data.results || data || []);
      if (data.count) {
        setTotalPages(Math.ceil(data.count / 10));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [search, selectedCategory, city, minPrice, maxPrice, ordering, page]);

  const handleReset = () => {
    setSearch('');
    setSelectedCategory('');
    setCity('');
    setMinPrice('');
    setMaxPrice('');
    setOrdering('-created_at');
    setPage(1);
    setSearchParams({});
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '40px auto', padding: '0 24px' }} className="animate-fade-in">
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.4rem' }}>Explore Service Catalog</h1>
        <p style={{ color: 'var(--text-muted)' }}>Find, filter, and compare professional local services near you.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '32px', alignItems: 'start' }}>
        {/* Sidebar Filters */}
        <ServiceFilter
          search={search}
          setSearch={setSearch}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          categories={categories}
          city={city}
          setCity={setCity}
          minPrice={minPrice}
          setMinPrice={setMinPrice}
          maxPrice={maxPrice}
          setMaxPrice={setMaxPrice}
          ordering={ordering}
          setOrdering={setOrdering}
          onReset={handleReset}
        />

        {/* Services Grid & Pagination */}
        <div>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-dim)' }}>Loading available services...</div>
          ) : services.length === 0 ? (
            <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 24px', color: 'var(--text-muted)' }}>
              <Layers size={48} style={{ marginBottom: '16px', opacity: 0.5 }} />
              <h3>No Services Found</h3>
              <p style={{ marginTop: '8px' }}>Try adjusting your search query or filter settings.</p>
              <button onClick={handleReset} className="btn btn-secondary" style={{ marginTop: '16px' }}>
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                {services.map((svc) => (
                  <ServiceCard key={svc.id} service={svc} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '40px' }}>
                  <button
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="btn btn-secondary"
                  >
                    <ChevronLeft size={18} /> Previous
                  </button>
                  <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    Page {page} of {totalPages}
                  </span>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="btn btn-secondary"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServiceCatalog;
