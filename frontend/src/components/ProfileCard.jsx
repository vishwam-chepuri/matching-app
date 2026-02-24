import { useState, useRef, useEffect } from 'react';
import { fullName, initials, cmToFtIn, formatPackage, formatDOB, STATUS_OPTIONS, STATUS_COLORS } from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { LinkedInIcon, InstagramIcon } from './SocialIcons';


export default function ProfileCard({
  profile, onView, onEdit, onDelete, onToggleStar, onStatusChange,
  compareMode, isSelected, onToggleCompare,
}) {
  const { isAdmin } = useAuth();
  const photo = profile.photos?.[0];
  const hasPhotos = profile.photos?.length > 0;

  // Context menu state (right-click / long-press)
  const [contextMenu, setContextMenu] = useState(null); // { x, y }
  const [statusDropdown, setStatusDropdown] = useState(false);
  const longPressTimer = useRef(null);
  const cardRef = useRef(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setContextMenu(null);
        setStatusDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Right-click handler (desktop)
  const handleContextMenu = (e) => {
    if (compareMode) return;
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
    setStatusDropdown(false);
  };

  // Long-press handlers (mobile)
  const handleTouchStart = (e) => {
    if (compareMode) return;
    longPressTimer.current = setTimeout(() => {
      const touch = e.touches[0];
      setContextMenu({ x: touch.clientX, y: touch.clientY });
      setStatusDropdown(false);
    }, 500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Card click - only navigate if no context menu open
  const handleCardClick = () => {
    if (contextMenu || statusDropdown) {
      setContextMenu(null);
      setStatusDropdown(false);
      return;
    }
    if (!compareMode) {
      onView(profile);
    }
  };

  // Status badge click
  const handleStatusClick = (e) => {
    e.stopPropagation();
    setStatusDropdown(!statusDropdown);
    setContextMenu(null);
  };

  const handleStatusSelect = (status) => {
    onStatusChange(profile.id, status);
    setStatusDropdown(false);
  };

  const handleEdit = (e) => {
    e.stopPropagation();
    setContextMenu(null);
    onEdit(profile);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    setContextMenu(null);
    onDelete(profile);
  };

  const statusColor = STATUS_COLORS[profile.status] || '#6B7280';

  return (
    <div
      ref={cardRef}
      className="card"
      onClick={handleCardClick}
      onContextMenu={handleContextMenu}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchMove}
    >
      {compareMode && (
        <label className="card__checkbox" onClick={(e) => e.stopPropagation()}>
          <input type="checkbox" checked={isSelected} onChange={() => onToggleCompare(profile.id)} />
        </label>
      )}

      {isAdmin && profile.owner_name && (
        <span className={`card__owner-tag${compareMode ? ' card__owner-tag--compare' : ''}`}>{profile.owner_name}</span>
      )}

      {/* ── Visual Top: Photo or Gradient Banner ── */}
      {photo ? (
        <div className="card__img-wrap">
          <img src={photo.url} alt={fullName(profile)} className="card__img" />
          <div className="card__img-overlay">
            <button
              className="status-pill"
              style={{ backgroundColor: statusColor }}
              onClick={handleStatusClick}
            >
              {profile.status}
            </button>
            {hasPhotos && profile.photos.length > 1 && (
              <span className="card__photo-count">{'\uD83D\uDCF7'} {profile.photos.length}</span>
            )}
          </div>
          <button
            className={`card__star ${profile.starred ? 'card__star--active' : ''}${isAdmin ? ' card__star--readonly' : ''}`}
            onClick={(e) => { e.stopPropagation(); if (!isAdmin) onToggleStar(profile.id, !profile.starred); }}
            disabled={isAdmin}
            title={isAdmin ? 'Favouriting is only for the profile owner' : undefined}
          >
            {profile.starred ? '\u2B50' : '\u2606'}
          </button>
        </div>
      ) : (
        <div className="card__banner" style={{ '--avatar-bg': profile.avatar_color || '#7B1B1B' }}>
          <div className="card__banner-deco" />
          <div className="card__avatar">
            {initials(profile)}
          </div>
          <div className="card__banner-meta">
            <button
              className="status-pill"
              style={{ backgroundColor: statusColor }}
              onClick={handleStatusClick}
            >
              {profile.status}
            </button>
          </div>
          <button
            className={`card__star card__star--on-banner ${profile.starred ? 'card__star--active' : ''}${isAdmin ? ' card__star--readonly' : ''}`}
            onClick={(e) => { e.stopPropagation(); if (!isAdmin) onToggleStar(profile.id, !profile.starred); }}
            disabled={isAdmin}
            title={isAdmin ? 'Favouriting is only for the profile owner' : undefined}
          >
            {profile.starred ? '\u2B50' : '\u2606'}
          </button>
        </div>
      )}

      {/* ── Status Dropdown ── */}
      {statusDropdown && (
        <div className="status-dropdown" onClick={(e) => e.stopPropagation()}>
          {STATUS_OPTIONS.map((s) => (
            <button
              key={s}
              className={`status-dropdown__item ${s === profile.status ? 'status-dropdown__item--active' : ''}`}
              style={{ '--status-color': STATUS_COLORS[s] || '#6B7280' }}
              onClick={() => handleStatusSelect(s)}
            >
              <span className="status-dropdown__dot" />
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Card Body ── */}
      <div className="card__body">
        <div className="card__name-row">
          <h3 className="card__name">{fullName(profile)}</h3>
          {(profile.linkedin || profile.instagram) && (
            <div className="card__socials" onClick={(e) => e.stopPropagation()}>
              {profile.linkedin && (
                <a
                  href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card__social-link card__social-link--linkedin"
                  title="LinkedIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <LinkedInIcon />
                </a>
              )}
              {profile.instagram && (
                <a
                  href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="card__social-link card__social-link--instagram"
                  title={profile.instagram.startsWith('@') ? profile.instagram : `@${profile.instagram}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <InstagramIcon />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Key stats row */}
        <div className="card__stats">
          <span className="card__stat">{profile.age} yrs</span>
          {profile.height_cm && <span className="card__stat">{cmToFtIn(profile.height_cm)}</span>}
          {profile.package && <span className="card__stat card__stat--gold">{formatPackage(profile.package)}</span>}
        </div>

        <p className="card__dob">{formatDOB(profile.date_of_birth)}</p>

        {/* Info lines */}
        <div className="card__info">
          <div className="card__info-row">
            <span className="card__icon">{'\uD83D\uDCCD'}</span>
            <span>{profile.city}{profile.state ? `, ${profile.state}` : ''}</span>
          </div>
          {(profile.profession_title || profile.edu_level) && (
            <div className="card__info-row">
              <span className="card__icon">{'\uD83C\uDF93'}</span>
              <span>{[profile.edu_level, profile.profession_title].filter(Boolean).join(' \u00B7 ')}</span>
            </div>
          )}
          {(profile.company || profile.company_location) && (
            <div className="card__info-row">
              <span className="card__icon">{'\uD83C\uDFE2'}</span>
              <span>{[profile.company, profile.company_location].filter(Boolean).join(' \u00B7 ')}</span>
            </div>
          )}
          {profile.caste && (
            <div className="card__info-row">
              <span className="card__icon">{'\uD83D\uDD49\uFE0F'}</span>
              <span>{profile.caste}{profile.rashi ? ` \u00B7 ${profile.rashi}` : ''}</span>
            </div>
          )}
          {profile.phone && (
            <div className="card__info-row">
              <span className="card__icon">{'📞'}</span>
              <a
                href={`tel:${profile.phone}`}
                className="card__phone-link"
                onClick={(e) => e.stopPropagation()}
              >
                {profile.phone}
              </a>
            </div>
          )}
        </div>

        {profile.notes && (
          <p className="card__notes">
            {profile.notes.length > 80 ? profile.notes.slice(0, 80) + '\u2026' : profile.notes}
          </p>
        )}
      </div>

      {/* ── Context Menu (right-click / long-press) ── */}
      {contextMenu && (
        <div
          className="card__context-menu"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()}
        >
          <button className="card__context-item" onClick={handleEdit}>
            <span>{'\u270F\uFE0F'}</span> Edit
          </button>
          <button className="card__context-item card__context-item--danger" onClick={handleDelete}>
            <span>{'\uD83D\uDDD1\uFE0F'}</span> Delete
          </button>
        </div>
      )}
    </div>
  );
}
