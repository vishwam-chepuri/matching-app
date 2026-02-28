export function fullName(profile) {
  return `${profile.first_name} ${profile.last_name}`;
}

export function initials(profile) {
  return `${(profile.first_name?.[0] || '').toUpperCase()}${(profile.last_name?.[0] || '').toUpperCase()}`;
}

export function cmToFtIn(cm) {
  if (!cm) return '';
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return `${feet}' ${inches}"`;
}

export function formatPackage(lpa) {
  if (lpa == null || lpa === '') return '';
  return `\u20B9${Number(lpa).toFixed(1)} LPA`;
}

export function formatDOB(dob) {
  if (!dob) return '';
  const d = new Date(dob + 'T00:00:00');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function computeAge(dob) {
  if (!dob) return '';
  const birth = new Date(dob + 'T00:00:00');
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
}

const AVATAR_COLORS = [
  '#7B1B1B', '#C9963E', '#2563EB', '#7C3AED',
  '#059669', '#DC2626', '#D97706', '#6B7280',
  '#9333EA', '#0891B2', '#BE185D', '#65A30D',
];

export function randomAvatarColor() {
  return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];
}

export const STATUS_OPTIONS = [
  'New', 'Considering', 'Family Contacted',
  'Meeting Scheduled', 'Shortlisted', 'Rejected',
];

export const STATUS_COLORS = {
  'New': '#6B7280',
  'Considering': '#2563EB',
  'Family Contacted': '#7C3AED',
  'Meeting Scheduled': '#D97706',
  'Shortlisted': '#059669',
  'Rejected': '#DC2626',
};

export const RASHI_OPTIONS = [
  'Aries (Mesha)', 'Taurus (Vrishabha)', 'Gemini (Mithuna)', 'Cancer (Karkataka)',
  'Leo (Simha)', 'Virgo (Kanya)', 'Libra (Tula)', 'Scorpio (Vrischika)',
  'Sagittarius (Dhanus)', 'Capricorn (Makara)', 'Aquarius (Kumbha)', 'Pisces (Meena)',
];
