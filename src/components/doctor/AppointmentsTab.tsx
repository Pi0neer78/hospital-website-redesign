import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';
import type { Appointment, DoctorInfo } from '@/types/doctor';

interface AppointmentsTabProps {
  doctorInfo: DoctorInfo;
  appointments: Appointment[];
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  dateFilterFrom: string;
  setDateFilterFrom: (value: string) => void;
  dateFilterTo: string;
  setDateFilterTo: (value: string) => void;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onExport: () => void;
  onPrint: () => void;
  onCreateNew: () => void;
}

export const AppointmentsTab = ({
  doctorInfo,
  appointments,
  statusFilter,
  setStatusFilter,
  dateFilterFrom,
  setDateFilterFrom,
  dateFilterTo,
  setDateFilterTo,
  searchQuery,
  setSearchQuery,
  onExport,
  onPrint,
  onCreateNew
}: AppointmentsTabProps) => {
  const filteredAppointments = appointments.filter((app: Appointment) => {
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    const dateMatch = app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo;
    const searchMatch = searchQuery === '' || 
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      (app.patient_snils && app.patient_snils.includes(searchQuery)) ||
      (app.patient_oms && app.patient_oms.includes(searchQuery));
    return statusMatch && dateMatch && searchMatch;
  });

  const groupedAppointments = filteredAppointments.reduce((acc: any, app: Appointment) => {
    if (!acc[app.appointment_date]) {
      acc[app.appointment_date] = [];
    }
    acc[app.appointment_date].push(app);
    return acc;
  }, {});

  const scheduledCount = appointments.filter((app: Appointment) => app.status === 'scheduled').length;
  const completedCount = appointments.filter((app: Appointment) => app.status === 'completed').length;
  const cancelledCount = appointments.filter((app: Appointment) => app.status === 'cancelled').length;

  return (
    <div className="mt-6">
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
            <div className="text-3xl font-bold text-red-600">{cancelledCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm font-medium mb-2 block">Поиск</label>
              <Input
                placeholder="ФИО, телефон, СНИЛС, ОМС..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Статус</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border rounded-lg h-10"
              >
                <option value="all">Все</option>
                <option value="scheduled">Запланировано</option>
                <option value="completed">Завершено</option>
                <option value="cancelled">Отменено</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">От</label>
              <Input
                type="date"
                value={dateFilterFrom}
                onChange={(e) => setDateFilterFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">До</label>
              <Input
                type="date"
                value={dateFilterTo}
                onChange={(e) => setDateFilterTo(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold">Записи пациентов</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onExport}>
            <Icon name="FileDown" size={18} className="mr-2" />
            Excel
          </Button>
          <Button variant="outline" onClick={onPrint}>
            <Icon name="Printer" size={18} className="mr-2" />
            Печать
          </Button>
          <Button onClick={onCreateNew}>
            <Icon name="Plus" size={18} className="mr-2" />
            Новая запись
          </Button>
        </div>
      </div>

      {filteredAppointments.length === 0 ? (
        <Card className="bg-muted/30">
          <CardContent className="py-12 text-center">
            <Icon name="Users" size={48} className="mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium text-muted-foreground mb-2">Записей не найдено</p>
            <p className="text-sm text-muted-foreground">Попробуйте изменить фильтры или создать новую запись</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.keys(groupedAppointments)
            .sort((a, b) => a.localeCompare(b))
            .map((date) => {
              const dayAppointments = groupedAppointments[date].sort((a: Appointment, b: Appointment) => 
                a.appointment_time.localeCompare(b.appointment_time)
              );

              return (
                <Card key={date}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Calendar" size={20} />
                      {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                      <span className="text-sm font-normal text-muted-foreground ml-2">
                        ({dayAppointments.length} {dayAppointments.length === 1 ? 'запись' : 'записей'})
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Время</TableHead>
                          <TableHead>Пациент</TableHead>
                          <TableHead>Телефон</TableHead>
                          <TableHead>СНИЛС</TableHead>
                          <TableHead>Статус</TableHead>
                          <TableHead>Действия</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {dayAppointments.map((appointment: Appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell className="font-medium">
                              {appointment.appointment_time.slice(0, 5)}
                            </TableCell>
                            <TableCell>{appointment.patient_name}</TableCell>
                            <TableCell>{appointment.patient_phone}</TableCell>
                            <TableCell>{appointment.patient_snils || '—'}</TableCell>
                            <TableCell>
                              <span className={`px-2 py-1 rounded text-xs font-medium ${
                                appointment.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {appointment.status === 'scheduled' ? 'Запланировано' :
                                 appointment.status === 'completed' ? 'Завершено' :
                                 'Отменено'}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                {appointment.status === 'scheduled' && (
                                  <>
                                    <Button size="sm" variant="outline" title="Завершить приём">
                                      <Icon name="Check" size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" title="Перенести">
                                      <Icon name="Calendar" size={16} />
                                    </Button>
                                    <Button size="sm" variant="outline" title="Отменить">
                                      <Icon name="X" size={16} />
                                    </Button>
                                  </>
                                )}
                                <Button size="sm" variant="outline" title="Клонировать">
                                  <Icon name="Copy" size={16} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
};
