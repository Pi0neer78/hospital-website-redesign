import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";

const SMS_VERIFY_URL = "https://functions.poehali.dev/7ea5c6f5-d200-4cc0-b34b-10144a995d69";
const CANCEL_URL = "https://functions.poehali.dev/c257bb2b-a49e-4b1c-8507-6c78b99a7f26";

type Step = 'phone' | 'code' | 'list' | 'confirm' | 'done';

interface Appointment {
  id: number;
  date: string;
  time: string;
  patient_name: string;
  doctor_name: string;
  doctor_specialty: string;
  description: string;
}

function formatDate(d: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  return `${day}.${m}.${y}`;
}

export default function CancelAppointmentDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [cancelled, setCancelled] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  function resetAll() {
    setStep('phone');
    setPhone('');
    setCode('');
    setAppointments([]);
    setSelected(null);
    setCancelled(null);
    setLoading(false);
    setCodeSent(false);
    setCountdown(0);
    if (timerRef.current) clearInterval(timerRef.current);
  }

  function startCountdown() {
    setCountdown(60);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function handleSendCode() {
    const clean = phone.replace(/\D/g, '');
    if (clean.length < 10) {
      toast({ title: 'Ошибка', description: 'Введите корректный номер телефона', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(SMS_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send', phone_number: clean }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCodeSent(true);
        startCountdown();
        setStep('code');
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить код', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode() {
    const clean = phone.replace(/\D/g, '');
    setLoading(true);
    try {
      const res = await fetch(SMS_VERIFY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', phone_number: clean, code }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadAppointments(clean);
      } else {
        toast({ title: 'Неверный код', description: data.error || 'Проверьте код и попробуйте снова', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function loadAppointments(cleanPhone: string) {
    setLoading(true);
    try {
      const res = await fetch(CANCEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get-appointments', phone: cleanPhone }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAppointments(data.appointments);
        setStep('list');
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось загрузить записи', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel() {
    if (!selected) return;
    setLoading(true);
    try {
      const res = await fetch(CANCEL_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel', appointment_id: selected.id, phone: phone.replace(/\D/g, '') }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setCancelled(data.appointment);
        setStep('done');
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отменить запись', variant: 'destructive' });
        setStep('list');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetAll(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3 text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300">
          <Icon name="CalendarX" size={20} />
          Отменить запись
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md p-0 overflow-hidden">
        {/* Шаг 1: телефон */}
        {step === 'phone' && (
          <>
            <div className="bg-gradient-to-br from-red-500 to-rose-600 px-8 pt-7 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2.5">
                  <Icon name="CalendarX" size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold leading-tight">Отмена записи</h2>
                  <p className="text-red-200 text-sm">Введите номер телефона для подтверждения</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Номер телефона</label>
                <Input
                  placeholder="+7 (___) ___-__-__"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendCode()}
                  type="tel"
                  autoFocus
                />
                <p className="text-xs text-gray-500">Код подтверждения придёт в мессенджер MAX</p>
              </div>
              <Button onClick={handleSendCode} disabled={loading} className="w-full bg-red-500 hover:bg-red-600 text-white">
                {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : <Icon name="Send" size={16} className="mr-2" />}
                Получить код
              </Button>
            </div>
          </>
        )}

        {/* Шаг 2: код */}
        {step === 'code' && (
          <>
            <div className="bg-gradient-to-br from-orange-500 to-amber-600 px-8 pt-7 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2.5">
                  <Icon name="MessageSquare" size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold leading-tight">Введите код</h2>
                  <p className="text-amber-200 text-sm">Код отправлен в MAX на номер {phone}</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-gray-700">Код подтверждения</label>
                <Input
                  placeholder="6-значный код"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={e => e.key === 'Enter' && handleVerifyCode()}
                  maxLength={6}
                  autoFocus
                  className="text-center text-xl tracking-widest font-semibold"
                />
              </div>
              <Button onClick={handleVerifyCode} disabled={loading || code.length < 6} className="w-full bg-orange-500 hover:bg-orange-600 text-white">
                {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-2" /> : <Icon name="CheckCircle" size={16} className="mr-2" />}
                Подтвердить
              </Button>
              <div className="text-center">
                {countdown > 0 ? (
                  <p className="text-sm text-gray-500">Повторная отправка через {countdown} сек.</p>
                ) : (
                  <button onClick={handleSendCode} className="text-sm text-orange-600 hover:underline">Отправить код повторно</button>
                )}
              </div>
              <button onClick={() => setStep('phone')} className="w-full text-sm text-gray-500 hover:text-gray-700">← Изменить номер</button>
            </div>
          </>
        )}

        {/* Шаг 3: список записей */}
        {step === 'list' && (
          <>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 px-8 pt-7 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2.5">
                  <Icon name="ListChecks" size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold leading-tight">Ваши записи</h2>
                  <p className="text-blue-200 text-sm">Выберите запись для отмены</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-3 max-h-[420px] overflow-y-auto">
              {appointments.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="CalendarX" size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">Активных записей не найдено</p>
                  <button onClick={() => setOpen(false)} className="mt-4 text-sm text-blue-600 hover:underline">Закрыть</button>
                </div>
              ) : (
                <>
                  {appointments.map(appt => (
                    <div
                      key={appt.id}
                      onClick={() => setSelected(appt)}
                      className={`border rounded-xl p-4 cursor-pointer transition-all space-y-2 ${selected?.id === appt.id ? 'border-red-400 bg-red-50 ring-1 ring-red-300' : 'border-gray-200 hover:border-gray-300 bg-gray-50 hover:bg-white'}`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon name="Calendar" size={14} className="text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">{formatDate(appt.date)}</span>
                          <Icon name="Clock" size={14} className="text-blue-600" />
                          <span className="text-sm font-semibold text-gray-900">{appt.time}</span>
                        </div>
                        {selected?.id === appt.id && <Icon name="CheckCircle2" size={18} className="text-red-500" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon name="Stethoscope" size={13} className="text-gray-500 shrink-0" />
                        <span className="text-sm text-gray-700">{appt.doctor_name}</span>
                        {appt.doctor_specialty && <span className="text-xs text-gray-400">({appt.doctor_specialty})</span>}
                      </div>
                      {appt.description && (
                        <div className="flex items-start gap-2">
                          <Icon name="FileText" size={13} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-500">{appt.description}</span>
                        </div>
                      )}
                    </div>
                  ))}
                  <Button
                    onClick={() => selected && setStep('confirm')}
                    disabled={!selected}
                    className="w-full bg-red-500 hover:bg-red-600 text-white mt-2"
                  >
                    <Icon name="CalendarX" size={16} className="mr-2" />
                    Отменить запись
                  </Button>
                </>
              )}
            </div>
          </>
        )}

        {/* Шаг 4: подтверждение */}
        {step === 'confirm' && selected && (
          <>
            <div className="bg-gradient-to-br from-red-500 to-rose-600 px-8 pt-7 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2.5">
                  <Icon name="AlertTriangle" size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold leading-tight">Подтвердите отмену</h2>
                  <p className="text-red-200 text-sm">Действие нельзя отменить</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center gap-2">
                  <Icon name="Calendar" size={15} className="text-blue-600" />
                  <span className="text-sm text-gray-700">{formatDate(selected.date)} в {selected.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Stethoscope" size={15} className="text-gray-500" />
                  <span className="text-sm text-gray-700">{selected.doctor_name}</span>
                  {selected.doctor_specialty && <span className="text-xs text-gray-400">({selected.doctor_specialty})</span>}
                </div>
              </div>
              <p className="text-sm text-gray-600 text-center">Вы уверены, что хотите отменить эту запись?</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('list')}
                  className="flex-1"
                  disabled={loading}
                >
                  <Icon name="ArrowLeft" size={16} className="mr-1.5" />
                  Нет, назад
                </Button>
                <Button
                  onClick={handleCancel}
                  disabled={loading}
                  className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                >
                  {loading ? <Icon name="Loader2" size={16} className="animate-spin mr-1.5" /> : <Icon name="Trash2" size={16} className="mr-1.5" />}
                  Да, отменить
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Шаг 5: успех */}
        {step === 'done' && cancelled && (
          <>
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 px-8 pt-7 pb-6">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 rounded-full p-2.5">
                  <Icon name="CheckCircle" size={26} className="text-white" />
                </div>
                <div>
                  <h2 className="text-white text-lg font-bold leading-tight">Запись отменена</h2>
                  <p className="text-green-200 text-sm">Уведомление отправлено в MAX</p>
                </div>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Отменённая запись</p>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Icon name="Calendar" size={16} className="text-blue-700" />
                  </div>
                  <span className="text-base font-semibold text-gray-900">{formatDate(cancelled.date)}</span>
                  <div className="bg-blue-100 rounded-lg p-2">
                    <Icon name="Clock" size={16} className="text-blue-700" />
                  </div>
                  <span className="text-base font-semibold text-gray-900">{cancelled.time}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="Stethoscope" size={15} className="text-gray-500 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cancelled.doctor_name}</p>
                    {cancelled.doctor_specialty && <p className="text-xs text-gray-500">{cancelled.doctor_specialty}</p>}
                  </div>
                </div>
                {cancelled.patient_name && (
                  <div className="flex items-center gap-2">
                    <Icon name="User" size={15} className="text-gray-500 shrink-0" />
                    <p className="text-sm text-gray-700">{cancelled.patient_name}</p>
                  </div>
                )}
              </div>
              <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
                <Icon name="MessageCircle" size={15} className="text-green-600 shrink-0 mt-0.5" />
                <p className="text-xs text-green-700">Информация об отмене отправлена вам в мессенджер MAX</p>
              </div>
              <Button onClick={() => { setOpen(false); resetAll(); }} className="w-full bg-green-500 hover:bg-green-600 text-white">
                <Icon name="Check" size={16} className="mr-2" />
                Готово
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
