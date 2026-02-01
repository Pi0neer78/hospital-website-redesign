import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import { AVAILABLE_YEARS } from '@/constants/doctor';
import type { DoctorInfo, SlotStats } from '@/types/doctor';

interface CalendarTabProps {
  doctorInfo: DoctorInfo;
  selectedYear: number;
  setSelectedYear: (year: number) => void;
  calendarData: {[key: string]: {is_working: boolean; note?: string}};
  slotStats: {[key: string]: SlotStats};
  isLoadingSlots: boolean;
  loadingProgress: number;
  toggleCalendarDay: (date: string) => void;
  loadSlotStatsForYear: () => void;
}

export const CalendarTab = ({
  selectedYear,
  setSelectedYear,
  calendarData,
  slotStats,
  isLoadingSlots,
  loadingProgress,
  toggleCalendarDay,
  loadSlotStatsForYear
}: CalendarTabProps) => {
  const [calendarInstructionOpen, setCalendarInstructionOpen] = useState(false);

  return (
    <div className="mt-6">
      <Card className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Icon name="Calendar" size={24} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between cursor-pointer" onClick={() => setCalendarInstructionOpen(!calendarInstructionOpen)}>
                <h3 className="text-base font-bold text-green-900">📅 Инструкция: Годовой календарь работы</h3>
                <Icon 
                  name={calendarInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                  size={20} 
                  className="text-green-600 flex-shrink-0"
                />
              </div>
              
              {calendarInstructionOpen && (
                <div className="space-y-3 text-sm text-green-800 mt-3">
                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="font-semibold mb-1 text-green-900">🎯 Для чего нужен календарь?</p>
                    <p className="text-green-700">
                      Годовой календарь позволяет управлять рабочими и выходными днями на весь год вперёд. 
                      Отмечайте отпуска, праздники и особые дни — пациенты автоматически не увидят эти даты при записи.
                    </p>
                  </div>

                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="font-semibold mb-2 text-green-900">📋 Как работать с календарём:</p>
                    <ul className="list-decimal list-inside space-y-1.5 text-green-700 ml-2">
                      <li><strong>Один клик по дате</strong> — переключает день между рабочим и выходным</li>
                      <li><strong>Зелёная ячейка</strong> — рабочий день, пациенты могут записываться</li>
                      <li><strong>Красная ячейка</strong> — выходной день, записи заблокированы</li>
                      <li><strong>Кнопка "Получить слоты"</strong> — загружает статистику свободных/занятых слотов на 2 месяца</li>
                      <li><strong>Цифры в ячейке</strong> (например, 5/3) — свободных слотов / занятых слотов на этот день</li>
                    </ul>
                  </div>

                  <div className="bg-white/60 p-3 rounded-lg">
                    <p className="font-semibold mb-1 text-green-900">⚡ Важно знать!</p>
                    <p className="text-green-700">
                      <strong>Календарь главнее расписания!</strong> Если вы отметили день как выходной в календаре, 
                      пациенты не смогут записаться, даже если в еженедельном расписании этот день рабочий. 
                      Так вы можете легко блокировать отдельные даты без изменения всего расписания.
                    </p>
                  </div>

                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                    <p className="font-semibold mb-1 text-amber-900">💡 Примеры использования:</p>
                    <div className="text-amber-800 text-xs space-y-1.5">
                      <p><strong>Отпуск:</strong> Кликните по всем датам с 1 по 14 июля — они станут красными, пациенты не увидят эти дни</p>
                      <p><strong>Праздники:</strong> 1 января, 8 марта → отметьте как выходные одним кликом</p>
                      <p><strong>Внеплановый день:</strong> Во вторник 15 мая нужно уехать? Кликните на 15 мая → день закрыт для записи</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-4 text-xs mt-4 pt-3 border-t border-green-200">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-green-200 border-2 border-green-400 rounded shadow-sm"></div>
                  <span className="text-green-900 font-medium">Рабочий день</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 bg-red-200 border-2 border-red-400 rounded shadow-sm"></div>
                  <span className="text-red-900 font-medium">Выходной день</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4 mb-6 items-center">
        <div>
          <label className="text-sm font-medium mb-2 block">Выберите год:</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {AVAILABLE_YEARS.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        <div className="mt-6">
          <Button
            onClick={loadSlotStatsForYear}
            disabled={isLoadingSlots}
            size="lg"
          >
            {isLoadingSlots ? (
              <>
                <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                Загрузка...
              </>
            ) : (
              <>
                <Icon name="BarChart3" size={20} className="mr-2" />
                Получить слоты
              </>
            )}
          </Button>
        </div>
      </div>

      {isLoadingSlots ? (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <div className="w-full max-w-md">
                <p className="text-lg font-semibold text-blue-900">Идет получение данных</p>
                <p className="text-sm text-blue-700 mt-1">Загружаем статистику слотов на текущий и следующий месяц...</p>
                <div className="mt-4">
                  <div className="flex justify-between text-sm text-blue-800 mb-2">
                    <span>Прогресс загрузки</span>
                    <span className="font-bold">{loadingProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full rounded-full transition-all duration-300"
                      style={{ width: `${loadingProgress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }, (_, i) => i).map(monthIndex => {
            const monthName = new Date(selectedYear, monthIndex).toLocaleString('ru-RU', { month: 'long' });
            const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
            const firstDayOfWeek = (new Date(selectedYear, monthIndex, 1).getDay() + 6) % 7;
            
            return (
              <Card key={monthIndex} className="overflow-hidden">
                <CardHeader className="pb-2 pt-3 px-3">
                  <CardTitle className="text-sm capitalize font-semibold">{monthName} {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent className="px-3 pb-3">
                  <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] mb-1">
                    <div className="font-semibold">Пн</div>
                    <div className="font-semibold">Вт</div>
                    <div className="font-semibold">Ср</div>
                    <div className="font-semibold">Чт</div>
                    <div className="font-semibold">Пт</div>
                    <div className="font-semibold text-red-600">Сб</div>
                    <div className="font-semibold text-red-600">Вс</div>
                  </div>
                  <div className="grid grid-cols-7 gap-0.5">
                    {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                      <div key={`empty-${i}`} className="h-8"></div>
                    ))}
                    {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                      const date = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                      const isWorking = calendarData[date]?.is_working ?? true;
                      const dayOfWeek = new Date(selectedYear, monthIndex, day).getDay();
                      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                      const today = new Date().toISOString().split('T')[0];
                      const isToday = date === today;
                      const stats = slotStats[date];
                      
                      return (
                        <button
                          key={day}
                          onClick={() => toggleCalendarDay(date)}
                          className={`h-auto min-h-[32px] text-[10px] rounded transition-all flex flex-col items-center justify-center p-0.5 ${
                            isToday ? 'ring-1 ring-primary' : ''
                          } ${
                            isWorking 
                              ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300' 
                              : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                          } ${
                            isWeekend && isWorking ? 'opacity-70' : ''
                          }`}
                          title={isWorking ? 'Рабочий день (нажмите для выходного)' : 'Выходной (нажмите для рабочего)'}
                        >
                          <span className="font-medium">{day}</span>
                          {stats && (stats.available > 0 || stats.booked > 0) && (
                            <span className="text-[8px] font-semibold mt-0.5">
                              {stats.available}/{stats.booked}
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
