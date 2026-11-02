import { cn } from '@/lib/utils';

const GRADIENTS = [
  'from-sky-500 to-blue-600',
  'from-emerald-500 to-teal-600',
  'from-violet-500 to-indigo-600',
  'from-rose-500 to-pink-600',
  'from-amber-500 to-orange-600',
  'from-cyan-500 to-sky-600',
  'from-fuchsia-500 to-purple-600',
  'from-lime-500 to-green-600',
];

const getInitials = (name?: string) => {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '';
  const first = parts[0][0] || '';
  const second = parts[1]?.[0] || '';
  return (first + second).toUpperCase();
};

const getGradient = (name?: string) => {
  let hash = 0;
  for (const ch of name || '') hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
};

interface DoctorAvatarProps {
  name?: string;
  className?: string;
  textClassName?: string;
}

const DoctorAvatar = ({ name, className, textClassName = 'text-base' }: DoctorAvatarProps) => (
  <div
    className={cn(
      'relative flex items-center justify-center overflow-hidden bg-gradient-to-br text-white font-semibold shadow-inner select-none',
      getGradient(name),
      className
    )}
    aria-label={name}
  >
    <span className="absolute inset-x-0 top-0 h-1/2 bg-white/10" />
    <span className={cn('relative tracking-wide', textClassName)}>{getInitials(name) || '•'}</span>
  </div>
);

export default DoctorAvatar;
