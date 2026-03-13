import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';

const SUBMIT_URL = 'https://functions.poehali.dev/3178f682-a308-42f5-b196-996aa7c9d7d0';
const DOCTORS_URL = 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688';

function getFingerprint(): string {
  const fp = [
    navigator.userAgent,
    navigator.language,
    screen.width + 'x' + screen.height,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || '',
    (navigator as Navigator & { deviceMemory?: number }).deviceMemory || '',
  ].join('|');
  let hash = 0;
  for (let i = 0; i < fp.length; i++) {
    hash = (Math.imul(31, hash) + fp.charCodeAt(i)) | 0;
  }
  return Math.abs(hash).toString(16);
}

interface Doctor {
  id: number;
  full_name: string;
  specialization: string;
  position: string;
  clinic: string;
  photo_url?: string;
}

const StarRating = ({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={disabled}
          onClick={() => onChange(star)}
          onMouseEnter={() => !disabled && setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className={`transition-transform ${!disabled ? 'hover:scale-125 cursor-pointer' : 'cursor-default'}`}
        >
          <svg viewBox="0 0 24 24" className={`w-9 h-9 transition-colors ${(hovered || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const Vote = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const fingerprintRef = useRef(getFingerprint());

  useEffect(() => {
    fetch(DOCTORS_URL)
      .then(r => r.json())
      .then(d => {
        const active = (d.doctors || []).filter((doc: Doctor & { is_active?: boolean }) => doc.is_active !== false);
        setDoctors(active);
      })
      .finally(() => setLoading(false));
  }, []);

  const grouped: Record<string, Doctor[]> = {};
  doctors
    .filter(d => !search || d.full_name.toLowerCase().includes(search.toLowerCase()) || d.specialization?.toLowerCase().includes(search.toLowerCase()))
    .forEach(d => {
      const clinic = d.clinic || 'Прочие';
      if (!grouped[clinic]) grouped[clinic] = [];
      grouped[clinic].push(d);
    });

  const handleSubmit = async () => {
    if (!selectedDoctor || rating === 0) return;
    setSubmitting(true);
    setError('');
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoctor.id, rating, fingerprint: fingerprintRef.current }),
      });
      const data = await res.json();
      if (res.status === 429 || !data.success) {
        setError(data.error || 'Ошибка при отправке');
      } else {
        setDone(true);
      }
    } catch {
      setError('Ошибка соединения');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg" alt="Логотип" className="w-12 h-12 object-contain mix-blend-multiply rounded-full" />
            <h1 className="text-sm font-bold text-primary leading-tight hidden sm:block">ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница</h1>
          </Link>
          <Link to="/" className="ml-auto text-sm text-muted-foreground hover:text-primary flex items-center gap-1">
            <Icon name="ArrowLeft" size={16} /> На главную
          </Link>
        </div>
      </header>

      <section className="bg-gradient-to-br from-yellow-50 via-background to-primary/5 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-yellow-400 text-yellow-400"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" /></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Рейтинг врачей</h1>
          <p className="text-muted-foreground max-w-lg mx-auto">Выберите врача и поставьте оценку его работе. Голосовать можно один раз в неделю за каждого врача.</p>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-3xl">
          {done ? (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Icon name="CheckCircle" size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Спасибо за оценку!</h2>
              <p className="text-muted-foreground mb-6">Ваш голос учтён. Вы можете проголосовать снова через 7 дней.</p>
              <Button onClick={() => { setDone(false); setSelectedDoctor(null); setRating(0); }}>Оценить другого врача</Button>
            </div>
          ) : selectedDoctor ? (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 max-w-md mx-auto">
              <button onClick={() => { setSelectedDoctor(null); setRating(0); setError(''); }} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
                <Icon name="ArrowLeft" size={14} /> Назад к списку
              </button>
              <div className="flex items-center gap-4 mb-6">
                {selectedDoctor.photo_url ? (
                  <img src={selectedDoctor.photo_url} alt={selectedDoctor.full_name} className="w-16 h-16 rounded-full object-cover" />
                ) : (
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <Icon name="User" size={28} className="text-primary" />
                  </div>
                )}
                <div>
                  <p className="font-bold text-lg leading-tight">{selectedDoctor.full_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedDoctor.position}</p>
                  <p className="text-xs text-muted-foreground">{selectedDoctor.clinic}</p>
                </div>
              </div>
              <p className="text-sm font-medium mb-3 text-center">Ваша оценка</p>
              <div className="flex justify-center mb-6">
                <StarRating value={rating} onChange={setRating} />
              </div>
              {error && (
                <div className="mt-2 p-4 bg-orange-50 border border-orange-200 rounded-xl text-center">
                  <p className="text-sm text-orange-700 font-medium mb-4">{error}</p>
                  <div className="flex flex-col sm:flex-row gap-2 justify-center">
                    <Button variant="outline" onClick={() => { setSelectedDoctor(null); setRating(0); setError(''); }}>
                      <Icon name="ArrowLeft" size={14} className="mr-1" /> Проголосовать за другого врача
                    </Button>
                    <Link to="/">
                      <Button variant="ghost" className="w-full sm:w-auto text-muted-foreground">
                        <Icon name="Home" size={14} className="mr-1" /> На главную
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
              {!error && (
                <Button className="w-full" disabled={rating === 0 || submitting} onClick={handleSubmit}>
                  {submitting ? 'Отправляем...' : 'Отправить оценку'}
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Поиск врача..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
              </div>
              {loading ? (
                <div className="text-center py-16 text-muted-foreground">Загружаем список врачей...</div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'ru')).map(([clinic, docs]) => (
                    <div key={clinic}>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 px-1">{clinic}</h2>
                      <div className="space-y-2">
                        {docs.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-border hover:border-primary/40 hover:shadow-sm transition-all text-left"
                          >
                            {doc.photo_url ? (
                              <img src={doc.photo_url} alt={doc.full_name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Icon name="User" size={22} className="text-primary" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm leading-tight">{doc.full_name}</p>
                              <p className="text-xs text-muted-foreground truncate">{doc.position}</p>
                            </div>
                            <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                  {Object.keys(grouped).length === 0 && (
                    <div className="text-center py-10 text-muted-foreground">Врачи не найдены</div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Vote;