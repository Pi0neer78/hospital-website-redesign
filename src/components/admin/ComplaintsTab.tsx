import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ComplaintsTabProps {
  complaints: any[];
  dateFrom: string;
  setDateFrom: (date: string) => void;
  dateTo: string;
  setDateTo: (date: string) => void;
  onResolveComplaint: (id: number) => void;
}

const ComplaintsTab = ({ complaints, dateFrom, setDateFrom, dateTo, setDateTo, onResolveComplaint }: ComplaintsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center">
        <h2 className="text-2xl font-bold">Жалобы</h2>
        <div className="flex items-center gap-2">
          <label className="text-sm">Период:</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="w-40" />
          <span>—</span>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="w-40" />
        </div>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Дата</TableHead>
            <TableHead>Пользователь</TableHead>
            <TableHead>Тема</TableHead>
            <TableHead>Описание</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {complaints.map((complaint) => (
            <TableRow key={complaint.id}>
              <TableCell>{new Date(complaint.created_at).toLocaleDateString('ru-RU')}</TableCell>
              <TableCell>{complaint.user_name}</TableCell>
              <TableCell>{complaint.subject}</TableCell>
              <TableCell className="max-w-md truncate">{complaint.description}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${complaint.status === 'resolved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                  {complaint.status === 'resolved' ? 'Решена' : 'Новая'}
                </span>
              </TableCell>
              <TableCell className="text-right">
                {complaint.status !== 'resolved' && (
                  <Button size="sm" onClick={() => onResolveComplaint(complaint.id)}>Решить</Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ComplaintsTab;
