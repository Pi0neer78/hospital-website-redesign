import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_URL = 'https://functions.poehali.dev/fb5160e8-f170-4c21-97a9-3afbcb6f78a9';

const Faq = () => {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [maxTextIndex, setMaxTextIndex] = useState(0);
  const [isMaxBannerVisible, setIsMaxBannerVisible] = useState(false);

  const maxTexts = [
    'Максимум возможностей для жизни',
    'Быстрое и лёгкое приложение для общения и решения повседневных задач',
    'Высокое качество звонков. Общайтесь в удовольствие благодаря высокому качеству связи и быстрому соединению даже в сетях со слабым сигналом',
    'Общение на максимум. Анимированные стикеры, реакции в чатах, возможность отправки файлов до 4 ГБ – все необходимое для того, чтобы делиться настроением и важной информацией',
    'Чат боты и мини приложения. Предоставляют прямой доступ к партнерским сервисам и позволяют быстро и легко решать множество ежедневных задач',
    'Скачайте MAX на любое устройство',
  ];

  useEffect(() => {
    loadFaqs();
    
    const bannerClosed = localStorage.getItem('maxBannerClosed');
    if (!bannerClosed) {
      setIsMaxBannerVisible(true);
    }
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setMaxTextIndex((prev) => (prev + 1) % maxTexts.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const loadFaqs = async () => {
    try {
      const response = await fetch(FAQ_URL);
      const data = await response.json();
      setFaqs(data.faqs || []);
    } catch (error) {
      console.error('Failed to load FAQs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
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
                <p className="text-[10px] text-muted-foreground leading-tight">ГУ АЦГМБ ЛНР</p>
                <h1 className="text-sm font-bold text-primary leading-tight">Антрацитовская центральная<br />городская многопрофильная больница</h1>
              </div>
            </div>
            <Button variant="outline" asChild>
              <a href="/">
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </a>
            </Button>
          </div>
          
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

      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Icon name="HelpCircle" size={32} className="text-primary" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Часто задаваемые вопросы</h1>
            <p className="text-lg text-muted-foreground">
              Ответы на популярные вопросы о работе нашей больницы
            </p>
          </div>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Загрузка...</p>
              </CardContent>
            </Card>
          ) : faqs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Icon name="FileQuestion" size={48} className="mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground text-lg">
                  Пока нет вопросов и ответов
                </p>
              </CardContent>
            </Card>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem 
                  key={faq.id} 
                  value={`item-${faq.id}`}
                  className="bg-white rounded-lg border-2 border-border overflow-hidden"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-4 text-left">
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-primary font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="font-semibold text-lg pr-4">{faq.question}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-6 pt-2">
                    <div className="ml-12 space-y-4">
                      <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                        {faq.answer}
                      </p>
                      {faq.image_url && (
                        <img 
                          src={faq.image_url} 
                          alt={faq.question}
                          className="rounded-lg max-w-full h-auto shadow-md"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}

          <Card className="mt-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icon name="Phone" size={24} className="text-primary" />
                Не нашли ответ на свой вопрос?
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Свяжитесь с нами напрямую по телефону или email
              </p>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Icon name="Phone" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Приемная главного врача</p>
                    <p className="text-base font-bold">+7-857-312-51-02</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
                  <Icon name="Mail" size={20} className="text-primary" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Email</p>
                    <p className="text-base font-bold break-all">antrasit_1gorbolnica@mail.ru</p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <a href="/#contacts">
                    <Icon name="MapPin" size={18} className="mr-2" />
                    Посмотреть все контакты
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <div className="text-center text-white/90">
            <p className="text-sm">&copy; 2024 Государственное учреждение «Антрацитовская центральная городская многопрофильная больница» ЛНР</p>
            <p className="text-xs mt-2 text-white/70">Все права защищены</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Faq;