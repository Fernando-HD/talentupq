const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const clean = (value) => String(value ?? '').trim();
export const isPhone = (value) => /^\d{10}$/.test(clean(value));
export const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean(value).toLowerCase());
export const isUpqEmail = (value) => isEmail(value) && clean(value).toLowerCase().endsWith('@upq.edu.mx');

export const isDate = (value) => {
  const text = clean(value);
  if (!DATE_RE.test(text)) return false;
  const parsed = new Date(`${text}T00:00:00`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === text;
};

export const isFutureDate = (value) => isDate(value) && clean(value) > new Date().toISOString().slice(0, 10);
export const ageOnDate = (value, today = new Date()) => {
  if (!isDate(value)) return null;
  const [year, month, day] = clean(value).split('-').map(Number);
  let age = today.getFullYear() - year;
  if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) age -= 1;
  return age;
};
export const isAdultBirthDate = (value, minimumAge = 18, maximumAge = 100) => {
  const age = ageOnDate(value);
  return age !== null && age >= minimumAge && age <= maximumAge;
};
export const maxLength = (value, limit) => clean(value).length <= limit;
export const isNonNegativeNumber = (value) => clean(value) === '' || (Number.isFinite(Number(value)) && Number(value) >= 0);
export const isIntegerInRange = (value, min, max) => /^\d+$/.test(clean(value)) && Number(value) >= min && Number(value) <= max;
