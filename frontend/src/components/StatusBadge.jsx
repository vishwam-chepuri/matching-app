import { STATUS_COLORS } from '../utils/helpers';

export default function StatusBadge({ status }) {
  const color = STATUS_COLORS[status] || '#6B7280';
  return (
    <span
      className="status-badge"
      style={{ backgroundColor: color }}
    >
      {status}
    </span>
  );
}
