import { useState, useEffect, useCallback } from 'react';
import { getProfiles, updateProfile, deleteProfile } from '../api/profiles';
import { getUsers, updateUser, deleteUser } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { logoutUser } from '../api/auth';
import { fullName, initials, STATUS_COLORS, STATUS_OPTIONS, formatPackage, formatDOB } from '../utils/helpers';
import ProfileModal from '../components/ProfileModal';
import ConfirmDialog from '../components/ConfirmDialog';
import Toast from '../components/Toast';

const TABS = ['Dashboard', 'Users', 'Profiles'];

export default function AdminPage({ onBack }) {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('Dashboard');

  // Data
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Profile management
  const [editProfile, setEditProfile] = useState(undefined); // undefined = closed
  const [deleteProfileTarget, setDeleteProfileTarget] = useState(null);

  // User management
  const [deleteUserTarget, setDeleteUserTarget] = useState(null);
  const [toggleAdminTarget, setToggleAdminTarget] = useState(null);

  // Profile search
  const [profileSearch, setProfileSearch] = useState('');
  const [profileOwnerFilter, setProfileOwnerFilter] = useState('');
  const [profileStatusFilter, setProfileStatusFilter] = useState('');

  // Toast
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((message, type = 'success') => {
    setToasts((prev) => [...prev, { id: Date.now() + Math.random(), message, type }]);
  }, []);
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch {
      addToast('Failed to load users', 'error');
    } finally {
      setLoadingUsers(false);
    }
  }, [addToast]);

  const fetchProfiles = useCallback(async () => {
    try {
      const data = await getProfiles();
      setProfiles(data);
    } catch {
      addToast('Failed to load profiles', 'error');
    } finally {
      setLoadingProfiles(false);
    }
  }, [addToast]);

  useEffect(() => {
    fetchUsers();
    fetchProfiles();
  }, [fetchUsers, fetchProfiles]);

  // ---------- User actions ----------

  const handleToggleAdmin = async () => {
    if (!toggleAdminTarget) return;
    try {
      const updated = await updateUser(toggleAdminTarget.id, {
        is_admin: !toggleAdminTarget.is_admin,
      });
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
      addToast(
        `${updated.name || updated.email} is now ${updated.is_admin ? 'a manager' : 'a regular user'}`
      );
    } catch {
      addToast('Failed to update user', 'error');
    }
    setToggleAdminTarget(null);
  };

  const handleDeleteUser = async () => {
    if (!deleteUserTarget) return;
    try {
      await deleteUser(deleteUserTarget.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteUserTarget.id));
      setProfiles((prev) => prev.filter((p) => p.user_id !== deleteUserTarget.id));
      addToast(`User "${deleteUserTarget.name || deleteUserTarget.email}" deleted`);
    } catch (e) {
      addToast(e.message || 'Failed to delete user', 'error');
    }
    setDeleteUserTarget(null);
  };

  // ---------- Profile actions ----------

  const handleDeleteProfile = async () => {
    if (!deleteProfileTarget) return;
    try {
      await deleteProfile(deleteProfileTarget.id);
      setProfiles((prev) => prev.filter((p) => p.id !== deleteProfileTarget.id));
      addToast('Profile deleted');
    } catch {
      addToast('Failed to delete profile', 'error');
    }
    setDeleteProfileTarget(null);
  };

  // ---------- Stats ----------

  const statusCounts = STATUS_OPTIONS.reduce((acc, s) => {
    acc[s] = profiles.filter((p) => p.status === s).length;
    return acc;
  }, {});

  // ---------- Filters ----------

  const uniqueOwners = [...new Set(
    profiles.map((p) => p.owner_name).filter(Boolean)
  )].sort();

  const filteredProfiles = profiles.filter((p) => {
    if (profileStatusFilter && p.status !== profileStatusFilter) return false;
    if (profileOwnerFilter && p.owner_name !== profileOwnerFilter) return false;
    if (profileSearch) {
      const q = profileSearch.toLowerCase();
      const haystack = [p.first_name, p.last_name, p.city, p.profession_title, p.company, p.owner_name]
        .filter(Boolean).join(' ').toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  // ---------- Render ----------

  return (
    <div className="admin-page">
      {/* ── Header ────────────────────────────────────────── */}
      <header className="admin-header">
        <div className="admin-header__left">
          <h1 className="admin-header__title">Profile Manager</h1>
        </div>
        <div className="admin-header__right">
          <span className="admin-header__user">{user?.name || user?.email}</span>
          <button className="btn btn--secondary btn--small" onClick={onBack}>
            ← Back to App
          </button>
          <button
            className="btn btn--secondary btn--small"
            onClick={async () => { await logoutUser(); logout(); }}
          >
            Sign out
          </button>
        </div>
      </header>

      {/* ── Tabs ──────────────────────────────────────────── */}
      <nav className="admin-tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`admin-tab ${tab === t ? 'admin-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {t}
            {t === 'Users' && <span className="admin-tab__count">{users.length}</span>}
            {t === 'Profiles' && <span className="admin-tab__count">{profiles.length}</span>}
          </button>
        ))}
      </nav>

      <div className="admin-body">
        {/* ── Dashboard Tab ─────────────────────────────── */}
        {tab === 'Dashboard' && (
          <div className="admin-dashboard">
            <div className="admin-stats">
              <div className="admin-stat-card">
                <div className="admin-stat-card__value">{users.length}</div>
                <div className="admin-stat-card__label">Total Users</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__value">{profiles.length}</div>
                <div className="admin-stat-card__label">Total Profiles</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__value">
                  {users.filter((u) => u.is_admin).length}
                </div>
                <div className="admin-stat-card__label">Admins</div>
              </div>
              <div className="admin-stat-card">
                <div className="admin-stat-card__value">
                  {statusCounts['Shortlisted'] || 0}
                </div>
                <div className="admin-stat-card__label">Shortlisted</div>
              </div>
            </div>

            <h2 className="admin-section-title">Profiles by Status</h2>
            <div className="admin-status-grid">
              {STATUS_OPTIONS.map((s) => (
                <div key={s} className="admin-status-chip">
                  <span
                    className="admin-status-dot"
                    style={{ background: STATUS_COLORS[s] }}
                  />
                  <span className="admin-status-name">{s}</span>
                  <span className="admin-status-count">{statusCounts[s] || 0}</span>
                </div>
              ))}
            </div>

            <h2 className="admin-section-title">Users Overview</h2>
            <div className="admin-user-overview">
              {loadingUsers ? (
                <p className="admin-loading">Loading...</p>
              ) : users.map((u) => (
                <div key={u.id} className="admin-user-row">
                  <div className="admin-user-row__avatar" style={{ background: '#6B7280' }}>
                    {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                  </div>
                  <div className="admin-user-row__info">
                    <span className="admin-user-row__name">{u.name || '—'}</span>
                    <span className="admin-user-row__email">{u.email}</span>
                  </div>
                  {u.is_admin && <span className="admin-badge admin-badge--admin">Admin</span>}
                  <span className="admin-user-row__profiles">{u.profile_count} profiles</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Users Tab ─────────────────────────────────── */}
        {tab === 'Users' && (
          <div className="admin-users">
            {loadingUsers ? (
              <p className="admin-loading">Loading users...</p>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Profiles</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} className={u.id === user?.id ? 'admin-table__row--self' : ''}>
                      <td>
                        <div className="admin-table__user-cell">
                          <div className="admin-table__avatar">
                            {(u.name?.[0] || u.email?.[0] || '?').toUpperCase()}
                          </div>
                          <span>{u.name || <em>No name</em>}</span>
                          {u.id === user?.id && (
                            <span className="admin-badge admin-badge--you">You</span>
                          )}
                        </div>
                      </td>
                      <td className="admin-table__email">{u.email}</td>
                      <td>
                        <span className={`admin-badge ${u.is_admin ? 'admin-badge--admin' : 'admin-badge--user'}`}>
                          {u.is_admin ? 'Admin' : 'User'}
                        </span>
                      </td>
                      <td className="admin-table__center">{u.profile_count}</td>
                      <td className="admin-table__date">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric',
                        }) : '—'}
                      </td>
                      <td>
                        <div className="admin-table__actions">
                          <button
                            className={`btn btn--small ${u.is_admin ? 'btn--warning' : 'btn--secondary'}`}
                            title={u.is_admin ? 'Revoke admin' : 'Make admin'}
                            disabled={u.id === user?.id}
                            onClick={() => setToggleAdminTarget(u)}
                          >
                            {u.is_admin ? 'Revoke Admin' : 'Make Admin'}
                          </button>
                          <button
                            className="btn btn--small btn--danger"
                            title="Delete user"
                            disabled={u.id === user?.id}
                            onClick={() => setDeleteUserTarget(u)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* ── Profiles Tab ──────────────────────────────── */}
        {tab === 'Profiles' && (
          <div className="admin-profiles">
            {/* Filters */}
            <div className="admin-profiles__filters">
              <input
                className="admin-profiles__search"
                type="search"
                placeholder="Search profiles..."
                value={profileSearch}
                onChange={(e) => setProfileSearch(e.target.value)}
              />
              <select
                className="admin-profiles__select"
                value={profileOwnerFilter}
                onChange={(e) => setProfileOwnerFilter(e.target.value)}
              >
                <option value="">All owners</option>
                {uniqueOwners.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
              <select
                className="admin-profiles__select"
                value={profileStatusFilter}
                onChange={(e) => setProfileStatusFilter(e.target.value)}
              >
                <option value="">All statuses</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
              <span className="admin-profiles__count">
                {filteredProfiles.length} of {profiles.length}
              </span>
            </div>

            {loadingProfiles ? (
              <p className="admin-loading">Loading profiles...</p>
            ) : filteredProfiles.length === 0 ? (
              <p className="admin-empty">No profiles match the filters.</p>
            ) : (
              <div className="admin-profile-list">
                {filteredProfiles.map((p) => (
                  <div key={p.id} className="admin-profile-item">
                    {/* Avatar */}
                    <div
                      className="admin-profile-item__avatar"
                      style={{ background: p.avatar_color || '#6B7280' }}
                    >
                      {initials(p)}
                    </div>

                    {/* Info */}
                    <div className="admin-profile-item__info">
                      <span className="admin-profile-item__name">{fullName(p)}</span>
                      <span className="admin-profile-item__meta">
                        {p.profession_title || ''}
                        {p.profession_title && p.city ? ' · ' : ''}
                        {p.city || ''}
                        {p.package ? ` · ${formatPackage(p.package)}` : ''}
                      </span>
                    </div>

                    {/* Owner */}
                    <div className="admin-profile-item__owner">
                      <span className="admin-profile-item__owner-label">Owner</span>
                      <span className="admin-profile-item__owner-name">{p.owner_name || '(unassigned)'}</span>
                    </div>

                    {/* Status */}
                    <span
                      className="admin-profile-item__status"
                      style={{
                        background: `${STATUS_COLORS[p.status] || '#6B7280'}20`,
                        color: STATUS_COLORS[p.status] || '#6B7280',
                      }}
                    >
                      {p.status || 'New'}
                    </span>

                    {/* Actions */}
                    <div className="admin-profile-item__actions">
                      <button
                        className="btn btn--small btn--secondary"
                        onClick={() => setEditProfile(p)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn--small btn--danger"
                        onClick={() => setDeleteProfileTarget(p)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Modals ────────────────────────────────────────── */}

      {editProfile !== undefined && (
        <ProfileModal
          profile={editProfile}
          onClose={() => setEditProfile(undefined)}
          onSaved={() => { setEditProfile(undefined); fetchProfiles(); }}
          onToast={addToast}
        />
      )}

      {deleteProfileTarget && (
        <ConfirmDialog
          message={`Delete ${fullName(deleteProfileTarget)}? This cannot be undone.`}
          onConfirm={handleDeleteProfile}
          onCancel={() => setDeleteProfileTarget(null)}
        />
      )}

      {deleteUserTarget && (
        <ConfirmDialog
          message={`Delete user "${deleteUserTarget.name || deleteUserTarget.email}"? All their profiles (${
            users.find((u) => u.id === deleteUserTarget.id)?.profile_count ?? 0
          }) will also be deleted. This cannot be undone.`}
          onConfirm={handleDeleteUser}
          onCancel={() => setDeleteUserTarget(null)}
        />
      )}

      {toggleAdminTarget && (
        <ConfirmDialog
          message={
            toggleAdminTarget.is_admin
              ? `Revoke admin access from "${toggleAdminTarget.name || toggleAdminTarget.email}"?`
              : `Grant admin access to "${toggleAdminTarget.name || toggleAdminTarget.email}"? They will be able to view and manage all data.`
          }
          onConfirm={handleToggleAdmin}
          onCancel={() => setToggleAdminTarget(null)}
        />
      )}

      <Toast toasts={toasts} removeToast={removeToast} />
    </div>
  );
}
