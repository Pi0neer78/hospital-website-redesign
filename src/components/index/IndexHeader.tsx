 
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface IndexHeaderProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
  isMaxBannerVisible: boolean;
  setIsMaxBannerVisible: (v: boolean) => void;
  maxTexts: string[];
  maxTextIndex: number;
}

const IndexHeader = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
  isMaxBannerVisible,
  setIsMaxBannerVisible,
  maxTexts,
  maxTextIndex,
}: IndexHeaderProps) => {
  return (
    <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg"
              alt="Логотип АЦГМБ ЛНР"
              className="w-12 h-12 object-contain mix-blend-multiply rounded-full"
            />
            <div>
              <h1 className="text-sm font-bold text-primary leading-tight">ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <nav className="hidden lg:flex gap-4 text-sm">
              <a href="/about" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">О нас</a>
              <a href="#doctors" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">График приема граждан</a>
              <a href="/structure" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Структура</a>
              <a href="#contacts" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Контакты</a>
              <a href="/docs" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Документы</a>
            </nav>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
            </Button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <nav className="lg:hidden flex flex-col gap-3 mt-4 pt-4 border-t border-border">
            <a href="/about" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>О нас</a>
            <a href="#doctors" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>График приема граждан</a>
            <a href="/structure" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Структура ГУ "АЦГМБ" ЛНР</a>
            <a href="#contacts" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Контакты</a>
            <a href="/docs" className="text-foreground hover:text-primary transition-colors font-medium" onClick={() => setIsMobileMenuOpen(false)}>Документы</a>
          </nav>
        )}

        {isMaxBannerVisible && (
          <div className="relative mt-3 animate-in fade-in slide-in-from-top-4 duration-500">
            <a
              href="https://max.ru/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 pr-12 bg-gradient-to-r from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 rounded-lg border border-blue-200 transition-all duration-300 group"
            >
              <img
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/d6005286-66a2-4d52-91f2-27beec5e16cc.jpg"
                alt="MAX"
                className="w-10 h-10 rounded-lg shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-blue-600 text-sm">MAX</span>
                  <Icon name="ExternalLink" size={14} className="text-blue-500" />
                </div>
                <p className="text-xs text-gray-700 leading-tight line-clamp-2 transition-all duration-500">
                  {maxTexts[maxTextIndex]}
                </p>
              </div>
            </a>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsMaxBannerVisible(false);
                localStorage.setItem('maxBannerClosed', 'true');
              }}
              className="absolute top-3 right-3 w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200/80 transition-colors text-gray-500 hover:text-gray-700"
              aria-label="Закрыть баннер"
            >
              <Icon name="X" size={16} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default IndexHeader;
