import { fullName, initials, cmToFtIn, formatPackage, formatDOB } from '../utils/helpers';
import StatusBadge from './StatusBadge';

const ROWS = [
  { label: 'Full Name', fn: (p) => fullName(p) },
  { label: 'Age', fn: (p) => p.age },
  { label: 'Date of Birth', fn: (p) => formatDOB(p.date_of_birth) },
  { label: 'Height', fn: (p) => cmToFtIn(p.height_cm) },
  { label: 'City', fn: (p) => [p.city, p.district].filter(Boolean).join(', ') },
  { label: 'Education', fn: (p) => [p.edu_level, p.edu_field].filter(Boolean).join(' — ') },
  { label: 'Institution', fn: (p) => p.edu_institution },
  { label: 'Profession', fn: (p) => p.profession_title },
  { label: 'Company', fn: (p) => p.company },
  { label: 'Company Location', fn: (p) => p.company_location },
  { label: 'Package', fn: (p) => formatPackage(p.package) },
  { label: 'Caste', fn: (p) => [p.caste, p.subcaste].filter(Boolean).join(' / ') },
  { label: "Father's Name", fn: (p) => p.fathers_name },
  { label: "Mother's Name", fn: (p) => p.mothers_name },
  { label: 'Siblings', fn: (p) => p.siblings },
  { label: 'Rashi', fn: (p) => p.rashi },
  { label: 'Status', fn: (p) => p.status },
  { label: 'Notes', fn: (p) => p.notes },
];

export default function CompareView({ profiles, onClose }) {
  return (
    <div className="compare-view">
      <div className="compare-view__header">
        <h2>Compare Profiles</h2>
        <button className="btn btn--secondary" onClick={onClose}>Close</button>
      </div>
      <div className="compare-view__table-wrap">
        <table className="compare-view__table">
          <thead>
            <tr>
              <th></th>
              {profiles.map((p) => (
                <th key={p.id}>
                  <div className="compare-view__profile-header">
                    {p.photos?.[0] ? (
                      <img src={p.photos[0].url} alt={fullName(p)} className="compare-view__avatar-img" />
                    ) : (
                      <div className="compare-view__avatar" style={{ backgroundColor: p.avatar_color || '#7B1B1B' }}>
                        {initials(p)}
                      </div>
                    )}
                    <span>{fullName(p)}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => {
              const values = profiles.map((p) => row.fn(p) || '—');
              const allSame = values.every((v) => v === values[0]);
              return (
                <tr key={row.label}>
                  <td className="compare-view__label">{row.label}</td>
                  {values.map((val, i) => (
                    <td key={i} style={!allSame ? { backgroundColor: '#FEF9C3' } : undefined}>
                      {row.label === 'Status' ? <StatusBadge status={profiles[i].status} /> : val}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
