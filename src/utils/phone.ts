export const PHONE_PLACEHOLDER = '+7000-000-00-00';
export const LNR_PREFIX = '+7959';

export function formatPhoneInput(value: string): string {
  let digits = value.replace(/\D/g, '');
  if (!digits) return '';
  if (digits[0] === '7' || digits[0] === '8') digits = digits.slice(1);
  const d = digits.slice(0, 10);
  let out = '+7' + d.slice(0, 3);
  if (d.length > 3) out += '-' + d.slice(3, 6);
  if (d.length > 6) out += '-' + d.slice(6, 8);
  if (d.length > 8) out += '-' + d.slice(8, 10);
  return out;
}

export function isPhoneComplete(value: string): boolean {
  return /^\+7\d{3}-\d{3}-\d{2}-\d{2}$/.test(value);
}

export function isLnrPhone(value: string): boolean {
  return value.startsWith(LNR_PREFIX);
}

export function validatePhone(value: string, optional = false): string | null {
  const v = value.trim();
  if (!v) return optional ? null : 'Введите номер телефона';
  if (!isPhoneComplete(v)) return 'Номер должен быть в формате +7000-000-00-00';
  return null;
}
