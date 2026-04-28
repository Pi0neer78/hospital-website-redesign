import { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';

// Список популярных мужских имён
const MALE_FIRST_NAMES = [
  'Абрам', 'Аверьян', 'Авраам', 'Агафон', 'Адам', 'Аким', 'Акинф', 'Аксён',
  'Алексей', 'Александр', 'Алексий', 'Альберт', 'Анатолий', 'Андрей', 'Антон', 'Антонин',
  'Аркадий', 'Арсений', 'Артём', 'Артур', 'Архип', 'Афанасий',
  'Богдан', 'Борис', 'Бронислав',
  'Вадим', 'Валентин', 'Валерий', 'Василий', 'Вениамин', 'Виктор', 'Виталий',
  'Владимир', 'Владислав', 'Вячеслав',
  'Геннадий', 'Георгий', 'Глеб', 'Григорий',
  'Даниил', 'Данила', 'Денис', 'Дмитрий',
  'Евгений', 'Егор', 'Емельян',
  'Захар', 'Зиновий',
  'Иван', 'Игнат', 'Игорь', 'Илья',
  'Кирилл', 'Кондрат', 'Константин',
  'Лев', 'Леонид', 'Лукьян',
  'Макар', 'Максим', 'Михаил',
  'Назар', 'Никита', 'Николай',
  'Олег', 'Павел', 'Пётр', 'Платон', 'Прохор',
  'Родион', 'Роман', 'Руслан',
  'Савва', 'Семён', 'Сергей', 'Степан',
  'Тимофей', 'Тимур', 'Тихон',
  'Фёдор', 'Филипп',
  'Харитон',
  'Юрий', 'Яков', 'Ярослав',
];

// Список популярных женских имён
const FEMALE_FIRST_NAMES = [
  'Агата', 'Агафья', 'Агния', 'Аграфена', 'Аза',
  'Александра', 'Алина', 'Алиса', 'Алла', 'Альбина', 'Анастасия', 'Анжела', 'Анжелика',
  'Анна', 'Антонина', 'Арина',
  'Валентина', 'Валерия', 'Варвара', 'Василиса', 'Вера', 'Вероника', 'Виктория',
  'Галина', 'Глафира',
  'Дарья', 'Диана',
  'Екатерина', 'Елена', 'Елизавета',
  'Жанна',
  'Зинаида', 'Зоя',
  'Ирина',
  'Карина', 'Кира', 'Клавдия', 'Кристина', 'Ксения',
  'Лариса', 'Лидия', 'Людмила',
  'Маргарита', 'Марина', 'Мария', 'Милана',
  'Надежда', 'Наталья', 'Нина',
  'Оксана', 'Олеся', 'Ольга',
  'Пелагея', 'Полина', 'Прасковья',
  'Светлана', 'Серафима', 'София',
  'Тамара', 'Татьяна',
  'Ульяна',
  'Юлия',
];

// Мужские отчества
const MALE_PATRONYMICS = [
  'Абрамович', 'Адамович', 'Акимович', 'Аксёнович', 'Александрович', 'Алексеевич',
  'Альбертович', 'Анатольевич', 'Андреевич', 'Антонович', 'Аркадьевич', 'Арсеньевич',
  'Артёмович', 'Артурович', 'Афанасьевич',
  'Богданович', 'Борисович', 'Брониславович',
  'Вадимович', 'Валентинович', 'Валерьевич', 'Васильевич', 'Вениаминович', 'Викторович',
  'Витальевич', 'Владимирович', 'Владиславович', 'Вячеславович',
  'Геннадьевич', 'Георгиевич', 'Глебович', 'Григорьевич',
  'Даниилович', 'Данилович', 'Денисович', 'Дмитриевич',
  'Евгеньевич', 'Егорович',
  'Захарович', 'Зиновьевич',
  'Иванович', 'Игнатьевич', 'Игоревич', 'Ильич',
  'Кириллович', 'Константинович',
  'Львович', 'Леонидович', 'Лукьянович',
  'Макарович', 'Максимович', 'Михайлович',
  'Назарович', 'Никитич', 'Николаевич',
  'Олегович',
  'Павлович', 'Петрович', 'Платонович', 'Прохорович',
  'Родионович', 'Романович', 'Русланович',
  'Саввович', 'Семёнович', 'Сергеевич', 'Степанович',
  'Тимофеевич', 'Тимурович', 'Тихонович',
  'Фёдорович', 'Филиппович',
  'Харитонович',
  'Юрьевич', 'Яковлевич', 'Ярославович',
];

// Женские отчества
const FEMALE_PATRONYMICS = [
  'Абрамовна', 'Адамовна', 'Акимовна', 'Аксёновна', 'Александровна', 'Алексеевна',
  'Альбертовна', 'Анатольевна', 'Андреевна', 'Антоновна', 'Аркадьевна', 'Арсеньевна',
  'Артёмовна', 'Артуровна', 'Афанасьевна',
  'Богдановна', 'Борисовна', 'Брониславовна',
  'Вадимовна', 'Валентиновна', 'Валерьевна', 'Васильевна', 'Вениаминовна', 'Викторовна',
  'Витальевна', 'Владимировна', 'Владиславовна', 'Вячеславовна',
  'Геннадьевна', 'Георгиевна', 'Глебовна', 'Григорьевна',
  'Данииловна', 'Даниловна', 'Денисовна', 'Дмитриевна',
  'Евгеньевна', 'Егоровна',
  'Захаровна', 'Зиновьевна',
  'Ивановна', 'Игнатьевна', 'Игоревна', 'Ильинична',
  'Кирилловна', 'Константиновна',
  'Львовна', 'Леонидовна', 'Лукьяновна',
  'Макаровна', 'Максимовна', 'Михайловна',
  'Назаровна', 'Никитична', 'Николаевна',
  'Олеговна',
  'Павловна', 'Петровна', 'Платоновна', 'Прохоровна',
  'Родионовна', 'Романовна', 'Руслановна',
  'Саввовна', 'Семёновна', 'Сергеевна', 'Степановна',
  'Тимофеевна', 'Тимуровна', 'Тихоновна',
  'Фёдоровна', 'Филипповна',
  'Харитоновна',
  'Юрьевна', 'Яковлевна', 'Ярославовна',
];

const ALL_FIRST_NAMES = [...MALE_FIRST_NAMES, ...FEMALE_FIRST_NAMES];
const ALL_PATRONYMICS = [...MALE_PATRONYMICS, ...FEMALE_PATRONYMICS];

interface FioAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  hasError?: boolean;
}

