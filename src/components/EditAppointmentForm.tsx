import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { validateFullName } from '@/utils/validation';
import NameErrorModal from '@/components/NameErrorModal';

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

const API_URL = 'https://functions.poehali.dev/6f53f66d-3e47-4e57-93dd-52d63c16d38f';

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
  const [nameError, setNameError] = useState<string | null>(null);
  const [nameErrorModal, setNameErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });

  const formatSnils = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
  };

  const formatOms = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    if (digits.length <= 8) return `${digits.slice(0, 4)}-${digits.slice(4)}`;
    if (digits.length <= 12) return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
    return `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
  };

  const handleSnilsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatSnils(e.target.value);
    setEditForm({ ...editForm, snils: formatted });
  };

  const handleOmsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatOms(e.target.value);
    setEditForm({ ...editForm, oms: formatted });
  };

  const handleSaveEdit = async () => {
    if (!editForm.patient_name.trim() || !editForm.patient_phone.trim()) {
      toast({
        title: 'Ошибка',
        description: 'ФИО и телефон обязательны',
        variant: 'destructive'
      });
      return;
    }

    const error = validateFullName(editForm.patient_name);
    if (error) {
      setNameError(error);
      setNameErrorModal({ open: true, message: error });
      return;
    }
    setNameError(null);

    setIsSaving(true);
    try {
      const requestBody: any = {
        action: 'edit_appointment',
        id: appointment.id,
        patient_name: editForm.patient_name.trim(),
        patient_phone: editForm.patient_phone.trim(),
        patient_snils: editForm.snils.trim() || null,
        patient_oms: editForm.oms.trim() || null,
        description: editForm.description.trim() || null
      };

      console.log('📤 Отправляем на backend:', requestBody);

      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });
      
      console.log('📥 Ответ backend:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ Ошибка от backend:', errorData);
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
          onChange={(e) => {
            setEditForm({ ...editForm, patient_name: e.target.value });
            if (nameError) setNameError(validateFullName(e.target.value));
          }}
          placeholder="Иванов Иван Иванович"
          className={nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
        />
        {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
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
          onChange={handleSnilsChange}
          placeholder="123-123-123-12"
          maxLength={14}
        />
      </div>

      <div>
        <Label htmlFor="edit-oms">Полис ОМС</Label>
        <Input
          id="edit-oms"
          value={editForm.oms}
          onChange={handleOmsChange}
          placeholder="1234-1234-1234-1234"
          maxLength={19}
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

      <NameErrorModal
        open={nameErrorModal.open}
        errorMessage={nameErrorModal.message}
        onClose={() => setNameErrorModal({ open: false, message: '' })}
      />
    </div>
  );
}