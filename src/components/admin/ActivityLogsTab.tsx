import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ActivityLogsTabProps {
  doctorLogs: any[];
  registrarLogs: any[];
  selectedDoctorForLogs: any;
  selectedRegistrarForLogs: any;
  logFilters: {
    type: string;
    text: string;
    dateFrom: string;
    dateTo: string;
  };
  setLogFilters: (filters: any) => void;
  onLoadDoctorLogs: (doctorId?: number) => void;
  onLoadRegistrarLogs: (registrarId?: number) => void;
}

const ActivityLogsTab = ({ doctorLogs, registrarLogs, selectedDoctorForLogs, selectedRegistrarForLogs, logFilters, setLogFilters, onLoadDoctorLogs, onLoadRegistrarLogs }: ActivityLogsTabProps) => {
  return (
    <Tabs defaultValue="registrar">
      <TabsList>
        <TabsTrigger value="registrar">Логи регистраторов</TabsTrigger>
        <TabsTrigger value="doctor">Логи врачей</TabsTrigger>
      </TabsList>
      <TabsContent value="registrar" className="space-y-4">
        <div className="flex gap-4 items-center">
          <Select value={logFilters.type} onValueChange={(val) => setLogFilters({...logFilters, type: val})}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Тип действия" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все действия</SelectItem>
              <SelectItem value="Создание записи">Создание записи</SelectItem>
              <SelectItem value="Редактирование записи">Редактирование</SelectItem>
              <SelectItem value="Отмена записи">Отмена</SelectItem>
              <SelectItem value="Перенос записи">Перенос</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Поиск..." value={logFilters.text} onChange={(e) => setLogFilters({...logFilters, text: e.target.value})} className="w-64" />
          <Input type="date" value={logFilters.dateFrom} onChange={(e) => setLogFilters({...logFilters, dateFrom: e.target.value})} className="w-40" />
          <Input type="date" value={logFilters.dateTo} onChange={(e) => setLogFilters({...logFilters, dateTo: e.target.value})} className="w-40" />
          <Button onClick={() => onLoadRegistrarLogs(selectedRegistrarForLogs?.id)}>Применить</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата/Время</TableHead>
              <TableHead>Регистратор</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {registrarLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(log.timestamp).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{log.registrar_name}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell className="max-w-md truncate">{JSON.stringify(log.details)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
      <TabsContent value="doctor" className="space-y-4">
        <div className="flex gap-4 items-center">
          <Select value={logFilters.type} onValueChange={(val) => setLogFilters({...logFilters, type: val})}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Тип действия" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Все действия</SelectItem>
              <SelectItem value="Завершение приема">Завершение</SelectItem>
              <SelectItem value="Отмена приема">Отмена</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Поиск..." value={logFilters.text} onChange={(e) => setLogFilters({...logFilters, text: e.target.value})} className="w-64" />
          <Input type="date" value={logFilters.dateFrom} onChange={(e) => setLogFilters({...logFilters, dateFrom: e.target.value})} className="w-40" />
          <Input type="date" value={logFilters.dateTo} onChange={(e) => setLogFilters({...logFilters, dateTo: e.target.value})} className="w-40" />
          <Button onClick={() => onLoadDoctorLogs(selectedDoctorForLogs?.id)}>Применить</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Дата/Время</TableHead>
              <TableHead>Врач</TableHead>
              <TableHead>Действие</TableHead>
              <TableHead>Детали</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {doctorLogs.map((log, idx) => (
              <TableRow key={idx}>
                <TableCell>{new Date(log.timestamp).toLocaleString('ru-RU')}</TableCell>
                <TableCell>{log.doctor_name}</TableCell>
                <TableCell>{log.action_type}</TableCell>
                <TableCell className="max-w-md truncate">{JSON.stringify(log.details)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TabsContent>
    </Tabs>
  );
};

export default ActivityLogsTab;
