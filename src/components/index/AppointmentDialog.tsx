/* eslint-disable @typescript-eslint/no-explicit-any */
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import Icon from '@/components/ui/icon';

interface AppointmentDialogProps {
  isAppointmentOpen: boolean;
  setIsAppointmentOpen: (v: boolean) => void;
  doctors: any[];
  selectedClinic: string | null;
  setSelectedClinic: (v: string | null) => void;
  selectedDoctor: any;
  setSelectedDoctor: (v: any) => void;
  selectedDate: string;
  setSelectedDate: (v: string) => void;
  appointmentForm: any;
  setAppointmentForm: (v: any) => void;
  verificationStep: 'form' | 'code' | 'verified';
  setVerificationStep: (v: 'form' | 'code' | 'verified') => void;
  verificationCode: string;
  setVerificationCode: (v: string) => void;
  gdprConsent: boolean;
  setGdprConsent: (v: boolean) => void;
  isSubmitting: boolean;
  isLoadingCalendar: boolean;
  setIsLoadingCalendar: (v: boolean) => void;
  isLoadingSlots: boolean;
  availableSlots: any[];
  allSlots: any;
  allTimeSlotsForDate: any[];
  getNext7Days: () => { date: string; label: string; dayOfWeek: number }[];
  isDayAvailable: (date: string) => boolean;
  handleSendVerificationCode: (e: React.FormEvent) => void;
  handleVerifyCode: (e: React.FormEvent) => void;
  handleAppointment: (e: React.FormEvent) => void;
  setPhotoModalUrl: (v: string) => void;
  setPhotoModalOpen: (v: boolean) => void;
}

