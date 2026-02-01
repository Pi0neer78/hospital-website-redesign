import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Icon from '@/components/ui/icon';

interface DoctorsTabProps {
  doctors: any[];
  doctorForm: any;
  setDoctorForm: (form: any) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  editingDoctor: any;
  setEditingDoctor: (doctor: any) => void;
  isEditOpen: boolean;
  setIsEditOpen: (open: boolean) => void;
  onCreateDoctor: (e: React.FormEvent) => void;
  onUpdateDoctor: (e: React.FormEvent) => void;
  onDeleteDoctor: (id: number) => void;
  onToggleActive: (doctor: any) => void;
  isUploading: boolean;
  isDragging: boolean;
  setIsDragging: (dragging: boolean) => void;
  onUploadPhoto: (file: File, isEdit: boolean) => void;
}

const DoctorsTab = ({
  doctors, doctorForm, setDoctorForm, isOpen, setIsOpen, editingDoctor, setEditingDoctor,
  isEditOpen, setIsEditOpen, onCreateDoctor, onUpdateDoctor, onDeleteDoctor, onToggleActive,
  isUploading, isDragging, setIsDragging, onUploadPhoto
}: DoctorsTabProps) => {
  const handleDrop = (e: React.DragEvent, isEdit: boolean) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      onUploadPhoto(file, isEdit);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Врачи</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" size={18} className="mr-2" />
              Добавить врача
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Новый врач</DialogTitle>
            </DialogHeader>
            <form onSubmit={onCreateDoctor} className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => handleDrop(e, false)}
              >
                {doctorForm.photo_url ? (
                  <img src={doctorForm.photo_url} alt="Preview" className="max-h-40 mx-auto rounded" />
                ) : (
                  <>
                    <Icon name="Upload" size={48} className="mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Перетащите фото или</p>
                    <label className="cursor-pointer text-primary hover:underline">
                      выберите файл
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => e.target.files?.[0] && onUploadPhoto(e.target.files[0], false)}
                      />
                    </label>
                  </>
                )}
              </div>
              <Input placeholder="ФИО" value={doctorForm.full_name} onChange={(e) => setDoctorForm({...doctorForm, full_name: e.target.value})} required />
              <Input placeholder="Телефон" value={doctorForm.phone} onChange={(e) => setDoctorForm({...doctorForm, phone: e.target.value})} required />
              <Input placeholder="Должность" value={doctorForm.position} onChange={(e) => setDoctorForm({...doctorForm, position: e.target.value})} required />
              <Input placeholder="Специализация" value={doctorForm.specialization} onChange={(e) => setDoctorForm({...doctorForm, specialization: e.target.value})} />
              <Select value={doctorForm.clinic} onValueChange={(val) => setDoctorForm({...doctorForm, clinic: val})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Центральная городская поликлиника">Центральная городская поликлиника</SelectItem>
                  <SelectItem value="Детская поликлиника №1">Детская поликлиника №1</SelectItem>
                  <SelectItem value="Городская больница №2">Городская больница №2</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Образование" value={doctorForm.education} onChange={(e) => setDoctorForm({...doctorForm, education: e.target.value})} />
              <Input placeholder="Стаж работы (лет)" value={doctorForm.work_experience} onChange={(e) => setDoctorForm({...doctorForm, work_experience: e.target.value})} />
              <Input placeholder="Номер кабинета" value={doctorForm.office_number} onChange={(e) => setDoctorForm({...doctorForm, office_number: e.target.value})} />
              <Input placeholder="Логин" value={doctorForm.login} onChange={(e) => setDoctorForm({...doctorForm, login: e.target.value})} required />
              <Input type="password" placeholder="Пароль" value={doctorForm.password} onChange={(e) => setDoctorForm({...doctorForm, password: e.target.value})} required />
              <Button type="submit" disabled={isUploading}>Создать</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Фото</TableHead>
            <TableHead>ФИО</TableHead>
            <TableHead>Должность</TableHead>
            <TableHead>Телефон</TableHead>
            <TableHead>Поликлиника</TableHead>
            <TableHead>Статус</TableHead>
            <TableHead className="text-right">Действия</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {doctors.map((doctor) => (
            <TableRow key={doctor.id}>
              <TableCell>
                {doctor.photo_url ? <img src={doctor.photo_url} alt={doctor.full_name} className="w-12 h-12 rounded object-cover" /> : <Icon name="User" size={24} />}
              </TableCell>
              <TableCell>{doctor.full_name}</TableCell>
              <TableCell>{doctor.position}</TableCell>
              <TableCell>{doctor.phone}</TableCell>
              <TableCell>{doctor.clinic}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded text-xs ${doctor.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {doctor.is_active ? 'Активен' : 'Неактивен'}
                </span>
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button size="sm" variant="ghost" onClick={() => onToggleActive(doctor)}>
                  <Icon name={doctor.is_active ? 'EyeOff' : 'Eye'} size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setEditingDoctor(doctor); setIsEditOpen(true); }}>
                  <Icon name="Edit" size={16} />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => onDeleteDoctor(doctor.id)}>
                  <Icon name="Trash2" size={16} />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editingDoctor && (
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Редактировать врача</DialogTitle>
            </DialogHeader>
            <form onSubmit={onUpdateDoctor} className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${isDragging ? 'border-primary bg-primary/10' : 'border-gray-300'}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => handleDrop(e, true)}
              >
                {editingDoctor.photo_url ? (
                  <img src={editingDoctor.photo_url} alt="Preview" className="max-h-40 mx-auto rounded" />
                ) : (
                  <>
                    <Icon name="Upload" size={48} className="mx-auto text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Перетащите фото или</p>
                    <label className="cursor-pointer text-primary hover:underline">
                      выберите файл
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onUploadPhoto(e.target.files[0], true)} />
                    </label>
                  </>
                )}
              </div>
              <Input placeholder="ФИО" value={editingDoctor.full_name} onChange={(e) => setEditingDoctor({...editingDoctor, full_name: e.target.value})} required />
              <Input placeholder="Телефон" value={editingDoctor.phone} onChange={(e) => setEditingDoctor({...editingDoctor, phone: e.target.value})} required />
              <Input placeholder="Должность" value={editingDoctor.position} onChange={(e) => setEditingDoctor({...editingDoctor, position: e.target.value})} required />
              <Input placeholder="Специализация" value={editingDoctor.specialization} onChange={(e) => setEditingDoctor({...editingDoctor, specialization: e.target.value})} />
              <Input placeholder="Образование" value={editingDoctor.education} onChange={(e) => setEditingDoctor({...editingDoctor, education: e.target.value})} />
              <Input placeholder="Стаж" value={editingDoctor.work_experience} onChange={(e) => setEditingDoctor({...editingDoctor, work_experience: e.target.value})} />
              <Input placeholder="Кабинет" value={editingDoctor.office_number} onChange={(e) => setEditingDoctor({...editingDoctor, office_number: e.target.value})} />
              <Button type="submit" disabled={isUploading}>Сохранить</Button>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DoctorsTab;
