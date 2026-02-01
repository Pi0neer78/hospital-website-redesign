import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import DoctorHeaderComponent from '@/components/doctor/DoctorHeaderComponent';
import { CalendarTab } from '@/components/doctor/CalendarTab';
import { ScheduleTab } from '@/components/doctor/ScheduleTab';
import { AppointmentsTab } from '@/components/doctor/AppointmentsTab';
import { API_URLS } from '@/constants/doctor';
import type { SlotStats, Schedule, DailySchedule, Appointment } from '@/types/doctor';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';

const DoctorNew = () => {
  const { toast } = useToast();
  const {
    isAuthenticated,
    doctorInfo,
    loginForm,
    setLoginForm,
    handleLogin,
    handleLogout
  } = useDoctorAuth();

  const {
    autoRefreshEnabled,
    soundEnabled,
    checkInterval,
    toggleAutoRefresh,
    toggleSound,
    changeCheckInterval,
    playNotificationSound
  } = useAutoRefresh();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<{[key: string]: {is_working: boolean, note?: string}}>({});
  const [slotStats, setSlotStats] = useState<{[key: string]: SlotStats}>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterFrom, setDateFilterFrom] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dateFilterTo, setDateFilterTo] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const lastAppointmentIdsRef = useRef<Set<number>>(new Set());

  const loadCalendar = async (doctorId: number, year: number) => {
    try {
      const response = await fetch(`${API_URLS.schedules}?action=calendar&doctor_id=${doctorId}&year=${year}`);
      const data = await response.json();
      const calendarMap: {[key: string]: {is_working: boolean, note?: string}} = {};
      (data.calendar || []).forEach((day: any) => {
        calendarMap[day.calendar_date] = {
          is_working: day.is_working,
          note: day.note
        };
      });
      setCalendarData(calendarMap);
    } catch (error) {
      console.error('Failed to load calendar:', error);
    }
  };

  const toggleCalendarDay = async (date: string) => {
    if (!doctorInfo) return;
    
    const currentStatus = calendarData[date]?.is_working ?? true;
    const newStatus = !currentStatus;
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calendar',
          doctor_id: doctorInfo.id,
          calendar_date: date,
          is_working: newStatus
        })
      });
      
      if (response.ok) {
        await loadCalendar(doctorInfo.id, selectedYear);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить календарь", variant: "destructive" });
    }
  };

  const loadSlotStatsForYear = async () => {
    if (!doctorInfo) return;
    
    setIsLoadingSlots(true);
    setLoadingProgress(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 2, 0);
    
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const totalDays = dates.length;
    
    for (let i = 0; i < dates.length; i++) {
      const dateStr = dates[i];
      
      try {
        const response = await fetch(
          `${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${dateStr}`
        );
        const data = await response.json();
        
        const availableSlots = data.available_slots?.length || 0;
        const allSlots = data.all_slots?.length || 0;
        const bookedSlots = allSlots - availableSlots;
        
        setSlotStats(prev => ({
          ...prev,
          [dateStr]: {
            available: availableSlots,
            booked: bookedSlots
          }
        }));
      } catch (error) {
        setSlotStats(prev => ({
          ...prev,
          [dateStr]: { available: 0, booked: 0 }
        }));
      }
      
      const progress = Math.round(((i + 1) / totalDays) * 100);
      setLoadingProgress(progress);
    }
    
    setIsLoadingSlots(false);
    setLoadingProgress(0);
    
    toast({
      title: "Готово",
      description: `Загружена статистика слотов на ${totalDays} дней`,
    });
  };

  const loadSchedules = async (doctorId: number) => {
    try {
      const response = await fetch(`${API_URLS.schedules}?doctor_id=${doctorId}`);
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить расписание", variant: "destructive" });
    }
  };

  const loadDailySchedules = async (doctorId: number) => {
    try {
      const today = new Date();
      const twoMonthsLater = new Date(today);
      twoMonthsLater.setMonth(today.getMonth() + 2);
      
      const response = await fetch(`${API_URLS.schedules}?action=daily&doctor_id=${doctorId}&start_date=${today.toISOString().split('T')[0]}&end_date=${twoMonthsLater.toISOString().split('T')[0]}`);
      const data = await response.json();
      setDailySchedules(data.daily_schedules || []);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить ежедневное расписание", variant: "destructive" });
    }
  };

  const loadAppointments = async (doctorId: number, checkForNew = false) => {
    try {
      const startDate = dateFilterFrom || new Date().toISOString().split('T')[0];
      const endDate = dateFilterTo || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const response = await fetch(`${API_URLS.appointments}?doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();
      const newAppointments = data.appointments || [];
      
      if (checkForNew && lastAppointmentIdsRef.current.size > 0) {
        const addedAppointments = newAppointments.filter((a: any) => !lastAppointmentIdsRef.current.has(a.id));
        
        if (addedAppointments.length > 0 && soundEnabled) {
          playNotificationSound();
          
          const latestAppointment = addedAppointments[addedAppointments.length - 1];
          const appointmentDate = new Date(latestAppointment.appointment_date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            weekday: 'short'
          });
          const appointmentTime = latestAppointment.appointment_time.slice(0, 5);
          const phoneNumber = latestAppointment.patient_phone || 'не указан';
          
          let description = `Пациент: ${latestAppointment.patient_name}\nТелефон: ${phoneNumber}\nДата: ${appointmentDate} в ${appointmentTime}`;
          if (latestAppointment.description) {
            description += `\nОписание: ${latestAppointment.description}`;
          }
          
          toast({
            title: "🔔 Новая запись на прием!",
            description: description,
            duration: 10000,
          });
        }
      }
      
      setAppointments(newAppointments);
      lastAppointmentIdsRef.current = new Set(newAppointments.map((a: any) => a.id));
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить записи", variant: "destructive" });
    }
  };

  const exportToExcel = () => {
    const filtered = appointments.filter((app: Appointment) => {
      const statusMatch = statusFilter === 'all' || app.status === statusFilter;
      const dateMatch = app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo;
      const searchMatch = searchQuery === '' || 
        app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.patient_phone.includes(searchQuery) ||
        (app.patient_snils && app.patient_snils.includes(searchQuery));
      return statusMatch && dateMatch && searchMatch;
    });

    const dataForExport = filtered
      .sort((a: Appointment, b: Appointment) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      })
      .map((app: Appointment) => ({
        'ID записи': app.id,
        'Дата': new Date(app.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        'Время записи': app.appointment_time.slice(0, 5),
        'ФИО пациента': app.patient_name,
        'Телефон': app.patient_phone,
        'СНИЛС': app.patient_snils || '—',
        'Статус': app.status === 'scheduled' ? 'Запланировано' : 
                  app.status === 'completed' ? 'Завершено' : 'Отменено',
      }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Записи пациентов');

    const fileName = `Записи_${doctorInfo?.full_name}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Экспорт завершен",
      description: `Экспортировано записей: ${dataForExport.length}`,
    });
  };

  const printAppointments = () => {
    toast({ title: "Печать", description: "Функция печати в разработке" });
  };

  const createNewAppointment = () => {
    toast({ title: "Создание записи", description: "Функция создания записи в разработке" });
  };

  useEffect(() => {
    if (doctorInfo && selectedYear) {
      loadCalendar(doctorInfo.id, selectedYear);
    }
  }, [selectedYear, doctorInfo]);

  useEffect(() => {
    if (doctorInfo) {
      loadSchedules(doctorInfo.id);
      loadDailySchedules(doctorInfo.id);
      loadAppointments(doctorInfo.id);

      if (autoRefreshEnabled) {
        const interval = setInterval(() => {
          loadAppointments(doctorInfo.id, true);
        }, checkInterval * 1000);
        
        return () => clearInterval(interval);
      }
    }
  }, [doctorInfo, autoRefreshEnabled, checkInterval, dateFilterFrom, dateFilterTo]);

  const onLoginSuccess = (doctor: any) => {
    loadCalendar(doctor.id, selectedYear);
    loadSchedules(doctor.id);
    loadDailySchedules(doctor.id);
    loadAppointments(doctor.id);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Icon name="Stethoscope" size={28} className="text-primary" />
              Вход для врачей (NEW)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => handleLogin(e, onLoginSuccess)} className="space-y-4">
              <Input
                placeholder="Логин"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                required
              />
              <Input
                type="password"
                placeholder="Пароль"
                value={loginForm.password}
                onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                required
              />
              <Button type="submit" className="w-full">Войти</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <DoctorHeaderComponent
        doctorInfo={doctorInfo}
        autoRefreshEnabled={autoRefreshEnabled}
        soundEnabled={soundEnabled}
        checkInterval={checkInterval}
        toggleAutoRefresh={toggleAutoRefresh}
        toggleSound={toggleSound}
        changeCheckInterval={changeCheckInterval}
        handleLogout={handleLogout}
        loadAppointments={loadAppointments}
      />

      <Tabs defaultValue="calendar">
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-3">
            <TabsList className="grid w-full grid-cols-3 h-auto p-1 bg-gradient-to-r from-blue-50 to-indigo-50">
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
              >
                <Icon name="Calendar" size={18} className="mr-1.5" />
                Календарь
              </TabsTrigger>
              <TabsTrigger 
                value="schedule"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
              >
                <Icon name="Clock" size={18} className="mr-1.5" />
                Расписание
              </TabsTrigger>
              <TabsTrigger 
                value="appointments"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
              >
                <Icon name="Users" size={18} className="mr-1.5" />
                Записи пациентов
              </TabsTrigger>
            </TabsList>
          </div>
        </div>

        <section className="pb-12">
          <div className="container mx-auto px-4">
            <TabsContent value="calendar">
              <CalendarTab
                doctorInfo={doctorInfo!}
                selectedYear={selectedYear}
                setSelectedYear={setSelectedYear}
                calendarData={calendarData}
                slotStats={slotStats}
                isLoadingSlots={isLoadingSlots}
                loadingProgress={loadingProgress}
                toggleCalendarDay={toggleCalendarDay}
                loadSlotStatsForYear={loadSlotStatsForYear}
              />
            </TabsContent>

            <TabsContent value="schedule">
              <ScheduleTab
                doctorInfo={doctorInfo!}
                schedules={schedules}
                dailySchedules={dailySchedules}
                onReload={() => {
                  loadSchedules(doctorInfo!.id);
                  loadDailySchedules(doctorInfo!.id);
                }}
              />
            </TabsContent>

            <TabsContent value="appointments">
              <AppointmentsTab
                doctorInfo={doctorInfo!}
                appointments={appointments}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                dateFilterFrom={dateFilterFrom}
                setDateFilterFrom={setDateFilterFrom}
                dateFilterTo={dateFilterTo}
                setDateFilterTo={setDateFilterTo}
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onExport={exportToExcel}
                onPrint={printAppointments}
                onCreateNew={createNewAppointment}
              />
            </TabsContent>
          </div>
        </section>
      </Tabs>
    </div>
  );
};

export default DoctorNew;