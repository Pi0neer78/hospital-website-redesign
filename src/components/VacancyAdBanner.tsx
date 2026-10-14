import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const PAGES = [
  'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/508ce460-118e-40f8-b00f-aecaa04aa440.jpg',
  'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/daa53d18-79e0-4a81-9e49-a65cc96c6d8e.jpg',
  'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/2aa60880-af5a-41f7-b3bb-09b46d1ce88d.jpg',
];
const VACANCIES_IMAGE =
  'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/eb07d021-1483-4250-8b9a-c95ed364ff76.jpg';

const PAGE_DURATION_MS = 10000;
const CYCLES = 2;
const STORAGE_KEY = 'vacancy_ad_closed';
const HIDDEN_ROUTES = ['/admin', '/doctor', '/registrar', '/mdoctor', '/security', '/kiosk', '/infowall', '/vote', '/rating'];

const VacancyAdBanner = () => {
  const { pathname } = useLocation();
  const [closed, setClosed] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');
  const [step, setStep] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  const hidden = closed || HIDDEN_ROUTES.some((r) => pathname.startsWith(r));
  const totalSteps = PAGES.length * CYCLES;

  const close = () => {
    sessionStorage.setItem(STORAGE_KEY, '1');
    setClosed(true);
    setModalOpen(false);
  };

  useEffect(() => {
    if (hidden || modalOpen) return;
    const timer = setTimeout(() => {
      if (step + 1 >= totalSteps) {
        close();
      } else {
        setStep(step + 1);
      }
    }, PAGE_DURATION_MS);
    return () => clearTimeout(timer);
  }, [step, hidden, modalOpen, totalSteps]);

  useEffect(() => {
    if (!modalOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  if (hidden) return null;

  const current = step % PAGES.length;

  return (
    <>
      <div className="fixed bottom-3 right-3 z-40 w-[34vw] max-w-[190px] min-w-[120px] sm:bottom-5 sm:right-5 sm:w-[170px] md:w-[190px] lg:w-[210px] lg:max-w-[210px]">
        <div className="relative overflow-hidden rounded-xl border border-border bg-background shadow-2xl animate-fade-in">
          <button
            type="button"
            onClick={close}
            aria-label="Закрыть рекламу"
            className="absolute right-1.5 top-1.5 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80"
          >
            <Icon name="X" size={16} />
          </button>

          <button
            type="button"
            onClick={() => setModalOpen(true)}
            aria-label="Открыть список вакансий"
            className="relative block w-full cursor-pointer"
            style={{ aspectRatio: '300 / 634' }}
          >
            {PAGES.map((src, i) => (
              <img
                key={src}
                src={src}
                alt="Приглашаем на работу"
                loading={i === 0 ? 'eager' : 'lazy'}
                className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                  i === current ? 'opacity-100' : 'opacity-0'
                }`}
              />
            ))}
          </button>

          <div className="absolute bottom-1.5 left-0 right-0 z-10 flex justify-center gap-1.5">
            {PAGES.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all ${
                  i === current ? 'w-4 bg-white' : 'w-1.5 bg-white/50'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 sm:p-6 animate-fade-in"
          onClick={() => setModalOpen(false)}
        >
          <div className="relative max-h-full max-w-full" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              aria-label="Закрыть"
              className="absolute -top-3 -right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-black shadow-lg transition-colors hover:bg-gray-200"
            >
              <Icon name="X" size={20} />
            </button>
            <img
              src={VACANCIES_IMAGE}
              alt="Список вакансий"
              className="max-h-[90vh] max-w-[94vw] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </>
  );
};

export default VacancyAdBanner;
