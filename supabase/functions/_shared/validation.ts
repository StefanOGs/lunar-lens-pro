// Valid zodiac signs in Bulgarian
export const validZodiacSigns = [
  'Овен', 'Телец', 'Близнаци', 'Рак', 'Лъв', 'Дева',
  'Везни', 'Скорпион', 'Стрелец', 'Козирог', 'Водолей', 'Риби'
];

// Validate zodiac sign
export function validateZodiacSign(zodiacSign: string): boolean {
  return validZodiacSigns.includes(zodiacSign);
}

// Sanitize name (remove special characters, limit length)
export function sanitizeName(name: string): string {
  if (!name || typeof name !== 'string') return '';
  // Allow Cyrillic, Latin letters, spaces, and hyphens
  return name.replace(/[^a-zA-Zа-яА-ЯёЁ\s-]/g, '').trim().slice(0, 100);
}

// Validate date format (YYYY-MM-DD)
export function validateDateFormat(date: string): boolean {
  if (!date || typeof date !== 'string') return false;
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Check if it's a valid date
  const parsedDate = new Date(date);
  return !isNaN(parsedDate.getTime());
}

// Validate time format (HH:MM or HH:MM:SS)
export function validateTimeFormat(time: string): boolean {
  if (!time || typeof time !== 'string') return true; // Time is optional
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)(:[0-5]\d)?$/;
  return timeRegex.test(time);
}

// Sanitize location query (limit length, basic sanitization)
export function sanitizeLocationQuery(query: string): string {
  if (!query || typeof query !== 'string') return '';
  // Allow alphanumeric, Cyrillic, spaces, commas, periods, and hyphens
  return query.replace(/[^a-zA-Zа-яА-ЯёЁ0-9\s,.\-]/g, '').trim().slice(0, 200);
}

// Validate email format
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email) && email.length <= 255;
}

// Validate horoscope type
export function validateHoroscopeType(type: string): boolean {
  const validTypes = ['daily', 'weekly', 'monthly', 'yearly'];
  return validTypes.includes(type);
}

// Validate data level for compatibility
export function validateDataLevel(level: string): boolean {
  const validLevels = ['basic', 'medium', 'full'];
  return validLevels.includes(level);
}
