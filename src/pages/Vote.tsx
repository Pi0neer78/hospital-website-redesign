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

const StarRating = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-125 cursor-pointer"
        >
          <svg viewBox="0 0 24 24" className={`w-10 h-10 transition-colors ${(hovered || value) >= star ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}>
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" />
          </svg>
        </button>
      ))}
    </div>
  );
};

const rules = [
  { icon: 'Star', text: 'Выберите врача из списка и поставьте оценку от 1 до 5 звёзд' },
  { icon: 'Clock', text: 'За одного врача можно голосовать один раз в 7 дней' },
  { icon: 'Shield', text: 'Голосование анонимное — ваши личные данные не сохраняются' },
  { icon: 'BarChart2', text: 'Результаты рейтинга помогают улучшить качество медицинской помощи' },
];

const Vote = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [alreadyVoted, setAlreadyVoted] = useState(false);
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
    try {
      const res = await fetch(SUBMIT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ doctor_id: selectedDoctor.id, rating, fingerprint: fingerprintRef.current }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setAlreadyVoted(true);
      } else if (data.success) {
        setDone(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const resetVote = () => {
    setSelectedDoctor(null);
    setRating(0);
    setAlreadyVoted(false);
    setDone(false);
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-yellow-50 via-background to-primary/5 py-10">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-100 rounded-full mb-4">
            <svg viewBox="0 0 24 24" className="w-9 h-9 fill-yellow-400 text-yellow-400"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" /></svg>
          </div>
          <h1 className="text-3xl font-bold mb-2">Рейтинг врачей</h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">Оцените работу врача — ваше мнение важно для улучшения качества медицинской помощи</p>
        </div>
      </section>

      {/* Rules */}
      {!selectedDoctor && !done && (
        <section className="py-6 border-b border-border bg-white">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 text-center">Правила голосования</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {rules.map((r, i) => (
                <div key={i} className="flex flex-col items-center text-center gap-2 p-3 rounded-xl bg-yellow-50 border border-yellow-100">
                  <div className="w-9 h-9 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                    <Icon name={r.icon} size={18} className="text-amber-500" />
                  </div>
                  <p className="text-xs text-muted-foreground leading-snug">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-10">
        <div className="container mx-auto px-4 max-w-5xl">

          {/* Успешно проголосовал */}
          {done && (
            <div className="text-center py-16 max-w-md mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
                <Icon name="CheckCircle" size={40} className="text-green-500" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Спасибо за оценку!</h2>
              <p className="text-muted-foreground mb-8">Ваш голос учтён. Повторно проголосовать за этого врача можно через 7 дней.</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={resetVote}>
                  <Icon name="ArrowLeft" size={14} className="mr-1" /> Оценить другого врача
                </Button>
                <Link to="/"><Button variant="outline"><Icon name="Home" size={14} className="mr-1" /> На главную</Button></Link>
              </div>
            </div>
          )}

          {/* Уже голосовал */}
          {alreadyVoted && selectedDoctor && (
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl border border-border shadow-sm p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mb-4">
                  <Icon name="AlertCircle" size={32} className="text-orange-500" />
                </div>
                <h2 className="text-lg font-bold mb-2">Вы уже голосовали</h2>
                <p className="text-sm text-muted-foreground mb-2">За врача <span className="font-semibold text-foreground">{selectedDoctor.full_name}</span></p>
                <p className="text-sm text-muted-foreground mb-8">Повторное голосование за этого врача будет доступно через 7 дней.</p>
                <div className="flex flex-col gap-3">
                  <Button onClick={resetVote} className="w-full">
                    <Icon name="ArrowLeft" size={14} className="mr-1" /> Проголосовать за другого врача
                  </Button>
                  <Link to="/" className="w-full">
                    <Button variant="outline" className="w-full">
                      <Icon name="Home" size={14} className="mr-1" /> На главную
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Карточка голосования */}
          {selectedDoctor && !done && !alreadyVoted && (
            <div className="bg-white rounded-2xl border border-border shadow-sm p-8 max-w-md mx-auto">
              <button onClick={resetVote} className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 mb-6">
                <Icon name="ArrowLeft" size={14} /> Назад к списку
              </button>
              <div className="flex items-center gap-4 mb-8">
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
              <p className="text-sm font-medium mb-4 text-center text-muted-foreground">Ваша оценка</p>
              <div className="flex justify-center mb-8">
                <StarRating value={rating} onChange={setRating} />
              </div>
              <Button className="w-full" disabled={rating === 0 || submitting} onClick={handleSubmit}>
                {submitting ? 'Отправляем...' : 'Отправить оценку'}
              </Button>
            </div>
          )}

          {/* Список врачей */}
          {!selectedDoctor && !done && (
            <>
              <div className="mb-6">
                <div className="relative max-w-sm">
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
                <div className="space-y-8">
                  {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'ru')).map(([clinic, docs]) => (
                    <div key={clinic}>
                      <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-2">
                        <Icon name="Building2" size={13} className="text-primary" />{clinic}
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {docs.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => setSelectedDoctor(doc)}
                            className="flex flex-col items-center text-center gap-3 p-5 bg-white rounded-2xl border border-border hover:border-amber-300 hover:shadow-md transition-all group"
                          >
                            {doc.photo_url ? (
                              <img src={doc.photo_url} alt={doc.full_name} className="w-16 h-16 rounded-full object-cover group-hover:scale-105 transition-transform" />
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
                                <Icon name="User" size={28} className="text-primary" />
                              </div>
                            )}
                            <div className="flex-1">
                              <p className="font-semibold text-sm leading-tight mb-1">{doc.full_name}</p>
                              <p className="text-xs text-muted-foreground leading-snug">{doc.position}</p>
                            </div>
                            <span className="text-xs text-amber-500 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                              Оценить
                              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-yellow-400"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" /></svg>
                            </span>
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