/**
 * Компонент ввода ФИО с автодополнением имени и отчества.
 * Формат: Фамилия Имя Отчество
 * - Автодополнение активируется на 2-м слове (имя) и 3-м слове (отчество)
 */
const FioAutocomplete = ({
  value,
  onChange,
  placeholder = 'Иванов Иван Иванович',
  className = '',
  required = false,
  hasError = false,
}: FioAutocompleteProps) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Вычисляем подсказки при изменении значения
  useEffect(() => {
    const parts = value.trimStart().split(/\s+/);
    const wordCount = parts.length;
    const lastWord = parts[wordCount - 1];

    // Не показываем подсказки если последнее слово пустое (только пробел)
    if (!lastWord) {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    let pool: string[] = [];

    if (wordCount === 2) {
      // Второе слово — имя
      pool = ALL_FIRST_NAMES;
    } else if (wordCount === 3) {
      // Третье слово — отчество
      pool = ALL_PATRONYMICS;
    } else {
      setSuggestions([]);
      setActiveIndex(-1);
      return;
    }

    const lower = lastWord.toLowerCase();
    const matched = pool
      .filter(n => n.toLowerCase().startsWith(lower) && n.toLowerCase() !== lower)
      .slice(0, 6);

    setSuggestions(matched);
    setActiveIndex(-1);
  }, [value]);

  // Закрываем список при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        !inputRef.current?.contains(e.target as Node)
      ) {
        setSuggestions([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const applySuggestion = (suggestion: string) => {
    const parts = value.trimStart().split(/\s+/);
    parts[parts.length - 1] = suggestion;
    onChange(parts.join(' ') + ' ');
    setSuggestions([]);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter' || e.key === 'Tab') {
      if (activeIndex >= 0) {
        e.preventDefault();
        applySuggestion(suggestions[activeIndex]);
      } else if (e.key === 'Tab' && suggestions.length > 0) {
        e.preventDefault();
        applySuggestion(suggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setSuggestions([]);
      setActiveIndex(-1);
    }
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        required={required}
        className={`h-9${hasError ? ' border-red-500 focus-visible:ring-red-500' : ''}${className ? ' ' + className : ''}`}
        autoComplete="off"
      />
      {suggestions.length > 0 && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto"
        >
          {suggestions.map((s, i) => (
            <div
              key={s}
              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                i === activeIndex
                  ? 'bg-blue-500 text-white'
                  : 'hover:bg-gray-100 text-gray-900'
              }`}
              onMouseDown={(e) => {
                e.preventDefault();
                applySuggestion(s);
              }}
            >
              {s}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FioAutocomplete;