import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg"
                alt="Логотип АЦГМБ ЛНР"
                className="w-12 h-12 object-contain mix-blend-multiply rounded-full"
              />
              <div>
                <h1 className="text-sm font-bold text-primary leading-tight">
                  ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница
                </h1>
              </div>
            </Link>
            <nav className="hidden lg:flex gap-4 text-sm ml-auto">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Главная</Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">О нас</Link>
              <a href="/#doctors" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">График приема граждан</a>
              <Link to="/structure" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Структура</Link>
              <a href="/#contacts" className="text-foreground hover:text-primary transition-colors font-medium">Контакты</a>
              <Link to="/docs" className="text-primary font-semibold border-b-2 border-primary pb-0.5 whitespace-nowrap">Документы</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="container mx-auto px-4 flex items-stretch min-h-[200px]">
          <div className="flex-shrink-0 w-48 sm:w-64 relative -ml-4 sm:ml-0">
            <img
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/542dd71b-9199-4233-9db3-622da8e46a02.jpg"
              alt="Документы"
              className="h-full w-full object-cover object-center mix-blend-multiply"
            />
          </div>
          <div className="flex flex-col justify-center py-12 pl-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Документы</h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Официальные документы ГБУЗ «Антрацитовская центральная городская многопрофильная больница»
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <a
            href="https://xn--90ad1a1b.xn--p1ai/doc/ustav.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-5 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200"
          >
            <div className="flex-shrink-0 w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
              <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
                <rect width="40" height="40" rx="8" fill="#E53935"/>
                <path d="M10 8h14l6 6v18H10V8z" fill="white"/>
                <path d="M24 8v6h6" stroke="#E53935" strokeWidth="1.5" fill="none"/>
                <text x="20" y="28" textAnchor="middle" fill="#E53935" fontSize="7" fontWeight="bold" fontFamily="Arial">PDF</text>
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-base leading-snug">
                Устав учреждения 08.11.2023 233-ОД
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">Формат: PDF · Открыть в новой вкладке</p>
            </div>
            <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
              <Icon name="ExternalLink" size={18} />
            </div>
          </a>
        </div>
      </section>
    </div>
  );
};

export default Docs;