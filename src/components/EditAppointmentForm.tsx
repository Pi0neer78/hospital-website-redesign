import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  patient_snils?: string;
  patient_oms?: string;
  description?: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
}

interface EditAppointmentFormProps {
  appointment: Appointment;
  onSuccess: () => void;
  onCancel: () => void;
}

const API_URL = 'https://functions.poehali.dev/a7f148cd-e1c2-40e3-9762-cc8b2bc2dffb';

export function EditAppointmentForm({ appointment, onSuccess, onCancel }: EditAppointmentFormProps) {
  const { toast } = useToast();
  const [editForm, setEditForm] = useState({
    patient_name: appointment.patient_name,
    patient_phone: appointment.patient_phone,
    snils: appointment.patient_snils || '',
    oms: appointment.patient_oms || '',
    description: appointment.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEdit = async () => {
    if (!editForm.patient_name.trim() || !editForm.patient_phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'ФИО и телефон обязательны',
        variant: 'destructive'
      });
      return;
    }

    setIsSaving(true);
    try {
      const requestBody = {
        id: appointment.id,
        patient_name: editForm.patient_name.trim(),
        patient_phone: editForm.patient_phone.trim(),
        snils: editForm.snils.trim(),
        oms: editForm.oms.trim(),
        description: editForm.description.trim()
      };

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${response.status}: Не удалось сохранить изменения`);
      }

      const result = await response.json();
      
      toast({
        title: 'Успешно',
        description: 'Данные пациента обновлены'
      });
      
      onSuccess();
    } catch (error) {
      console.error('Edit appointment error:', error);
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="edit-name">ФИО пациента *</Label>
        <Input
          id="edit-name"
          value={editForm.patient_name}
          onChange={(e) => setEditForm({ ...editForm, patient_name: e.target.value })}
          placeholder="Иванов Иван Иванович"
        />
      </div>

      <div>
        <Label htmlFor="edit-phone">Телефон *</Label>
        <Input
          id="edit-phone"
          value={editForm.patient_phone}
          onChange={(e) => setEditForm({ ...editForm, patient_phone: e.target.value })}
          placeholder="+7 (999) 123-45-67"
        />
      </div>

      <div>
        <Label htmlFor="edit-snils">СНИЛС</Label>
        <Input
          id="edit-snils"
          value={editForm.snils}
          onChange={(e) => setEditForm({ ...editForm, snils: e.target.value })}
          placeholder="123-456-789 00"
        />
      </div>

      <div>
        <Label htmlFor="edit-oms">Полис ОМС</Label>
        <Input
          id="edit-oms"
          value={editForm.oms}
          onChange={(e) => setEditForm({ ...editForm, oms: e.target.value })}
          placeholder="1234567890123456"
        />
      </div>

      <div>
        <Label htmlFor="edit-description">Описание</Label>
        <Textarea
          id="edit-description"
          value={editForm.description}
          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          placeholder="Дополнительная информация"
          rows={3}
        />
      </div>

      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleSaveEdit}
          disabled={isSaving}
          className="flex-1"
        >
          {isSaving ? 'Сохранение...' : 'Сохранить'}
        </Button>
        <Button
          variant="outline"
          onClick={onCancel}
          disabled={isSaving}
        >
          Отмена
        </Button>
      </div>
    </div>
  );
}