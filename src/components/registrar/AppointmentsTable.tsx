import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import Icon from '@/components/ui/icon';

interface AppointmentsTableProps {
  appointments: any[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  onEdit: (appointment: any) => void;
  onCancel: (appointment: any) => void;
  onReschedule: (appointment: any) => void;
  onClone: (appointment: any) => void;
  onOpenPhoto: (url: string) => void;
}

const AppointmentsTable = ({
  appointments,
  searchQuery,
  setSearchQuery,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  onEdit,
  onCancel,
  onReschedule,
  onClone,
  onOpenPhoto
}: AppointmentsTableProps) => {
  const filteredAppointments = appointments.filter((apt: any) => {
    const matchesSearch = searchQuery === '' || 
      apt.patient_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      apt.patient_phone?.includes(searchQuery) ||
      apt.patient_snils?.includes(searchQuery);
    
    const matchesDateFrom = !dateFrom || apt.appointment_date >= dateFrom;
    const matchesDateTo = !dateTo || apt.appointment_date <= dateTo;
    
    return matchesSearch && matchesDateFrom && matchesDateTo;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <Input
          type="text"
          placeholder="Поиск по пациенту, телефону, СНИЛС..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium whitespace-nowrap">Период:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-40"
          />
          <span>—</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата</TableHead>
              <TableHead>Время</TableHead>
              <TableHead>Пациент</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>СНИЛС</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Описание</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAppointments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                  Записей не найдено
                </TableCell>
              </TableRow>
            ) : (
              filteredAppointments.map((apt: any) => (
                <TableRow key={apt.id}>
                  <TableCell>{apt.appointment_date}</TableCell>
                  <TableCell>{apt.appointment_time}</TableCell>
                  <TableCell className="font-medium">{apt.patient_name}</TableCell>
                  <TableCell>{apt.patient_phone}</TableCell>
                  <TableCell>{apt.patient_snils || '—'}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      apt.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                      apt.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      apt.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {apt.status === 'scheduled' ? 'Запланирована' :
                       apt.status === 'completed' ? 'Завершена' :
                       apt.status === 'cancelled' ? 'Отменена' :
                       apt.status}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{apt.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {apt.patient_photo_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onOpenPhoto(apt.patient_photo_url)}
                          title="Посмотреть фото"
                        >
                          <Icon name="Image" size={16} />
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(apt)}
                        title="Редактировать"
                      >
                        <Icon name="Edit" size={16} />
                      </Button>
                      {apt.status === 'scheduled' && (
                        <>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onReschedule(apt)}
                            title="Перенести"
                          >
                            <Icon name="Calendar" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onClone(apt)}
                            title="Копировать"
                          >
                            <Icon name="Copy" size={16} />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onCancel(apt)}
                            className="text-destructive"
                            title="Отменить"
                          >
                            <Icon name="X" size={16} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default AppointmentsTable;
