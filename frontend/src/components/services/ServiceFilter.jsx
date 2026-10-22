import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';

const ServiceFilter = ({
  search,
  setSearch,
  selectedCategory,
  setSelectedCategory,
  categories,
  city,
  setCity,
  minPrice,
  setMinPrice,
  maxPrice,
  setMaxPrice,
  ordering,
  setOrdering,
  onReset,
}) => {
  return (
    <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
        <h3 style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Filter size={18} color="var(--primary)" /> Filters & Search
        </h3>
        <button onClick={onReset} className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: '0.75rem' }}>
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Search Input */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Search Query</label>
        <div style={{ position: 'relative' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '12px', top: '14px' }} />
          <input
            type="text"
            className="input-field"
            placeholder="Plumber, cleaner, tutor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>
      </div>

      {/* Category Dropdown */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Category</label>
        <select
          className="input-field"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* City Filter */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>City</label>
        <input
          type="text"
          className="input-field"
          placeholder="Filter by city..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
      </div>

      {/* Price Range */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Price Range ($)</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <input
            type="number"
            className="input-field"
            placeholder="Min"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
          <input
            type="number"
            className="input-field"
            placeholder="Max"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
      </div>

      {/* Ordering */}
      <div>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '6px' }}>Sort By</label>
        <select
          className="input-field"
          value={ordering}
          onChange={(e) => setOrdering(e.target.value)}
        >
          <option value="-created_at">Newest First</option>
          <option value="-average_rating">Highest Rated</option>
          <option value="price">Price: Low to High</option>
          <option value="-price">Price: High to Low</option>
          <option value="-experience">Most Experienced</option>
        </select>
      </div>
    </div>
  );
};

export default ServiceFilter;
