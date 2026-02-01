import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';
import { useDoctorAuth } from '@/hooks/useDoctorAuth';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { useDoctorSchedules } from '@/hooks/useDoctorSchedules';
import { useDoctorAppointments } from '@/hooks/useDoctorAppointments';
import { loadSchedules as apiLoadSchedules, loadCalendar as apiLoadCalendar } from '@/utils/doctorApi';
import { CHECK_INTERVALS } from '@/constants/doctor';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const DoctorNew = () => {
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

  const {
    schedules,
    setSchedules,
    calendarData,
    setCalendarData
  } = useDoctorSchedules(doctorInfo?.id || null);

  const {
    appointments,
    loadAppointments,
    statusFilter,
    setStatusFilter,
    dateFilterFrom,
    setDateFilterFrom,
    dateFilterTo,
    setDateFilterTo,
    searchQuery,
    setSearchQuery,
    filteredAppointments,
    handleUpdateAppointmentStatus
  } = useDoctorAppointments({
    doctorInfo,
    schedules,
    calendarData,
    soundEnabled,
    playNotificationSound
  });

  useEffect(() => {
    if (doctorInfo) {
      apiLoadSchedules(doctorInfo.id).then(data => setSchedules(data));
      apiLoadCalendar(doctorInfo.id, new Date().getFullYear()).then(data => setCalendarData(data));
      loadAppointments(doctorInfo.id);

      if (autoRefreshEnabled) {
        const interval = setInterval(() => {
          loadAppointments(doctorInfo.id, true);
        }, checkInterval * 1000);

        return () => clearInterval(interval);
      }
    }
  }, [doctorInfo, autoRefreshEnabled, checkInterval]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    handleLogin(e, (doctor) => {
      apiLoadSchedules(doctor.id).then(data => setSchedules(data));
      apiLoadCalendar(doctor.id, new Date().getFullYear()).then(data => setCalendarData(data));
      loadAppointments(doctor.id);
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Icon name="Stethoscope" size={28} className="text-primary" />
              Вход для врачей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
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

  const scheduledCount = appointments.filter((app: any) => app.status === 'scheduled').length;
  const completedCount = appointments.filter((app: any) => app.status === 'completed').length;
  const cancelledCount = appointments.filter((app: any) => app.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Stethoscope" size={32} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold">{doctorInfo?.full_name}</h1>
              <p className="text-sm text-muted-foreground">{doctorInfo?.position}</p>
            </div>
          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
              <span className="text-xs font-medium text-gray-700">Автообновление</span>
              <Button
                size="sm"
                variant={autoRefreshEnabled ? "default" : "outline"}
                onClick={toggleAutoRefresh}
                className="h-7 px-2"
              >
                <Icon name={autoRefreshEnabled ? "Pause" : "Play"} size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleSound}
                disabled={!autoRefreshEnabled}
                className="h-7 px-2"
                title={soundEnabled ? "Звук вкл" : "Звук выкл"}
              >
                <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={14} />
              </Button>
              <Dialog>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!autoRefreshEnabled}
                  className="h-7 px-2 text-xs"
                >
                  {checkInterval}с
                </Button>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Интервал проверки</DialogTitle>
                    <DialogDescription>
                      Выберите как часто проверять наличие новых записей
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {CHECK_INTERVALS.map((seconds) => (
                      <Button
                        key={seconds}
                        variant={checkInterval === seconds ? 'default' : 'outline'}
                        onClick={() => changeCheckInterval(seconds)}
                        className="h-16 flex flex-col"
                      >
                        <span className="text-2xl font-bold">{seconds}</span>
                        <span className="text-xs">секунд</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => doctorInfo && loadAppointments(doctorInfo.id)}
                className="h-7 px-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
                title="Обновить записи вручную"
              >
                <Icon name="RefreshCw" size={14} />
              </Button>
            </div>
            <Button variant="default" asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/doctor-guide">
                <Icon name="BookOpen" size={18} className="mr-2" />
                Инструкция
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </a>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <section className="pb-12">
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Запланировано</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{scheduledCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Завершено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">Отменено</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{cancelledCount}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Записи пациентов ({filteredAppointments.length})</CardTitle>
                <div className="flex gap-2 items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-1.5 border rounded-lg text-sm"
                  >
                    <option value="all">Все статусы</option>
                    <option value="scheduled">Запланировано</option>
                    <option value="completed">Завершено</option>
                    <option value="cancelled">Отменено</option>
                  </select>
                  <Input
                    type="date"
                    value={dateFilterFrom}
                    onChange={(e) => setDateFilterFrom(e.target.value)}
                    className="w-[150px] h-9"
                  />
                  <Input
                    type="date"
                    value={dateFilterTo}
                    onChange={(e) => setDateFilterTo(e.target.value)}
                    className="w-[150px] h-9"
                  />
                  <Input
                    placeholder="Поиск..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[200px] h-9"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredAppointments.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Записей не найдено
                  </div>
                ) : (
                  filteredAppointments
                    .sort((a: any, b: any) => {
                      const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
                      if (dateCompare !== 0) return dateCompare;
                      return a.appointment_time.localeCompare(b.appointment_time);
                    })
                    .map((app: any) => (
                      <Card key={app.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-medium">
                                {new Date(app.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                                  day: 'numeric', 
                                  month: 'long',
                                  weekday: 'short'
                                })}
                              </div>
                              <div className="text-sm font-bold">{app.appointment_time.slice(0, 5)}</div>
                              <div className="font-semibold">{app.patient_name}</div>
                              <div className="text-sm text-muted-foreground">{app.patient_phone}</div>
                              {app.patient_snils && (
                                <div className="text-sm text-muted-foreground">СНИЛС: {app.patient_snils}</div>
                              )}
                            </div>
                            {app.description && (
                              <div className="text-sm text-muted-foreground mt-1">{app.description}</div>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              app.status === 'scheduled' 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : app.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {app.status === 'scheduled' ? 'Запланировано' : 
                               app.status === 'completed' ? 'Завершено' : 'Отменено'}
                            </span>
                            {app.status === 'scheduled' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="default"
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'completed', app.description, app)}
                                  className="bg-green-600 hover:bg-green-700"
                                >
                                  <Icon name="Check" size={16} className="mr-1" />
                                  Завершить
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleUpdateAppointmentStatus(app.id, 'cancelled', app.description, app)}
                                >
                                  <Icon name="X" size={16} className="mr-1" />
                                  Отменить
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default DoctorNew;
