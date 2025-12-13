import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Icon from '@/components/ui/icon';

interface ComplaintSectionProps {
  BACKEND_URLS: { complaints: string };
  toast: (options: { title?: string; description?: string; variant?: string }) => void;
  checkComplaintLimit: () => Promise<{ allowed: boolean; reason?: string }>;
}

export const ComplaintSection = ({ BACKEND_URLS, toast, checkComplaintLimit }: ComplaintSectionProps) => {
  const [complaintForm, setComplaintForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const rateLimitCheck = await checkComplaintLimit();
    if (!rateLimitCheck.allowed) {
      toast({
        title: 'Ограничение запросов',
        description: rateLimitCheck.reason || 'Слишком много попыток отправки жалобы. Подождите немного.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      const response = await fetch(BACKEND_URLS.complaints, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(complaintForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Жалоба отправлена",
          description: "Мы рассмотрим ваше обращение в ближайшее время.",
        });
        setComplaintForm({ name: '', email: '', phone: '', message: '' });
      } else {
        toast({
          title: "Ошибка",
          description: data.error || "Не удалось отправить жалобу",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Ошибка",
        description: "Проблема с подключением к серверу",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="complaints" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Icon name="MessageSquare" size={24} />
              Жалобы и предложения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleComplaint} className="space-y-4">
              <Input
                placeholder="Ваше имя"
                value={complaintForm.name}
                onChange={(e) => setComplaintForm(prev => ({ ...prev, name: e.target.value }))}
                required
              />
              <Input
                placeholder="Email (необязательно)"
                type="email"
                value={complaintForm.email}
                onChange={(e) => setComplaintForm(prev => ({ ...prev, email: e.target.value }))}
              />
              <Input
                placeholder="Телефон"
                value={complaintForm.phone}
                onChange={(e) => setComplaintForm(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
              <Textarea
                placeholder="Опишите вашу жалобу или предложение"
                value={complaintForm.message}
                onChange={(e) => setComplaintForm(prev => ({ ...prev, message: e.target.value }))}
                required
                className="min-h-32"
              />
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Отправка...' : 'Отправить'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
