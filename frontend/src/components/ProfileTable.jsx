import { useState, useMemo, useEffect, useRef } from 'react';
import {
  fullName, initials, cmToFtIn, formatPackage, formatDOB,
  STATUS_OPTIONS, STATUS_COLORS,
} from '../utils/helpers';
import { useAuth } from '../context/AuthContext';
import { LinkedInIcon, InstagramIcon } from './SocialIcons';

// ── Column definitions ──────────────────────────────────────────────────────
const COLS = [
  { key: 'starred',          label: '★',            sortKey: null,         align: 'center', width: '44px' },
  { key: 'name',             label: 'Name',          sortKey: 'name',       sticky: true },
  { key: 'status',           label: 'Status',        sortKey: 'status' },
  { key: 'age',              label: 'Age',           sortKey: 'age',        align: 'right',  width: '64px' },
  { key: 'date_of_birth',    label: 'Date of Birth', sortKey: 'dob',        width: '120px' },
  { key: 'height_cm',        label: 'Height',        sortKey: 'height',     align: 'right',  width: '96px' },
  { key: 'city',             label: 'Native',        sortKey: 'native' },
  { key: 'company_location', label: 'Work City',     sortKey: 'work_city' },
  { key: 'package',          label: 'Package',       sortKey: 'package',    align: 'right' },
  { key: 'edu_level',        label: 'Education',     sortKey: null },
  { key: 'company',          label: 'Company',       sortKey: null },
  { key: 'caste',            label: 'Caste',         sortKey: null,         width: '100px' },
  { key: 'phone',            label: 'Phone',         sortKey: null,         width: '140px', adminOnly: false },
  { key: 'socials',          label: 'Socials',       sortKey: null,         width: '80px',  align: 'center' },
  { key: 'source',           label: 'Source',        sortKey: null,         width: '130px', adminOnly: true },
  { key: 'meeting_date',     label: 'Meeting',       sortKey: 'meeting',    width: '110px' },
  { key: 'actions',          label: '',              sortKey: null,         align: 'center', width: '80px' },
];

// ── Client-side sort ────────────────────────────────────────────────────────
function applySortTable(profiles, col, dir) {
  if (!col) return profiles;
  const m = dir === 'asc' ? 1 : -1;
  return [...profiles].sort((a, b) => {
    let va, vb;
    switch (col) {
      case 'name':      va = fullName(a).toLowerCase(); vb = fullName(b).toLowerCase(); break;
      case 'status':    va = a.status || ''; vb = b.status || ''; break;
      case 'age':       va = a.age ?? -Infinity; vb = b.age ?? -Infinity; break;
      case 'dob':       va = a.date_of_birth || ''; vb = b.date_of_birth || ''; break;
      case 'height':    va = a.height_cm ?? -Infinity; vb = b.height_cm ?? -Infinity; break;
      case 'native':    va = (a.city || '').toLowerCase(); vb = (b.city || '').toLowerCase(); break;
      case 'work_city': va = (a.company_location || '').toLowerCase(); vb = (b.company_location || '').toLowerCase(); break;
      case 'package':   va = Number(a.package) || -Infinity; vb = Number(b.package) || -Infinity; break;
      case 'added_by':  va = (a.added_by || '').toLowerCase(); vb = (b.added_by || '').toLowerCase(); break;
      case 'meeting':   va = a.meeting_date || ''; vb = b.meeting_date || ''; break;
      default:          return 0;
    }
    if (va < vb) return -m;
    if (va > vb) return m;
    return 0;
  });
}

