import { useState } from 'react';
import { fullName, initials, cmToFtIn, formatPackage, formatDOB } from '../utils/helpers';
import StatusBadge from './StatusBadge';
import { useAuth } from '../context/AuthContext';

export default function ProfileDetail({ profile, onClose, onEdit }) {
  const { isAdmin } = useAuth();
  const photos = profile.photos || [];
  const hasPhotos = photos.length > 0;
  const [activePhoto, setActivePhoto] = useState(0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="detail" onClick={(e) => e.stopPropagation()}>

        {/* ── Hero Area ── */}
        {hasPhotos ? (
          <div className="detail__hero-photo">
            <img src={photos[activePhoto]?.url} alt={fullName(profile)} className="detail__hero-img" />
            <div className="detail__hero-gradient" />
            {isAdmin && profile.owner_name && (
              <span className="detail__owner-tag">{profile.owner_name}</span>
            )}
            <div className="detail__hero-info">
              <h2 className="detail__name detail__name--on-photo">
                {fullName(profile)}
                {profile.starred && <span className="detail__star">{'\u2B50'}</span>}
              </h2>
              <p className="detail__tagline">
                {profile.age} yrs{profile.height_cm ? ` \u00B7 ${cmToFtIn(profile.height_cm)}` : ''}
                {' \u00B7 '}{profile.city}{profile.state ? `, ${profile.state}` : ''}
              </p>
            </div>
            <div className="detail__hero-actions">
              <StatusBadge status={profile.status} />
              <button className="btn btn--primary btn--small" onClick={() => onEdit(profile)}>Edit</button>
              <button className="detail__close-btn" onClick={onClose}>&times;</button>
            </div>
            {/* Thumbnail strip — bottom-right overlay */}
            {photos.length > 1 && (
              <div className="detail__thumb-strip">
                {photos.map((p, i) => (
                  <img
                    key={p.id}
                    src={p.url}
                    alt={`Photo ${i + 1}`}
                    className={`detail__thumb ${i === activePhoto ? 'detail__thumb--active' : ''}`}
                    onClick={() => setActivePhoto(i)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="detail__hero-banner" style={{ '--avatar-bg': profile.avatar_color || '#7B1B1B' }}>
            <div className="detail__banner-pattern" />
            {isAdmin && profile.owner_name && (
              <span className="detail__owner-tag detail__owner-tag--on-banner">{profile.owner_name}</span>
            )}
            <div className="detail__banner-content">
              <div className="detail__avatar-large">
                {initials(profile)}
              </div>
              <div className="detail__banner-text">
                <h2 className="detail__name detail__name--on-banner">
                  {fullName(profile)}
                  {profile.starred && <span className="detail__star">{'\u2B50'}</span>}
                </h2>
                <p className="detail__tagline detail__tagline--on-banner">
                  {profile.age} yrs{profile.height_cm ? ` \u00B7 ${cmToFtIn(profile.height_cm)}` : ''}
                  {' \u00B7 '}{profile.city}{profile.state ? `, ${profile.state}` : ''}
                </p>
              </div>
            </div>
            <div className="detail__hero-actions detail__hero-actions--on-banner">
              <StatusBadge status={profile.status} />
              <button className="btn btn--primary btn--small" onClick={() => onEdit(profile)}>Edit</button>
              <button className="detail__close-btn detail__close-btn--on-banner" onClick={onClose}>&times;</button>
            </div>
          </div>
        )}

        {/* ── Quick Stats Bar ── */}
        <div className="detail__stats-bar">
          <StatChip label="Age" value={`${profile.age} yrs`} />
          {profile.height_cm && <StatChip label="Height" value={cmToFtIn(profile.height_cm)} />}
          {profile.package && <StatChip label="Package" value={formatPackage(profile.package)} highlight />}
          <StatChip label="DOB" value={formatDOB(profile.date_of_birth)} />
          {profile.meeting_date && <StatChip label="Meeting" value={formatDOB(profile.meeting_date)} accent />}
        </div>

        {/* ── Detail Body ── */}
        <div className="detail__body">
          <div className="detail__columns">
            <div className="detail__col">
              <DetailSection icon={'\uD83D\uDCCD'} title="Location">
                <DetailRow label="City" value={profile.city} />
                <DetailRow label="State" value={profile.state} />
              </DetailSection>

              <DetailSection icon={'\uD83D\uDD49\uFE0F'} title="Background">
                <DetailRow label="Caste" value={profile.caste} />
                <DetailRow label="Subcaste" value={profile.subcaste} />
              </DetailSection>

              <DetailSection icon={'\uD83C\uDF93'} title="Education">
                <DetailRow label="Level" value={profile.edu_level} />
                <DetailRow label="Field" value={profile.edu_field} />
                <DetailRow label="Institution" value={profile.edu_institution} />
              </DetailSection>
              {(profile.phone || profile.linkedin || profile.instagram) && (
                <DetailSection icon={'📞'} title="Contact">
                  {profile.phone && (
                    <div className="detail__row">
                      <span className="detail__row-label">Phone</span>
                      <a href={`tel:${profile.phone}`} className="detail__link detail__link--phone">{profile.phone}</a>
                    </div>
                  )}
                  {profile.linkedin && (
                    <div className="detail__row">
                      <span className="detail__row-label">LinkedIn</span>
                      <a
                        href={profile.linkedin.startsWith('http') ? profile.linkedin : `https://${profile.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail__link detail__link--linkedin"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {profile.linkedin.replace(/^https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                  {profile.instagram && (
                    <div className="detail__row">
                      <span className="detail__row-label">Instagram</span>
                      <a
                        href={`https://instagram.com/${profile.instagram.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="detail__link detail__link--instagram"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {profile.instagram.startsWith('@') ? profile.instagram : `@${profile.instagram}`}
                      </a>
                    </div>
                  )}
                </DetailSection>
              )}
              {isAdmin && (profile.added_by || profile.source) && (
                <DetailSection icon={'📋'} title="Source">
                  <DetailRow label="Added By" value={profile.added_by} />
                  <DetailRow label="Source" value={profile.source} />
                </DetailSection>
              )}            </div>

            <div className="detail__col">
              <DetailSection icon={'\uD83D\uDCBC'} title="Career">
                <DetailRow label="Profession" value={profile.profession_title} />
                <DetailRow label="Company" value={profile.company} />
                <DetailRow label="Location" value={profile.company_location} />
                <DetailRow label="Package" value={formatPackage(profile.package)} />
              </DetailSection>

              <DetailSection icon={'\uD83D\uDC68\u200D\uD83D\uDC69\u200D\uD83D\uDC67'} title="Family">
                <DetailRow label="Father" value={[profile.fathers_name, profile.fathers_occupation].filter(Boolean).join(' \u2014 ')} />
                <DetailRow label="Mother" value={[profile.mothers_name, profile.mothers_occupation].filter(Boolean).join(' \u2014 ')} />
                <DetailRow label="Siblings" value={profile.siblings != null ? String(profile.siblings) : null} />
              </DetailSection>

              <DetailSection icon={'\u2728'} title="Horoscope">
                <DetailRow label="Rashi" value={profile.rashi} />
                <DetailRow label="Nakshatra" value={profile.nakshatra} />
                <DetailRow label="Gotra" value={profile.gotra} />
              </DetailSection>
            </div>
          </div>

          {profile.notes && (
            <div className="detail__notes-section">
              <h4 className="detail__section-title">{'\uD83D\uDCDD'} Notes</h4>
              <p className="detail__notes-text">{profile.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatChip({ label, value, highlight, accent }) {
  if (!value) return null;
  return (
    <div className={`detail__stat-chip ${highlight ? 'detail__stat-chip--highlight' : ''} ${accent ? 'detail__stat-chip--accent' : ''}`}>
      <span className="detail__stat-label">{label}</span>
      <span className="detail__stat-value">{value}</span>
    </div>
  );
}

function DetailSection({ icon, title, children }) {
  const validChildren = Array.isArray(children)
    ? children.filter((c) => c)
    : children;
  if (!validChildren || (Array.isArray(validChildren) && validChildren.length === 0)) return null;

  return (
    <div className="detail__section">
      <h4 className="detail__section-title">{icon} {title}</h4>
      <div className="detail__section-rows">{validChildren}</div>
    </div>
  );
}

function DetailRow({ label, value }) {
  if (!value) return null;
  return (
    <div className="detail__row">
      <span className="detail__row-label">{label}</span>
      <span className="detail__row-value">{value}</span>
    </div>
  );
}
