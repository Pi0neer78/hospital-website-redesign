import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import type { Schedule, DailySchedule, DoctorInfo } from '@/types/doctor';
import { DAYS_OF_WEEK } from '@/constants/doctor';

interface ScheduleTabProps {
  doctorInfo: DoctorInfo;
  schedules: Schedule[];
  dailySchedules: DailySchedule[];
  onReload: () => void;
}

export const ScheduleTab = ({
  doctorInfo,
  schedules,
  dailySchedules,
  onReload
}: ScheduleTabProps) => {
  const [scheduleInstructionOpen, setScheduleInstructionOpen] = useState(false);

  return (
    <div className="mt-6">
      <Card className="mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Icon name="Clock" size={24} className="text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setScheduleInstructionOpen(!scheduleInstructionOpen)}>
                <h3 className="text-base font-bold text-purple-900">⏰ Инструкция: Еженедельное расписание</h3>
                <Icon 
                  name={scheduleInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-purple-600 flex-shrink-0"
                />
              </div>
              
              {scheduleInstructionOpen && (
                <div className="space-y-3 text-sm text-purple-800 mt-3">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="font-semibold mb-1">🎯 Для чего нужно расписание?</p>
                    <p className="text-purple-700">
                      Еженедельное расписание — это основа вашего рабочего графика. Здесь вы настраиваете, 
                      в какие дни недели вы принимаете, с какого по какое время, и сколько длится один приём. 
                      Пациенты увидят только настроенные здесь дни и часы.
                    </p>
                  </div>

                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="font-semibold mb-2">📋 Пошаговая настройка:</p>
                    <ul className="list-decimal list-inside space-y-1.5 text-purple-700 ml-2">
                      <li><strong>"Добавить день"</strong> — нажмите кнопку вверху справа</li>
                      <li><strong>Выберите день недели</strong> — например, Понедельник</li>
                      <li><strong>Время начала и окончания</strong> — с 09:00 до 18:00</li>
                      <li><strong>Длительность слота</strong> — сколько минут на одного пациента (15, 20, 30 минут)</li>
                      <li><strong>Перерыв</strong> (необязательно) — если есть обед, укажите с 13:00 до 14:00</li>
                      <li><strong>Сохраните</strong> — день появится в списке карточек ниже</li>
                    </ul>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="font-semibold mb-1 text-amber-900">💡 Пример готового расписания:</p>
                    <div className="text-amber-800 text-xs space-y-1 leading-relaxed">
                      <p><strong>Понедельник, Среда, Пятница:</strong> 09:00-18:00, обед 13:00-14:00, приём 30 мин</p>
                      <p><strong>Вторник, Четверг:</strong> 10:00-16:00, без перерыва, приём 20 мин</p>
                      <p><strong>Суббота:</strong> 09:00-14:00, без перерыва, приём 15 мин</p>
                      <p><strong>Воскресенье:</strong> не добавляем (автоматически выходной)</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Рабочее расписание</h2>
        <div className="flex gap-2">
          <Button size="lg">
            <Icon name="Plus" size={20} className="mr-2" />
            Добавить день
          </Button>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Еженедельное расписание</h3>
      {schedules.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Расписание пока не настроено</p>
            <p className="text-sm text-muted-foreground">Добавьте рабочие дни, чтобы пациенты могли записываться на прием</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {schedules.map((schedule) => (
            <Card key={schedule.id} className={schedule.is_active ? '' : 'opacity-60 bg-muted/50'}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="Calendar" size={20} className="text-primary" />
                    <h3 className="font-bold text-lg">{DAYS_OF_WEEK[schedule.day_of_week]}</h3>
                  </div>
                  {!schedule.is_active && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Неактивен</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <span>{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</span>
                  </div>
                  {schedule.break_start_time && schedule.break_end_time && (
                    <div className="flex items-center gap-2">
                      <Icon name="Coffee" size={16} className="text-muted-foreground" />
                      <span>Перерыв: {schedule.break_start_time.slice(0, 5)} - {schedule.break_end_time.slice(0, 5)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Icon name="Timer" size={16} className="text-muted-foreground" />
                    <span>Слот: {schedule.slot_duration} мин</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <h3 className="text-xl font-bold mb-4 mt-8">Ежедневные корректировки</h3>
      {dailySchedules.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-8 text-center">
            <Icon name="CalendarDays" size={40} className="mx-auto mb-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Нет ежедневных корректировок</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dailySchedules.map((schedule) => (
            <Card key={schedule.id} className={schedule.is_active ? '' : 'opacity-60 bg-muted/50'}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Icon name="CalendarDays" size={20} className="text-primary" />
                    <h3 className="font-bold text-lg">
                      {new Date(schedule.schedule_date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </h3>
                  </div>
                  {!schedule.is_active && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Неактивен</span>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Clock" size={16} className="text-muted-foreground" />
                    <span>{schedule.start_time.slice(0, 5)} - {schedule.end_time.slice(0, 5)}</span>
                  </div>
                  {schedule.break_start_time && schedule.break_end_time && (
                    <div className="flex items-center gap-2">
                      <Icon name="Coffee" size={16} className="text-muted-foreground" />
                      <span>Перерыв: {schedule.break_start_time.slice(0, 5)} - {schedule.break_end_time.slice(0, 5)}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Icon name="Timer" size={16} className="text-muted-foreground" />
                    <span>Слот: {schedule.slot_duration} мин</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
