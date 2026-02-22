import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { getProfiles, updateProfile, deleteProfile } from '../api/profiles';
import { fullName } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/auth';
import ProfileCard from '../components/ProfileCard';
import ProfileTable from '../components/ProfileTable';
import ProfileModal from '../components/ProfileModal';
import FilterBar from '../components/FilterBar';
import CompareView from '../components/CompareView';
import ProfileDetail from '../components/ProfileDetail';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const EMPTY_FILTERS = {
  search: '', status: '', edu_level: '', caste: '', company_city: '', nativeCity: '',
  minAge: '', maxAge: '', minHeight: '', maxHeight: '', minPackage: '', maxPackage: '', starredOnly: false,
};

export default function Home({ onAdminClick }) {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [sortBy, setSortBy] = useState('');
  const [sortDir, setSortDir] = useState('asc');
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [modalProfile, setModalProfile] = useState(undefined); // undefined = closed, null = new, object = edit
  const [detailProfile, setDetailProfile] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareIds, setCompareIds] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const addToast = useCallback((message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await getProfiles(sortBy, sortDir);
      setProfiles(data);
    } catch {
      addToast('Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  }, [sortBy, sortDir, addToast]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSortChange = (newSortBy, newSortDir) => {
    setSortBy(newSortBy);
    setSortDir(newSortDir);
  };

  const handleToggleStar = async (id, starred) => {
    try {
      await updateProfile(id, { starred });
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, starred } : p)));
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await updateProfile(id, { status });
      setProfiles((prev) => prev.map((p) => (p.id === id ? { ...p, status } : p)));
    } catch {
      addToast('Something went wrong', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteProfile(deleteTarget.id);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      addToast('Profile deleted', 'success');
    } catch {
      addToast('Something went wrong', 'error');
    }
    setDeleteTarget(null);
  };

  const handleToggleCompare = (id) => {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev
    );
  };

  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const s = filters.search.toLowerCase();
      if (s) {
        const searchable = [p.first_name, p.last_name, p.city, p.profession_title, p.company, p.company_location]
          .filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(s)) return false;
      }
      if (filters.status && p.status !== filters.status) return false;
      if (filters.edu_level && p.edu_level !== filters.edu_level) return false;
      if (filters.caste && p.caste !== filters.caste) return false;
      if (filters.company_city && p.company_location !== filters.company_city) return false;
      if (filters.nativeCity && p.city !== filters.nativeCity) return false;
      if (filters.minAge && p.age < Number(filters.minAge)) return false;
      if (filters.maxAge && p.age > Number(filters.maxAge)) return false;
      if (filters.minHeight && (p.height_cm == null || p.height_cm < Number(filters.minHeight))) return false;
      if (filters.maxHeight && (p.height_cm == null || p.height_cm > Number(filters.maxHeight))) return false;
      if (filters.minPackage && (p.package == null || Number(p.package) < Number(filters.minPackage))) return false;
      if (filters.maxPackage && (p.package == null || Number(p.package) > Number(filters.maxPackage))) return false;
      if (filters.starredOnly && !p.starred) return false;
      return true;
    });
  }, [profiles, filters]);

  const compareProfiles = profiles.filter((p) => compareIds.includes(p.id));

  if (showCompare && compareProfiles.length >= 2) {
    return (
      <CompareView
        profiles={compareProfiles}
        onClose={() => { setShowCompare(false); setCompareMode(false); setCompareIds([]); }}
      />
    );
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header__left">
          <h1 className="header__title">💍 Profile Manager</h1>
        </div>
        <div className="header__right">
          {/* ── Always-visible icon buttons ── */}
          <div className="header__count-chip" title={`${profiles.length} profiles`}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>{profiles.length}</span>
          </div>
          <button
            className={`header__icon-btn header__icon-btn--always${compareMode ? ' header__icon-btn--active' : ''}`}
            onClick={() => { setCompareMode(!compareMode); if (compareMode) setCompareIds([]); }}
            title="Compare"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="8" height="18" rx="1"/><rect x="14" y="3" width="8" height="18" rx="1"/>
            </svg>
          </button>

          {/* ── Desktop-only buttons ── */}
          {onAdminClick && (
            <button className="btn btn--admin header__desktop-btn" onClick={onAdminClick}>Settings</button>
          )}
          <button className="btn btn--primary header__desktop-btn" onClick={() => setModalProfile(null)}>Add Profile</button>
          <div className="header__user header__desktop-btn">
            <span className="header__user-name">{user?.name || user?.email}</span>
            <button className="btn btn--secondary btn--small" onClick={async () => { await logoutUser(); logout(); }}>Sign out</button>
          </div>

          {/* ── Mobile-only icon buttons ── */}
          <button
            className="header__icon-btn header__icon-btn--primary"
            onClick={() => setModalProfile(null)}
            title="Add Profile"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
          </button>
          <div className="header__user-menu" ref={userMenuRef}>
            <button
              className="header__icon-btn header__icon-btn--user"
              onClick={() => setUserMenuOpen((v) => !v)}
              title={user?.name || user?.email}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
              </svg>
            </button>
            {userMenuOpen && (
              <div className="header__user-dropdown">
                <div className="header__user-dropdown-name">{user?.name || user?.email}</div>
                {onAdminClick && (
                  <button className="header__user-dropdown-item" onClick={() => { setUserMenuOpen(false); onAdminClick(); }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    Settings
                  </button>
                )}
                <button className="header__user-dropdown-item header__user-dropdown-item--danger" onClick={async () => { setUserMenuOpen(false); await logoutUser(); logout(); }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                  Sign out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="app-body">
      <div className="toolbar">
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          profiles={profiles}
          viewMode={viewMode}
          onViewMode={setViewMode}
          sortBy={sortBy}
          sortDir={sortDir}
          onSortChange={handleSortChange}
        />
      </div>

      {compareMode && compareIds.length >= 2 && (
        <div className="compare-bar">
          <button className="btn btn--primary" onClick={() => setShowCompare(true)}>
            Compare Selected ({compareIds.length})
          </button>
        </div>
      )}

      {loading ? (
        <div className="empty-state">Loading...</div>
      ) : filteredProfiles.length === 0 ? (
        <div className="empty-state">
          {profiles.length === 0 ? (
            <p>No profiles yet. Add your first profile.</p>
          ) : (
            <>
              <p>No profiles match your filters.</p>
              <button className="btn btn--link" onClick={() => setFilters(EMPTY_FILTERS)}>Clear Filters</button>
            </>
          )}
        </div>
      ) : (
        viewMode === 'table' ? (
          <ProfileTable
            profiles={filteredProfiles}
            onView={(prof) => setDetailProfile(prof)}
            onEdit={(prof) => setModalProfile(prof)}
            onDelete={(prof) => setDeleteTarget(prof)}
            onToggleStar={handleToggleStar}
            onStatusChange={handleStatusChange}
          />
        ) : (
        <div className="profile-grid">
          {filteredProfiles.map((p) => (
            <ProfileCard
              key={p.id}
              profile={p}
              onView={(prof) => setDetailProfile(prof)}
              onEdit={(prof) => setModalProfile(prof)}
              onDelete={(prof) => setDeleteTarget(prof)}
              onToggleStar={handleToggleStar}
              onStatusChange={handleStatusChange}
              compareMode={compareMode}
              isSelected={compareIds.includes(p.id)}
              onToggleCompare={handleToggleCompare}
            />
          ))}
        </div>
        )
      )}

      {modalProfile !== undefined && (
        <ProfileModal
          profile={modalProfile}
          onClose={() => setModalProfile(undefined)}
          onSaved={() => { setModalProfile(undefined); fetchProfiles(); }}
          onToast={addToast}
        />
      )}

      {detailProfile && (
        <ProfileDetail
          profile={detailProfile}
          onClose={() => setDetailProfile(null)}
          onEdit={(prof) => { setDetailProfile(null); setModalProfile(prof); }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete ${fullName(deleteTarget)}? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    </div>
  );
}