const AppointmentDialog = ({
  isAppointmentOpen,
  setIsAppointmentOpen,
  doctors,
  selectedClinic,
  setSelectedClinic,
  selectedDoctor,
  setSelectedDoctor,
  selectedDate,
  setSelectedDate,
  appointmentForm,
  setAppointmentForm,
  verificationStep,
  setVerificationStep,
  verificationCode,
  setVerificationCode,
  gdprConsent,
  setGdprConsent,
  isSubmitting,
  isLoadingCalendar,
  setIsLoadingCalendar,
  isLoadingSlots,
  availableSlots,
  allSlots,
  allTimeSlotsForDate,
  getNext7Days,
  isDayAvailable,
  handleSendVerificationCode,
  handleVerifyCode,
  handleAppointment,
  setPhotoModalUrl,
  setPhotoModalOpen,
}: AppointmentDialogProps) => {
  return (
    <Dialog open={isAppointmentOpen} onOpenChange={(open) => {
      const slotErrorDialog = document.getElementById('slot-error-overlay');
      if (!open && slotErrorDialog) return;
      setIsAppointmentOpen(open);
    }}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-shadow w-full sm:w-auto sm:min-w-[200px] bg-blue-900 hover:bg-blue-800" data-appointment-trigger>
          <Icon name="Calendar" size={20} />
          Записаться на прием
        </Button>
      </DialogTrigger>
      <DialogContent className="w-[calc(100vw-16px)] max-w-4xl max-h-[90vh] overflow-y-auto" onPointerDownOutside={(e) => {
        const slotErrorDialog = document.getElementById('slot-error-overlay');
        if (slotErrorDialog) e.preventDefault();
      }}>
        <DialogHeader>
          <DialogTitle>Запись на прием</DialogTitle>
          <DialogDescription>Выберите врача, дату и время приема</DialogDescription>
        </DialogHeader>

        {!selectedClinic ? (
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Выберите поликлинику:</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:border-primary" onClick={() => setSelectedClinic('Центральная городская поликлиника')}>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto bg-blue-100 rounded-full flex items-center justify-center mb-3">
                    <Icon name="Building2" size={40} className="text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">Центральная городская поликлиника</CardTitle>
                  <CardDescription className="text-base">Взрослое отделение</CardDescription>
                </CardHeader>
              </Card>
              <Card className="cursor-pointer hover:shadow-xl transition-all hover:border-primary" onClick={() => setSelectedClinic('Детская городская поликлиника')}>
                <CardHeader className="text-center">
                  <div className="w-20 h-20 mx-auto bg-pink-100 rounded-full flex items-center justify-center mb-3">
                    <Icon name="Baby" size={40} className="text-pink-600" />
                  </div>
                  <CardTitle className="text-xl">Детская городская поликлиника</CardTitle>
                  <CardDescription className="text-base">Детское отделение</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        ) : !selectedDoctor ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-lg">{selectedClinic}</h3>
              <Button variant="outline" size="sm" onClick={() => setSelectedClinic(null)}>
                <Icon name="ArrowLeft" size={16} className="mr-1" />
                Назад
              </Button>
            </div>
            <h3 className="font-semibold">Выберите врача:</h3>
            <div className="grid md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {doctors
                .filter((doctor: any) => doctor.clinic === selectedClinic)
                .map((doctor: any) => (
                  <Card key={doctor.id} className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setSelectedDoctor(doctor)}>
                    <CardContent className="p-3">
                      <div className="flex items-center gap-4 w-full">
                        {doctor.photo_url ? (
                          <img
                            src={doctor.photo_url}
                            alt={doctor.full_name}
                            className="w-24 h-24 rounded-lg object-cover flex-shrink-0 cursor-pointer hover:shadow-lg transition-shadow"
                            onClick={(e) => { e.stopPropagation(); setPhotoModalUrl(doctor.photo_url); setPhotoModalOpen(true); }}
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <Icon name="User" size={40} className="text-primary" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 space-y-1">
                          <p className="font-semibold text-sm">{doctor.full_name}</p>
                          <p className="text-xs text-muted-foreground">{doctor.position}</p>
                          {doctor.specialization && <p className="text-xs text-muted-foreground">{doctor.specialization}</p>}
                          <div className="pt-1 space-y-0.5">
                            {doctor.office_number && (
                              <p className="text-xs flex items-center gap-1">
                                <Icon name="DoorOpen" size={12} className="text-primary" />
                                <span className="font-medium">Кабинет {doctor.office_number}</span>
                              </p>
                            )}
                            {doctor.work_experience && (
                              <p className="text-xs flex items-center gap-1">
                                <Icon name="Briefcase" size={12} className="text-primary" />
                                <span>Стаж {doctor.work_experience} лет</span>
                              </p>
                            )}
                            {doctor.education && (
                              <p className="text-xs flex items-center gap-1">
                                <Icon name="GraduationCap" size={12} className="text-primary" />
                                <span className="truncate" title={doctor.education}>{doctor.education}</span>
                              </p>
                            )}
                            {doctor.category && (
                              <p className="text-xs flex items-center gap-1">
                                <Icon name="Award" size={12} className="text-primary" />
                                <span className="truncate" title={doctor.category}>Категория: {doctor.category}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ) : !selectedDate ? (
          isLoadingCalendar ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedDoctor.photo_url ? (
                    <img src={selectedDoctor.photo_url} alt={selectedDoctor.full_name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Icon name="User" size={24} className="text-primary" /></div>
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.position}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSelectedDoctor(null); setSelectedClinic(null); setIsLoadingCalendar(false); }}>Изменить</Button>
              </div>
              <Card className="bg-blue-50 border-blue-200">
                <CardContent className="py-12 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    <div>
                      <p className="text-lg font-semibold text-blue-900">Идет получение данных</p>
                      <p className="text-sm text-blue-700 mt-1">Загружаем доступные даты...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedDoctor.photo_url ? (
                    <img src={selectedDoctor.photo_url} alt={selectedDoctor.full_name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Icon name="User" size={24} className="text-primary" /></div>
                  )}
                  <div>
                    <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedDoctor.position}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" onClick={() => { setSelectedDoctor(null); setSelectedClinic(null); }}>Изменить</Button>
              </div>
              <h3 className="font-semibold">Выберите дату:</h3>
              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {getNext7Days().map((day) => {
                  const isAvailable = isDayAvailable(day.date);
                  const daySlotData = allSlots[day.date];
                  const availableCount = daySlotData?.available?.length || 0;
                  const bookedCount = daySlotData?.booked || 0;
                  const totalCount = availableCount + bookedCount;
                  return (
                    <Button
                      key={day.date}
                      variant="outline"
                      className={`h-24 flex flex-col ${!isAvailable ? 'opacity-40 cursor-not-allowed' : ''}`}
                      onClick={() => isAvailable && setSelectedDate(day.date)}
                      disabled={!isAvailable}
                    >
                      <span className="text-xs text-muted-foreground">{day.label.split(',')[0]}</span>
                      <span className="text-lg font-bold">{day.label.split(',')[1]}</span>
                      {!isAvailable ? (
                        <span className="text-[10px] text-red-500 mt-0.5">Нет приема</span>
                      ) : totalCount === 0 ? (
                        <span className="text-[10px] text-muted-foreground mt-0.5">...</span>
                      ) : availableCount === 0 ? (
                        <span className="text-[10px] text-orange-500 mt-0.5 font-semibold leading-tight text-center">
                          всего {totalCount}<br/>нет свободных
                        </span>
                      ) : (
                        <span className="text-[10px] text-green-600 mt-0.5 font-semibold leading-tight text-center">
                          всего {totalCount}<br/>{availableCount} своб.
                        </span>
                      )}
                    </Button>
                  );
                })}
              </div>
            </div>
          )
        ) : isLoadingSlots ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedDoctor.photo_url ? (
                  <img src={selectedDoctor.photo_url} alt={selectedDoctor.full_name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Icon name="User" size={24} className="text-primary" /></div>
                )}
                <div>
                  <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Дата: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate('')}>Изменить дату</Button>
            </div>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <div>
                    <p className="text-lg font-semibold text-blue-900">Идет получение данных</p>
                    <p className="text-sm text-blue-700 mt-1">Загружаем доступные слоты...</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : availableSlots.length === 0 && !isSubmitting ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedDoctor.photo_url ? (
                  <img src={selectedDoctor.photo_url} alt={selectedDoctor.full_name} className="w-12 h-12 rounded-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center"><Icon name="User" size={24} className="text-primary" /></div>
                )}
                <div>
                  <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Дата: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => setSelectedDate('')}>Изменить дату</Button>
            </div>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="py-6 text-center">
                <Icon name="AlertCircle" size={32} className="text-yellow-600 mx-auto mb-2" />
                <p className="text-yellow-800">На выбранную дату нет свободных слотов</p>
                <p className="text-sm text-yellow-600 mt-1">Выберите другую дату</p>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {selectedDoctor.photo_url ? (
                  <img
                    src={selectedDoctor.photo_url}
                    alt={selectedDoctor.full_name}
                    className="w-24 h-24 rounded-lg object-cover cursor-pointer hover:shadow-lg transition-shadow"
                    onClick={() => { setPhotoModalUrl(selectedDoctor.photo_url); setPhotoModalOpen(true); }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                ) : (
                  <div className="w-24 h-24 rounded-lg bg-primary/10 flex items-center justify-center"><Icon name="User" size={40} className="text-primary" /></div>
                )}
                <div>
                  <h3 className="font-semibold">{selectedDoctor.full_name}</h3>
                  <p className="text-sm text-muted-foreground">Дата: {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU')}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={() => { setSelectedDate(''); setAppointmentForm({ ...appointmentForm, appointment_time: '' }); }}>
                Изменить дату
              </Button>
            </div>

            {!appointmentForm.appointment_time ? (
              <div>
                <h3 className="font-semibold mb-3">Выберите время:</h3>
                <div className="flex flex-wrap gap-2 mb-3 text-[11px]">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-primary rounded"></div>
                    <span>Свободно</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-red-100 border-2 border-red-500 rounded"></div>
                    <span>Занято</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-orange-100 border-2 border-orange-500 rounded"></div>
                    <span>Перерыв</span>
                  </div>
                </div>
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2 max-h-64 overflow-y-auto pr-1">
                  {allTimeSlotsForDate.length > 0 ? (
                    allTimeSlotsForDate.map((slot: any) => {
                      const isBreak = slot.status === 'break';
                      const isBooked = slot.status === 'booked';
                      const isFree = slot.available && !isBreak && !isBooked;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          style={
                            isBreak
                              ? { backgroundColor: '#ffedd5', borderColor: '#f97316', color: '#c2410c', cursor: 'not-allowed' }
                              : isBooked
                              ? { backgroundColor: '#fee2e2', borderColor: '#ef4444', color: '#b91c1c', cursor: 'not-allowed' }
                              : { backgroundColor: '#ffffff', borderColor: '#d1d5db', color: '#111827', cursor: 'pointer' }
                          }
                          className={`text-sm h-9 px-2 rounded-md border font-medium flex items-center justify-center gap-1 transition-colors ${
                            isFree ? 'hover:bg-blue-600 hover:text-white hover:border-blue-600' : ''
                          }`}
                          onClick={() => isFree && setAppointmentForm({ ...appointmentForm, appointment_time: slot.time })}
                        >
                          {slot.time}
                          {isBreak && <Icon name="Coffee" size={10} />}
                        </button>
                      );
                    })
                  ) : (
                    availableSlots.map((slot: string) => (
                      <Button
                        key={slot}
                        variant="outline"
                        size="sm"
                        className="text-sm h-9 hover:bg-primary hover:text-white"
                        onClick={() => setAppointmentForm({ ...appointmentForm, appointment_time: slot })}
                      >
                        {slot}
                      </Button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Card className="bg-primary/5">
                  <CardContent className="pt-4">
                    <p className="text-sm"><strong>Врач:</strong> {selectedDoctor.full_name}</p>
                    <p className="text-sm"><strong>Дата:</strong> {new Date(selectedDate + 'T00:00:00').toLocaleDateString('ru-RU')}</p>
                    <p className="text-sm"><strong>Время:</strong> {appointmentForm.appointment_time}</p>
                    <Button variant="link" size="sm" type="button" onClick={() => setAppointmentForm({ ...appointmentForm, appointment_time: '' })} className="mt-2 p-0 h-auto">
                      Изменить время
                    </Button>
                  </CardContent>
                </Card>

                {verificationStep === 'form' && (
                  <form onSubmit={handleSendVerificationCode} className="space-y-4">
                    <Input placeholder="Ваше ФИО" value={appointmentForm.patient_name} onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_name: e.target.value })} required />
                    <Input placeholder="Телефон (+79991234567)" type="tel" value={appointmentForm.patient_phone} onChange={(e) => setAppointmentForm({ ...appointmentForm, patient_phone: e.target.value })} required />
                    <div className="grid grid-cols-2 gap-3">
                      <Input
                        placeholder="СНИЛС (123-456-789-01, необязательно)"
                        type="text"
                        value={appointmentForm.patient_snils}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 11) value = value.slice(0, 11);
                          if (value.length >= 3) value = value.slice(0, 3) + '-' + value.slice(3);
                          if (value.length >= 7) value = value.slice(0, 7) + '-' + value.slice(7);
                          if (value.length >= 11) value = value.slice(0, 11) + '-' + value.slice(11);
                          setAppointmentForm({ ...appointmentForm, patient_snils: value });
                        }}
                        maxLength={14}
                      />
                      <Input
                        placeholder="ОМС (1234-5678-9012-3456, необязательно)"
                        type="text"
                        value={appointmentForm.patient_oms}
                        onChange={(e) => {
                          let value = e.target.value.replace(/\D/g, '');
                          if (value.length > 16) value = value.slice(0, 16);
                          if (value.length >= 4) value = value.slice(0, 4) + '-' + value.slice(4);
                          if (value.length >= 9) value = value.slice(0, 9) + '-' + value.slice(9);
                          if (value.length >= 14) value = value.slice(0, 14) + '-' + value.slice(14);
                          setAppointmentForm({ ...appointmentForm, patient_oms: value });
                        }}
                        maxLength={19}
                      />
                    </div>
                    <Textarea placeholder="Краткое описание проблемы (необязательно)" value={appointmentForm.description} onChange={(e) => setAppointmentForm({ ...appointmentForm, description: e.target.value })} rows={3} />
                    <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                      <input type="checkbox" id="gdpr-consent" checked={gdprConsent} onChange={(e) => setGdprConsent(e.target.checked)} className="mt-1 w-4 h-4 cursor-pointer" required />
                      <label htmlFor="gdpr-consent" className="text-sm text-muted-foreground cursor-pointer">
                        Я даю согласие на обработку персональных данных в соответствии с{' '}
                        <a href="http://www.consultant.ru/document/cons_doc_LAW_61801/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ФЗ-152 «О персональных данных»</a>
                      </label>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting || !gdprConsent}>
                      {isSubmitting ? 'Отправка кода...' : 'Отправить код в MAX'}
                    </Button>
                  </form>
                )}

                {verificationStep === 'code' && (
                  <form onSubmit={handleVerifyCode} className="space-y-4">
                    <Card className="bg-blue-50 border-blue-200">
                      <CardContent className="pt-4">
                        <div className="flex items-start gap-3">
                          <Icon name="Info" size={24} className="text-blue-600 mt-1" />
                          <div>
                            <p className="font-medium text-blue-900 mb-1">Проверьте MAX</p>
                            <p className="text-sm text-blue-700">Код отправлен в мессенджер MAX на ваш номер. Введите полученный код.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    <Input placeholder="Введите 6-значный код" value={verificationCode} onChange={(e) => setVerificationCode(e.target.value)} required maxLength={6} pattern="[0-9]{6}" />
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1" disabled={isSubmitting}>
                        {isSubmitting ? 'Проверка...' : 'Подтвердить'}
                      </Button>
                      <Button type="button" variant="outline" onClick={() => { setVerificationStep('form'); setVerificationCode(''); }}>
                        Назад
                      </Button>
                    </div>
                  </form>
                )}

                {verificationStep === 'verified' && (
                  <form onSubmit={handleAppointment} className="space-y-4">
                    <Card className="bg-green-50 border-green-200">
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2">
                          <Icon name="CheckCircle" size={20} className="text-green-600" />
                          <p className="font-medium text-green-900">Номер подтвержден</p>
                        </div>
                      </CardContent>
                    </Card>
                    <div className="space-y-2 text-sm">
                      <p><strong>ФИО:</strong> {appointmentForm.patient_name}</p>
                      <p><strong>Телефон:</strong> {appointmentForm.patient_phone}</p>
                      {appointmentForm.patient_snils && <p><strong>СНИЛС:</strong> {appointmentForm.patient_snils}</p>}
                      {appointmentForm.description && <p><strong>Описание:</strong> {appointmentForm.description}</p>}
                    </div>
                    <div className="flex items-start gap-2 p-3 border rounded-lg bg-muted/30">
                      <Icon name="CheckCircle" size={16} className="text-green-600 mt-0.5 flex-shrink-0" />
                      <p className="text-xs text-muted-foreground">
                        Согласие на обработку персональных данных получено в соответствии с{' '}
                        <a href="http://www.consultant.ru/document/cons_doc_LAW_61801/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">ФЗ-152</a>
                      </p>
                    </div>
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Отправка...' : 'Подтвердить запись'}
                    </Button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AppointmentDialog;