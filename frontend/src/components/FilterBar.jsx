import { useState } from 'react';
import { STATUS_OPTIONS } from '../utils/helpers';

export default function FilterBar({ filters, setFilters, profiles, viewMode, onViewMode, sortBy, sortDir, onSortChange }) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  const uniqueCastes = [...new Set(profiles.map((p) => p.caste).filter(Boolean))].sort();
  const uniqueEduLevels = [...new Set(profiles.map((p) => p.edu_level).filter(Boolean))].sort();
  const uniqueWorkCities = [...new Set(profiles.map((p) => p.company_location).filter(Boolean))].sort();
  const uniqueNativeCities = [...new Set(profiles.map((p) => p.city).filter(Boolean))].sort();

  const activeCount = [
    filters.search,
    filters.status,
    filters.edu_level,
    filters.caste,
    filters.company_city,
    filters.nativeCity,
    filters.minAge,
    filters.maxAge,
    filters.minHeight,
    filters.maxHeight,
    filters.minPackage,
    filters.maxPackage,
    filters.starredOnly,
  ].filter(Boolean).length;

  const clearAll = () =>
    setFilters({
      search: '', status: '', edu_level: '', caste: '', company_city: '', nativeCity: '',
      minAge: '', maxAge: '', minHeight: '', maxHeight: '', minPackage: '', maxPackage: '', starredOnly: false,
    });

  const set = (key) => (e) => setFilters({ ...filters, [key]: e.target.value });

  return (
    <div className="filter-bar">
      {/* ── Row 1: Search + meta controls + view toggle ── */}
      <div className="filter-bar__top">
        <input
          type="text"
          placeholder="Search name, city, profession, company…"
          className="filter-bar__search"
          value={filters.search}
          onChange={set('search')}
        />
        <div className="filter-bar__meta">
          {activeCount > 0 && (
            <>
              <span className="filter-bar__count">{activeCount} active</span>
              <button className="btn btn--link btn--small" onClick={clearAll}>Clear all</button>
            </>
          )}
        </div>

        <div className="filter-bar__right">
          <button
            className={`filter-bar__filter-toggle${filtersOpen ? ' filter-bar__filter-toggle--open' : ''}${activeCount > 0 ? ' filter-bar__filter-toggle--active' : ''}`}
            onClick={() => setFiltersOpen((v) => !v)}
            title="Toggle filters"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="4" y1="6" x2="20" y2="6"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
              <line x1="11" y1="18" x2="13" y2="18"/>
            </svg>
            Filters{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          {viewMode === 'grid' && onSortChange && (
            <div className="filter-bar__sort">
              <select
                value={sortBy}
                onChange={(e) => onSortChange(e.target.value, sortDir)}
                className="filter-bar__sort-select"
              >
                <option value="">Sort: Date Added</option>
                <option value="age">Sort: Age</option>
                <option value="height">Sort: Height</option>
                <option value="dob">Sort: Date of Birth</option>
                <option value="package">Sort: Package</option>
                <option value="status">Sort: Status</option>
              </select>
              <button
                className="filter-bar__sort-dir"
                onClick={() => onSortChange(sortBy, sortDir === 'asc' ? 'desc' : 'asc')}
                title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </div>
          )}
          {onViewMode && (
            <div className="view-toggle">
              <button
                className={`view-toggle__btn ${viewMode === 'grid' ? 'view-toggle__btn--active' : ''}`}
                title="Grid view"
                onClick={() => onViewMode('grid')}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="1" width="6" height="6" rx="1"/>
                  <rect x="9" y="1" width="6" height="6" rx="1"/>
                  <rect x="1" y="9" width="6" height="6" rx="1"/>
                  <rect x="9" y="9" width="6" height="6" rx="1"/>
                </svg>
                <span className="view-toggle__label">Grid</span>
              </button>
              <button
                className={`view-toggle__btn ${viewMode === 'table' ? 'view-toggle__btn--active' : ''}`}
                title="Table view"
                onClick={() => onViewMode('table')}
              >
                <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                  <rect x="1" y="2" width="14" height="2" rx="0.5"/>
                  <rect x="1" y="6" width="14" height="2" rx="0.5"/>
                  <rect x="1" y="10" width="14" height="2" rx="0.5"/>
                  <rect x="1" y="14" width="14" height="1" rx="0.5"/>
                </svg>
                <span className="view-toggle__label">Table</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Row 2: Grouped filters with separators ── */}
      <div className={`filter-bar__groups${filtersOpen ? ' filter-bar__groups--open' : ''}`}>

        {/* Dropdowns group */}
        <div className="filter-group">
          <span className="filter-group__label">Profile</span>
          <div className="filter-group__controls">
            <select value={filters.status} onChange={set('status')}>
              <option value="">Status</option>
              {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={filters.edu_level} onChange={set('edu_level')}>
              <option value="">Education</option>
              {uniqueEduLevels.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            <select value={filters.caste} onChange={set('caste')}>
              <option value="">Caste</option>
              {uniqueCastes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.company_city} onChange={set('company_city')}>
              <option value="">Work city</option>
              {uniqueWorkCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filters.nativeCity} onChange={set('nativeCity')}>
              <option value="">Native city</option>
              {uniqueNativeCities.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Age range */}
        <div className="filter-group">
          <span className="filter-group__label">Age (yrs)</span>
          <div className="filter-group__controls filter-group__controls--range">
            <input type="number" placeholder="Min" value={filters.minAge} onChange={set('minAge')} />
            <span className="filter-range-dash">–</span>
            <input type="number" placeholder="Max" value={filters.maxAge} onChange={set('maxAge')} />
          </div>
        </div>

        {/* Height range */}
        <div className="filter-group">
          <span className="filter-group__label">Height (cm)</span>
          <div className="filter-group__controls filter-group__controls--range">
            <input type="number" placeholder="Min" value={filters.minHeight} onChange={set('minHeight')} />
            <span className="filter-range-dash">–</span>
            <input type="number" placeholder="Max" value={filters.maxHeight} onChange={set('maxHeight')} />
          </div>
        </div>

        {/* Package range */}
        <div className="filter-group">
          <span className="filter-group__label">Package (LPA)</span>
          <div className="filter-group__controls filter-group__controls--range">
            <input type="number" placeholder="Min" value={filters.minPackage} onChange={set('minPackage')} />
            <span className="filter-range-dash">–</span>
            <input type="number" placeholder="Max" value={filters.maxPackage} onChange={set('maxPackage')} />
          </div>
        </div>

        {/* Starred */}
        <div className="filter-group">
          <span className="filter-group__label">Starred</span>
          <div className="filter-group__controls">
            <label className="filter-bar__starred">
              <input type="checkbox" checked={filters.starredOnly}
                onChange={(e) => setFilters({ ...filters, starredOnly: e.target.checked })} />
              ⭐ Only
            </label>
          </div>
        </div>

      </div>
    </div>
  );
}