import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const RESULTS_URL = 'https://functions.poehali.dev/81491831-4f51-4dd8-9741-2f03a0c858db';
const AUTH_URL = 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227';

interface DoctorResult {
  doctor_id: number;
  full_name: string;
  specialization: string;
  position: string;
  clinic: string;
  total_votes: number;
  avg_rating: number;
  r1: number; r2: number; r3: number; r4: number; r5: number;
}

const Stars = ({ value }: { value: number }) => (
  <span className="flex gap-0.5 items-center">
    {[1, 2, 3, 4, 5].map(s => (
      <svg key={s} viewBox="0 0 24 24" className={`w-4 h-4 ${value >= s ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}`}>
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" stroke="currentColor" strokeWidth="1" />
      </svg>
    ))}
  </span>
);

const DoctorRating = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [results, setResults] = useState<DoctorResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [clinicFilter, setClinicFilter] = useState('');
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('admin_auth');
    if (saved) setIsAuth(true);
  }, []);

  useEffect(() => {
    if (!isAuth) return;
    setLoading(true);
    fetch(RESULTS_URL)
      .then(r => r.json())
      .then(d => setResults(d.results || []))
      .finally(() => setLoading(false));
  }, [isAuth]);

  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError('');
    try {
      const res = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ login, password, user_type: 'admin' }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('admin_auth', JSON.stringify(data.user));
        setIsAuth(true);
      } else {
        setAuthError(data.error || 'Неверный логин или пароль');
      }
    } catch {
      setAuthError('Ошибка соединения');
    } finally {
      setAuthLoading(false);
    }
  };

  const handlePrint = () => {
    const content = printRef.current;
    if (!content) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Рейтинг врачей</title>
    <style>
      body { font-family: Arial, sans-serif; font-size: 12px; margin: 20px; }
      h1 { font-size: 16px; margin-bottom: 8px; }
      p.date { color: #666; margin-bottom: 16px; }
      table { width: 100%; border-collapse: collapse; }
      th { background: #f0f0f0; padding: 6px 8px; text-align: left; border: 1px solid #ccc; font-size: 11px; }
      td { padding: 5px 8px; border: 1px solid #ddd; font-size: 11px; }
      tr:nth-child(even) td { background: #fafafa; }
      .clinic-row td { background: #e8f0fe; font-weight: bold; }
    </style></head><body>`);
    w.document.write(content.innerHTML);
    w.document.write('</body></html>');
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 500);
  };

  const clinics = [...new Set(results.map(r => r.clinic))].sort((a, b) => a.localeCompare(b, 'ru'));

  const filtered = results.filter(r => {
    const matchSearch = !search || r.full_name.toLowerCase().includes(search.toLowerCase());
    const matchClinic = !clinicFilter || r.clinic === clinicFilter;
    return matchSearch && matchClinic;
  });

  const grouped: Record<string, DoctorResult[]> = {};
  filtered.forEach(r => {
    const c = r.clinic || 'Прочие';
    if (!grouped[c]) grouped[c] = [];
    grouped[c].push(r);
  });

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl border border-border shadow-md p-8">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-full mb-3">
              <Icon name="Lock" size={26} className="text-primary" />
            </div>
            <h1 className="text-xl font-bold">Рейтинг врачей</h1>
            <p className="text-sm text-muted-foreground mt-1">Доступ только для администраторов</p>
          </div>
          <div className="space-y-3">
            <Input placeholder="Логин" value={login} onChange={e => setLogin(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            <Input placeholder="Пароль" type="password" value={password} onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleLogin()} />
            {authError && <p className="text-sm text-red-500">{authError}</p>}
            <Button className="w-full" onClick={handleLogin} disabled={authLoading}>
              {authLoading ? 'Вход...' : 'Войти'}
            </Button>
          </div>
          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-muted-foreground hover:text-primary">← На главную</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm no-print">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg" alt="Логотип" className="w-10 h-10 object-contain mix-blend-multiply rounded-full" />
            <h1 className="text-sm font-bold text-primary leading-tight hidden sm:block">ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница</h1>
          </Link>
          <div className="ml-auto flex gap-2">
            <Button size="sm" variant="outline" onClick={handlePrint} className="gap-1">
              <Icon name="Printer" size={15} /> Печать
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { localStorage.removeItem('admin_auth'); setIsAuth(false); }} className="gap-1 text-muted-foreground">
              <Icon name="LogOut" size={15} /> Выйти
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 no-print">
          <div>
            <h1 className="text-2xl font-bold">Рейтинг врачей</h1>
            <p className="text-sm text-muted-foreground">Результаты голосования пациентов</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              placeholder="Поиск врача..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-48"
            />
            <select
              value={clinicFilter}
              onChange={e => setClinicFilter(e.target.value)}
              className="px-3 py-1.5 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Все больницы</option>
              {clinics.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-16 text-muted-foreground">Загружаем данные...</div>
        ) : (
          <div ref={printRef}>
            <h1 className="text-xl font-bold mb-1 hidden print:block">Рейтинг врачей — ГБУЗ «АЦГМБ» ЛНР</h1>
            <p className="text-sm text-muted-foreground mb-4 hidden print:block">Дата печати: {new Date().toLocaleDateString('ru-RU')}</p>
            <div className="bg-white rounded-2xl border border-border shadow-sm overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-4 py-3 font-semibold">ФИО врача</th>
                    <th className="text-left px-4 py-3 font-semibold hidden sm:table-cell">Должность</th>
                    <th className="text-center px-4 py-3 font-semibold">Голосов</th>
                    <th className="text-center px-4 py-3 font-semibold">★1</th>
                    <th className="text-center px-4 py-3 font-semibold">★2</th>
                    <th className="text-center px-4 py-3 font-semibold">★3</th>
                    <th className="text-center px-4 py-3 font-semibold">★4</th>
                    <th className="text-center px-4 py-3 font-semibold">★5</th>
                    <th className="text-center px-4 py-3 font-semibold">Средний балл</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b, 'ru')).map(([clinic, docs]) => (
                    <>
                      <tr key={`clinic-${clinic}`} className="bg-primary/5 clinic-row">
                        <td colSpan={9} className="px-4 py-2 font-semibold text-primary text-xs uppercase tracking-wide">{clinic}</td>
                      </tr>
                      {docs.map((doc, idx) => (
                        <tr key={doc.doctor_id} className={`border-b border-border/50 hover:bg-muted/20 transition-colors ${idx % 2 === 0 ? '' : 'bg-muted/10'}`}>
                          <td className="px-4 py-3 font-medium">{doc.full_name}</td>
                          <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell text-xs">{doc.position}</td>
                          <td className="px-4 py-3 text-center font-semibold">{doc.total_votes}</td>
                          <td className="px-4 py-3 text-center text-red-500">{doc.r1 || '—'}</td>
                          <td className="px-4 py-3 text-center text-orange-500">{doc.r2 || '—'}</td>
                          <td className="px-4 py-3 text-center text-yellow-500">{doc.r3 || '—'}</td>
                          <td className="px-4 py-3 text-center text-lime-500">{doc.r4 || '—'}</td>
                          <td className="px-4 py-3 text-center text-green-600">{doc.r5 || '—'}</td>
                          <td className="px-4 py-3 text-center">
                            {doc.total_votes > 0 ? (
                              <div className="flex flex-col items-center gap-0.5">
                                <Stars value={Math.round(doc.avg_rating)} />
                                <span className="text-xs font-bold text-foreground">{doc.avg_rating.toFixed(1)}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground text-xs">нет оценок</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </>
                  ))}
                  {Object.keys(grouped).length === 0 && (
                    <tr><td colSpan={9} className="px-4 py-10 text-center text-muted-foreground">Нет данных</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorRating;
