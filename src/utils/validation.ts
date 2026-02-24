export function validateFullName(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Введите ФИО пациента';
  if (/[0-9]/.test(trimmed)) return 'ФИО не должно содержать цифры';
  if (/[^а-яёА-ЯЁa-zA-Z\s-]/.test(trimmed)) return 'ФИО не должно содержать спецсимволы и точки';
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length < 2) return 'Укажите минимум фамилию и имя';
  if (parts.length > 4) return 'Слишком много слов в ФИО';
  for (const part of parts) {
    if (part.length < 2) return 'Каждая часть ФИО должна содержать минимум 2 символа (сокращения не допускаются)';
    if (/^[А-ЯЁA-Z]$/.test(part)) return 'Сокращённые инициалы не допускаются — введите полное имя';
  }
  return null;
}
