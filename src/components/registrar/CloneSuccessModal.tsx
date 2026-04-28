import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface CloneSuccessData {
  newDate: string;
  newTime: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
}

interface CloneSuccessModalProps {
  open: boolean;
  data: CloneSuccessData | null;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export default function CloneSuccessModal({ open, data, onClose }: CloneSuccessModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-emerald-500 to-teal-600 px-8 pt-7 pb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="bg-white/20 rounded-full p-2.5">
              <Icon name="CalendarCheck" size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight">Запись успешно клонирована</h2>
              <p className="text-emerald-100 text-sm">Новая запись создана</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Дата и время приёма</p>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 rounded-lg p-2">
                <Icon name="Calendar" size={18} className="text-emerald-700" />
              </div>
              <span className="text-base font-semibold text-gray-900">{formatDate(data.newDate)}</span>
              <div className="bg-emerald-100 rounded-lg p-2 ml-1">
                <Icon name="Clock" size={18} className="text-emerald-700" />
              </div>
              <span className="text-base font-semibold text-gray-900">{data.newTime}</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Врач</p>
            <div className="flex items-center gap-2">
              <Icon name="Stethoscope" size={16} className="text-blue-600 shrink-0" />
              <span className="text-sm font-medium text-gray-900">{data.doctorName}</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Данные пациента</p>

            <div className="flex items-start gap-2">
              <Icon name="User" size={15} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500">ФИО</span>
                <p className="text-sm font-medium text-gray-900">{data.patientName || '—'}</p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <Icon name="Phone" size={15} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs text-gray-500">Телефон</span>
                <p className="text-sm font-medium text-gray-900">{data.patientPhone || '—'}</p>
              </div>
            </div>

            {data.patientSnils && (
              <div className="flex items-start gap-2">
                <Icon name="CreditCard" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500">СНИЛС</span>
                  <p className="text-sm font-medium text-gray-900">{data.patientSnils}</p>
                </div>
              </div>
            )}

            {data.patientOms && (
              <div className="flex items-start gap-2">
                <Icon name="Shield" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500">Полис ОМС</span>
                  <p className="text-sm font-medium text-gray-900">{data.patientOms}</p>
                </div>
              </div>
            )}

            {data.description && (
              <div className="flex items-start gap-2">
                <Icon name="FileText" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs text-gray-500">Описание</span>
                  <p className="text-sm font-medium text-gray-900">{data.description}</p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full bg-emerald-600 hover:bg-emerald-700">
            <Icon name="Check" size={16} className="mr-2" />
            Отлично!
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
