import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface AppointmentSuccessData {
  date: string;
  time: string;
  doctorName: string;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
}

interface AppointmentSuccessModalProps {
  open: boolean;
  data: AppointmentSuccessData | null;
  onClose: () => void;
}

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const [y, m, d] = dateStr.split('-');
  return `${d}.${m}.${y}`;
}

export default function AppointmentSuccessModal({ open, data, onClose }: AppointmentSuccessModalProps) {
  if (!data) return null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-7 pb-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-full p-2.5">
              <Icon name="CalendarPlus" size={26} className="text-white" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold leading-tight">Запись создана!</h2>
              <p className="text-blue-200 text-sm">Пациент успешно записан на приём</p>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
            <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">Дата и время приёма</p>
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Icon name="Calendar" size={17} className="text-blue-700" />
                </div>
                <span className="text-base font-semibold text-gray-900">{formatDate(data.date)}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 rounded-lg p-2">
                  <Icon name="Clock" size={17} className="text-blue-700" />
                </div>
                <span className="text-base font-semibold text-gray-900">{data.time}</span>
              </div>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 space-y-2">
            <p className="text-xs font-semibold text-indigo-700 uppercase tracking-wide">Врач</p>
            <div className="flex items-center gap-2">
              <Icon name="Stethoscope" size={16} className="text-indigo-600 shrink-0" />
              <span className="text-sm font-medium text-gray-900">{data.doctorName || '—'}</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Данные пациента</p>

            <div className="flex items-start gap-2">
              <Icon name="User" size={15} className="text-gray-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs text-gray-500">ФИО</p>
                <p className="text-sm font-medium text-gray-900">{data.patientName || '—'}</p>
              </div>
            </div>

            {data.patientPhone && (
              <div className="flex items-start gap-2">
                <Icon name="Phone" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Телефон</p>
                  <p className="text-sm font-medium text-gray-900">{data.patientPhone}</p>
                </div>
              </div>
            )}

            {data.patientSnils && (
              <div className="flex items-start gap-2">
                <Icon name="CreditCard" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">СНИЛС</p>
                  <p className="text-sm font-medium text-gray-900">{data.patientSnils}</p>
                </div>
              </div>
            )}

            {data.patientOms && (
              <div className="flex items-start gap-2">
                <Icon name="Shield" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Полис ОМС</p>
                  <p className="text-sm font-medium text-gray-900">{data.patientOms}</p>
                </div>
              </div>
            )}

            {data.description && (
              <div className="flex items-start gap-2">
                <Icon name="FileText" size={15} className="text-gray-500 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-gray-500">Описание</p>
                  <p className="text-sm font-medium text-gray-900">{data.description}</p>
                </div>
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full">
            <Icon name="Check" size={16} className="mr-2" />
            Готово
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