// ── Component ───────────────────────────────────────────────────────────────
export default function ProfileTable({
  profiles, onView, onEdit, onDelete, onToggleStar, onStatusChange,
}) {
  const { isAdmin } = useAuth();
  const visibleCols = COLS.filter((c) => !c.adminOnly || isAdmin);
  const [sortCol, setSortCol] = useState(null);
  const [sortDir, setSortDir] = useState('asc');
  const [openStatus, setOpenStatus] = useState(null); // profile id with open status popover
  const tableRef = useRef(null);

  // Close status popover on outside click
  useEffect(() => {
    const handler = (e) => {
      if (tableRef.current && !tableRef.current.contains(e.target)) {
        setOpenStatus(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleColSort = (key) => {
    if (!key) return;
    if (sortCol === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortCol(key);
      setSortDir('asc');
    }
  };

  const sorted = useMemo(
    () => applySortTable(profiles, sortCol, sortDir),
    [profiles, sortCol, sortDir],
  );

  const SortIcon = ({ col }) => {
    if (sortCol !== col) return <span className="tbl__sort-icon tbl__sort-icon--idle">↕</span>;
    return <span className="tbl__sort-icon">{sortDir === 'asc' ? '↑' : '↓'}</span>;
  };

  return (
    <div className="tbl-wrap" ref={tableRef}>
      {sorted.length === 0 ? null : (
        <div className="tbl-scroll">
          <table className="tbl">
            {/* ── Header ── */}
            <thead>
              <tr>
                {visibleCols.map((c) => (
                  <th
                    key={c.key}
                    className={[
                      'tbl__th',
                      c.sortKey ? 'tbl__th--sortable' : '',
                      c.sortKey && sortCol === c.sortKey ? 'tbl__th--sorted' : '',
                      c.sticky ? 'tbl__th--sticky' : '',
                      c.align === 'right' ? 'tbl__th--right' : '',
                      c.align === 'center' ? 'tbl__th--center' : '',
                    ].filter(Boolean).join(' ')}
                    style={c.width ? { width: c.width, minWidth: c.width } : undefined}
                    onClick={() => handleColSort(c.sortKey)}
                  >
                    <span className="tbl__th-inner">
                      {c.label}
                      {c.sortKey && <SortIcon col={c.sortKey} />}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>

            {/* ── Body ── */}
            <tbody>
              {sorted.map((p, idx) => (
                <tr
                  key={p.id}
                  className={`tbl__row ${idx % 2 === 1 ? 'tbl__row--alt' : ''}`}
                  onClick={() => onView(p)}
                >
                  {/* ── Star ── */}
                  <td
                    className="tbl__td tbl__td--center"
                    onClick={(e) => { e.stopPropagation(); if (!isAdmin) onToggleStar(p.id, !p.starred); }}
                    title={isAdmin ? 'Favouriting is only for the profile owner' : (p.starred ? 'Unstar' : 'Star')}
                    style={isAdmin ? { cursor: 'default' } : undefined}
                  >
                    <span className={`tbl__star ${p.starred ? 'tbl__star--on' : ''}${isAdmin ? ' tbl__star--readonly' : ''}`}>
                      {p.starred ? '★' : '☆'}
                    </span>
                  </td>

                  {/* ── Name ── */}
                  <td className="tbl__td tbl__td--sticky">
                    <div className="tbl__name-cell">
                      <div
                        className="tbl__avatar"
                        style={{ background: p.avatar_color || '#6B7280' }}
                      >
                        {initials(p)}
                      </div>
                      <div className="tbl__name-text">
                        <span className="tbl__name">{fullName(p)}</span>
                      </div>
                    </div>
                  </td>

                  {/* ── Status ── */}
                  <td
                    className="tbl__td tbl__td--status"
                    onClick={(e) => { e.stopPropagation(); setOpenStatus(openStatus === p.id ? null : p.id); }}
                    title="Click to change status"
                  >
                    <div className="tbl__status-wrap">
                      <span
                        className="tbl__status-pill"
                        style={{
                          background: `${STATUS_COLORS[p.status] || '#6B7280'}1a`,
                          color: STATUS_COLORS[p.status] || '#6B7280',
                          borderColor: `${STATUS_COLORS[p.status] || '#6B7280'}44`,
                        }}
                      >
                        <span
                          className="tbl__status-dot"
                          style={{ background: STATUS_COLORS[p.status] || '#6B7280' }}
                        />
                        {p.status || 'New'}
                        <span className="tbl__status-caret">▾</span>
                      </span>

                      {openStatus === p.id && (
                        <div className="tbl__status-menu" onClick={(e) => e.stopPropagation()}>
                          {STATUS_OPTIONS.map((s) => (
                            <button
                              key={s}
                              className={`tbl__status-opt ${s === p.status ? 'tbl__status-opt--active' : ''}`}
                              onClick={() => { onStatusChange(p.id, s); setOpenStatus(null); }}
                            >
                              <span
                                className="tbl__status-opt-dot"
                                style={{ background: STATUS_COLORS[s] }}
                              />
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>

                  {/* ── Age ── */}
                  <td className="tbl__td tbl__td--num">
                    {p.age ?? <span className="tbl__null">—</span>}
                  </td>

                  {/* ── DOB ── */}
                  <td className="tbl__td tbl__td--mono">
                    {formatDOB(p.date_of_birth) || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Height ── */}
                  <td className="tbl__td tbl__td--num">
                    {p.height_cm ? (
                      <>
                        {cmToFtIn(p.height_cm)}
                        <span className="tbl__sub"> {p.height_cm}cm</span>
                      </>
                    ) : <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Native City ── */}
                  <td className="tbl__td">
                    {[p.city, p.state].filter(Boolean).join(', ') || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Work City ── */}
                  <td className="tbl__td">
                    {p.company_location || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Package ── */}
                  <td className="tbl__td tbl__td--num tbl__td--gold">
                    {p.package ? formatPackage(p.package) : <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Education ── */}
                  <td className="tbl__td tbl__td--clamp">
                    {p.edu_level || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Company ── */}
                  <td className="tbl__td tbl__td--clamp">
                    {p.company || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Caste ── */}
                  <td className="tbl__td">
                    {p.caste || <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Phone ── */}
                  <td className="tbl__td tbl__td--mono">
                    {p.phone
                      ? <a href={`tel:${p.phone}`} className="tbl__phone" onClick={(e) => e.stopPropagation()}>{p.phone}</a>
                      : <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Socials ── */}
                  <td className="tbl__td tbl__td--center" onClick={(e) => e.stopPropagation()}>
                    <div className="tbl__socials">
                      {p.linkedin ? (
                        <a
                          href={p.linkedin.startsWith('http') ? p.linkedin : `https://${p.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tbl__social-link tbl__social-link--linkedin"
                          title="LinkedIn"
                        >
                          <LinkedInIcon size={13} />
                        </a>
                      ) : <span className="tbl__social-placeholder" />}
                      {p.instagram ? (
                        <a
                          href={`https://instagram.com/${p.instagram.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="tbl__social-link tbl__social-link--instagram"
                          title={p.instagram.startsWith('@') ? p.instagram : `@${p.instagram}`}
                        >
                          <InstagramIcon size={13} />
                        </a>
                      ) : <span className="tbl__social-placeholder" />}
                    </div>
                  </td>


                  {/* ── Source (admin only) ── */}
                  {isAdmin && (
                    <td className="tbl__td">
                      {p.source
                        ? <span className="tbl__source-chip">{p.source}</span>
                        : <span className="tbl__null">—</span>}
                    </td>
                  )}

                  {/* ── Meeting Date ── */}
                  <td className="tbl__td tbl__td--mono">
                    {p.meeting_date ? formatDOB(p.meeting_date) : <span className="tbl__null">—</span>}
                  </td>

                  {/* ── Actions ── */}
                  <td
                    className="tbl__td tbl__td--center tbl__td--actions"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      className="tbl__action"
                      title="Edit"
                      onClick={() => onEdit(p)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      className="tbl__action tbl__action--del"
                      title="Delete"
                      onClick={() => onDelete(p)}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6M14 11v6"/>
                        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
