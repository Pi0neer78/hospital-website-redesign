import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface RegistrarsTabProps {
  registrars: any[];
  registrarForm: any;
  setRegistrarForm: (form: any) => void;
  isRegistrarOpen: boolean;
  setIsRegistrarOpen: (open: boolean) => void;
  editingRegistrar: any;
  setEditingRegistrar: (registrar: any) => void;
  isRegistrarEditOpen: boolean;
  setIsRegistrarEditOpen: (open: boolean) => void;
  onCreateRegistrar: (e: React.FormEvent) => void;
  onUpdateRegistrar: (e: React.FormEvent) => void;
  onDeleteRegistrar: (id: number) => void;
  onViewLogs: (registrar: any) => void;
}

const RegistrarsTab = ({
  registrars, registrarForm, setRegistrarForm, isRegistrarOpen, setIsRegistrarOpen,
  editingRegistrar, setEditingRegistrar, isRegistrarEditOpen, setIsRegistrarEditOpen,
  onCreateRegistrar, onUpdateRegistrar, onDeleteRegistrar, onViewLogs
}: RegistrarsTabProps) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Регистраторы</h2>
        <Dialog open={isRegistrarOpen} onOpenChange={setIsRegistrarOpen}>
          <DialogTrigger asChild>
            <Button><Icon name="Plus" size={18} className="mr-2" />Добавить регистратора</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>Новый регистратор</DialogTitle></DialogHeader>
            <form onSubmit={onCreateRegistrar} className="space-y-4">
              <Input placeholder="ФИО" value={registrarForm.full_name} onChange={(e) => setRegistrarForm({...registrarForm, full_name: e.target.value})} required />
              <Input placeholder="Телефон" value={registrarForm.phone} onChange={(e) => setRegistrarForm({...registrarForm, phone: e.target.value})} required />
              <Select value={registrarForm.clinic} onValueChange={(val) => setRegistrarForm({...registrarForm, clinic: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Центральная городская поликлиника">Центральная городская поликлиника</SelectItem>
                  <SelectItem value="Детская поликлиника №1">Детская поликлиника №1</SelectItem>
                  <SelectItem value="Городская больница №2">Городская больница №2</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Логин" value={registrarForm.login} onChange={(e) => setRegistrarForm({...registrarForm, login: e.target.value})} required />
              <Input type="password" placeholder="Пароль" value={registrarForm.password} onChange={(e) => setRegistrarForm({...registrarForm, password: e.target.value})} required />
              <Button type="submit">Создать</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>ФИО</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Поликлиника</TableHead>
            <TableHead>Логин</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {registrars.map((registrar) => (
            <TableRow key={registrar.id}>
              <TableCell>{registrar.full_name}</TableCell>
              <TableCell>{registrar.phone}</TableCell>
              <TableCell>{registrar.clinic}</TableCell>
              <TableCell>{registrar.login}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => onViewLogs(registrar)}>
                  <Icon name="FileText" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingRegistrar(registrar); setIsRegistrarEditOpen(true); }}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteRegistrar(registrar.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingRegistrar && (
        <Dialog open={isRegistrarEditOpen} onOpenChange={setIsRegistrarEditOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Редактировать регистратора</DialogTitle></DialogHeader>
            <form onSubmit={onUpdateRegistrar} className="space-y-4">
              <Input placeholder="ФИО" value={editingRegistrar.full_name} onChange={(e) => setEditingRegistrar({...editingRegistrar, full_name: e.target.value})} required />
              <Input placeholder="Телефон" value={editingRegistrar.phone} onChange={(e) => setEditingRegistrar({...editingRegistrar, phone: e.target.value})} required />
              <Input placeholder="Логин" value={editingRegistrar.login} onChange={(e) => setEditingRegistrar({...editingRegistrar, login: e.target.value})} required />
              <Input type="password" placeholder="Новый пароль (оставьте пустым, чтобы не менять)" value={editingRegistrar.password || ''} onChange={(e) => setEditingRegistrar({...editingRegistrar, password: e.target.value})} />
              <Button type="submit">Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default RegistrarsTab;
