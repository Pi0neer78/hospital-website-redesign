import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { validateFullName } from '@/utils/validation';

interface NewAppointmentFormProps {
  open: boolean;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
  onChangePatientName: (value: string) => void;
  onChangePatientPhone: (value: string) => void;
  onChangePatientSnils: (value: string) => void;
  onChangePatientOms: (value: string) => void;
  onChangeDescription: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

const NewAppointmentForm = ({
  open,
  patientName,
  patientPhone,
  patientSnils,
  patientOms,
  description,
  onChangePatientName,
  onChangePatientPhone,
  onChangePatientSnils,
  onChangePatientOms,
  onChangeDescription,
  onSubmit,
  onCancel
}: NewAppointmentFormProps) => {
  const [nameError, setNameError] = useState<string | null>(null);

  const handleNameChange = (value: string) => {
    onChangePatientName(value);
    if (nameError) setNameError(validateFullName(value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateFullName(patientName);
    if (error) {
      setNameError(error);
      return;
    }
    setNameError(null);
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Новая запись</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium">ФИО пациента *</label>
            <Input
              value={patientName}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Иванов Иван Иванович"
              className={nameError ? 'border-red-500 focus-visible:ring-red-500' : ''}
            />
            {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
          </div>
          <div>
            <label className="text-sm font-medium">Телефон *</label>
            <Input
              value={patientPhone}
              onChange={(e) => onChangePatientPhone(e.target.value)}
              placeholder="+7 (___) ___-__-__"
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">СНИЛС</label>
            <Input
              value={patientSnils}
              onChange={(e) => onChangePatientSnils(e.target.value)}
              placeholder="123-456-789 00"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Полис ОМС</label>
            <Input
              value={patientOms}
              onChange={(e) => onChangePatientOms(e.target.value)}
              placeholder="1234567890123456"
            />
          </div>
          <div>
            <label className="text-sm font-medium">Описание</label>
            <Textarea
              value={description}
              onChange={(e) => onChangeDescription(e.target.value)}
              placeholder="Причина обращения..."
              rows={3}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onCancel}>
              Отмена
            </Button>
            <Button type="submit">
              Создать запись
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NewAppointmentForm;