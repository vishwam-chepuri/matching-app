const SORT_OPTIONS = [
  { value: '', label: 'Date Added' },
  { value: 'age', label: 'Age' },
  { value: 'height', label: 'Height' },
  { value: 'dob', label: 'Date of Birth' },
  { value: 'package', label: 'Package' },
  { value: 'status', label: 'Status' },
];

export default function SortBar({ sortBy, sortDir, onSortChange }) {
  const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label || 'Date Added';
  const arrow = sortDir === 'asc' ? '\u2191' : '\u2193';

  return (
    <div className="sort-bar">
      <span className="sort-bar__current">Sorted by {currentLabel} {arrow}</span>
      <label>Sort by:</label>
      <select value={sortBy} onChange={(e) => onSortChange(e.target.value, sortDir)}>
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <button
        className="btn btn--icon"
        onClick={() => onSortChange(sortBy, sortDir === 'asc' ? 'desc' : 'asc')}
        title={sortDir === 'asc' ? 'Ascending' : 'Descending'}
      >
        {arrow} {sortDir === 'asc' ? 'Asc' : 'Desc'}
      </button>
    </div>
  );
}
