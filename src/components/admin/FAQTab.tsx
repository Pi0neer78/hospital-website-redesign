import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface FAQTabProps {
  faqs: any[];
  faqForm: any;
  setFaqForm: (form: any) => void;
  isFaqOpen: boolean;
  setIsFaqOpen: (open: boolean) => void;
  editingFaq: any;
  setEditingFaq: (faq: any) => void;
  isFaqEditOpen: boolean;
  setIsFaqEditOpen: (open: boolean) => void;
  onCreateFaq: (e: React.FormEvent) => void;
  onUpdateFaq: (e: React.FormEvent) => void;
  onDeleteFaq: (id: number) => void;
}

const FAQTab = ({ faqs, faqForm, setFaqForm, isFaqOpen, setIsFaqOpen, editingFaq, setEditingFaq, isFaqEditOpen, setIsFaqEditOpen, onCreateFaq, onUpdateFaq, onDeleteFaq }: FAQTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">FAQ</h2>
        <Dialog open={isFaqOpen} onOpenChange={setIsFaqOpen}>
          <DialogTrigger asChild><Button><Icon name="Plus" size={18} className="mr-2" />Добавить FAQ</Button></DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый FAQ</DialogTitle></DialogHeader>
            <form onSubmit={onCreateFaq} className="space-y-4">
              <Input placeholder="Вопрос" value={faqForm.question} onChange={(e) => setFaqForm({...faqForm, question: e.target.value})} required />
              <Textarea placeholder="Ответ" value={faqForm.answer} onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})} required />
              <Input placeholder="URL изображения" value={faqForm.image_url} onChange={(e) => setFaqForm({...faqForm, image_url: e.target.value})} />
              <Input type="number" placeholder="Порядок отображения" value={faqForm.display_order} onChange={(e) => setFaqForm({...faqForm, display_order: parseInt(e.target.value)})} />
              <Button type="submit">Создать</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Вопрос</TableHead>
            <TableHead>Ответ</TableHead>
            <TableHead>Порядок</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {faqs.map((faq) => (
            <TableRow key={faq.id}>
              <TableCell className="font-medium">{faq.question}</TableCell>
              <TableCell className="max-w-md truncate">{faq.answer}</TableCell>
              <TableCell>{faq.display_order}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => { setEditingFaq(faq); setIsFaqEditOpen(true); }}><Icon name="Edit" size={16} /></Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteFaq(faq.id)}><Icon name="Trash2" size={16} /></Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {editingFaq && (
        <Dialog open={isFaqEditOpen} onOpenChange={setIsFaqEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Редактировать FAQ</DialogTitle></DialogHeader>
            <form onSubmit={onUpdateFaq} className="space-y-4">
              <Input placeholder="Вопрос" value={editingFaq.question} onChange={(e) => setEditingFaq({...editingFaq, question: e.target.value})} required />
              <Textarea placeholder="Ответ" value={editingFaq.answer} onChange={(e) => setEditingFaq({...editingFaq, answer: e.target.value})} required />
              <Input placeholder="URL изображения" value={editingFaq.image_url || ''} onChange={(e) => setEditingFaq({...editingFaq, image_url: e.target.value})} />
              <Input type="number" placeholder="Порядок" value={editingFaq.display_order} onChange={(e) => setEditingFaq({...editingFaq, display_order: parseInt(e.target.value)})} />
              <Button type="submit">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default FAQTab;
