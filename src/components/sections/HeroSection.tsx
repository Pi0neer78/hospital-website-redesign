import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface HeroSectionProps {
  isAppointmentOpen: boolean;
  setIsAppointmentOpen: (open: boolean) => void;
}

export const HeroSection = ({ isAppointmentOpen, setIsAppointmentOpen }: HeroSectionProps) => {
  return (
    <section className="py-20 text-center">
      <div className="container mx-auto px-4">
        <img 
          src="https://cdn.poehali.dev/files/d1c15da6-7ffe-46bb-b5db-3d114b408cec.jpg" 
          alt="Логотип АЦГМБ ЛНР" 
          className="w-48 h-48 mx-auto mb-8 object-contain animate-fade-in mix-blend-multiply"
        />
        <h2 className="font-bold mb-2 text-foreground animate-fade-in text-2xl md:text-4xl">ГБУЗ "Антрацитовская центральная городская многопрофильная больница"</h2>
        <p className="text-sm md:text-lg text-muted-foreground mb-8 animate-fade-in">Луганской Народной Республики</p>
        <p className="text-base md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-fade-in">
          Современная медицинская помощь с заботой о каждом пациенте. Квалифицированные специалисты и передовые технологии.
        </p>
        <div className="flex flex-col items-center gap-3 animate-scale-in">
          <div className="flex gap-4 justify-center flex-wrap">
            <Dialog open={isAppointmentOpen} onOpenChange={setIsAppointmentOpen}>
              <DialogTrigger asChild>
                <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto sm:min-w-[200px]">
                  <Icon name="Calendar" size={20} />
                  Записаться на прием
                </Button>
              </DialogTrigger>
            </Dialog>
            <Button size="lg" variant="outline" className="gap-2 shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto sm:min-w-[200px]" asChild>
              <a href="#doctors">
                <Icon name="Users" size={20} />
                Наши специалисты
              </a>
            </Button>
          </div>
          <div className="flex gap-6 mt-4 text-sm text-muted-foreground flex-wrap justify-center">
            <a href="/forum" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="MessageSquare" size={16} />
              <span>Форум</span>
            </a>
            <a href="/faq" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="HelpCircle" size={16} />
              <span>Часто задаваемые вопросы</span>
            </a>
            <a href="/doctor-guide" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="FileText" size={16} />
              <span>Памятка для врачей</span>
            </a>
            <a href="/how-to-book" className="hover:text-primary transition-colors flex items-center gap-1.5">
              <Icon name="BookOpen" size={16} />
              <span>Как записаться на прием</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
