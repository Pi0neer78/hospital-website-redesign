import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { Clinic, CLINICS_URL } from '@/hooks/useClinics';

interface Props {
  clinics: Clinic[];
  onChange: () => void;
}

const ICONS = ['Building2', 'Baby', 'HeartPulse', 'Stethoscope', 'Hospital', 'Syringe', 'Pill', 'Activity', 'Eye', 'Ear', 'Bone'];

const emptyForm = { id: 0, name: '', description: '', icon: 'Building2', sort_order: 0 };

const ClinicsTab = ({ clinics, onChange }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const openCreate = () => {
    setForm({ ...emptyForm, sort_order: clinics.length + 1 });
    setOpen(true);
  };

  const openEdit = (c: Clinic) => {
    setForm({ id: c.id, name: c.name, description: c.description || '', icon: c.icon || 'Building2', sort_order: c.sort_order });
    setOpen(true);
  };

  const save = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Ошибка', description: 'Введите название отделения', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const isEdit = form.id > 0;
      const res = await fetch(CLINICS_URL, {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить', variant: 'destructive' });
        return;
      }
      toast({ title: isEdit ? 'Отделение обновлено' : 'Отделение добавлено' });
      setOpen(false);
      onChange();
    } catch {
      toast({ title: 'Ошибка', description: 'Проблема с подключением', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: Clinic) => {
    await fetch(CLINICS_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: c.id, is_active: !c.is_active }),
    });
    onChange();
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Отделения</CardTitle>
        <Button onClick={openCreate}>
          <Icon name="Plus" size={16} className="mr-1" />
          Добавить отделение
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Эти отделения показываются при записи на приём и при выборе места работы врача и регистратора. Скрытое отделение пропадает с сайта, а врачи и записи остаются.
        </p>
        {clinics.map((c) => (
          <div key={c.id} className="flex items-center gap-4 border rounded-lg p-3">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Icon name={c.icon || 'Building2'} fallback="Building2" size={24} className="text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{c.name}</p>
              {c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">{c.is_active ? 'Показано' : 'Скрыто'}</span>
              <Switch checked={c.is_active} onCheckedChange={() => toggleActive(c)} />
            </div>
            <Button variant="outline" size="sm" onClick={() => openEdit(c)}>
              <Icon name="Pencil" size={14} />
            </Button>
          </div>
        ))}
      </CardContent>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Изменить отделение' : 'Новое отделение'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Название *</label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Например: Женская консультация" />
              {form.id > 0 && (
                <p className="text-xs text-muted-foreground mt-1">При переименовании название обновится у всех врачей и регистраторов отделения.</p>
              )}
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Описание</label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Короткая подпись на карточке" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Значок</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {ICONS.map((ic) => (
                  <button
                    key={ic}
                    type="button"
                    onClick={() => setForm({ ...form, icon: ic })}
                    className={`w-10 h-10 rounded-lg border flex items-center justify-center ${form.icon === ic ? 'border-primary bg-primary/10' : 'hover:bg-muted'}`}
                  >
                    <Icon name={ic} fallback="Building2" size={20} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Порядок показа</label>
              <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
              <Button onClick={save} disabled={saving}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default ClinicsTab;
