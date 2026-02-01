import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688';

export const useAdminDoctors = (onDoctorsChange?: () => void) => {
  const { toast } = useToast();
  
  const [doctors, setDoctors] = useState<any[]>([]);
  const [doctorForm, setDoctorForm] = useState({
    full_name: '',
    phone: '',
    position: '',
    specialization: '',
    login: '',
    password: '',
    photo_url: '',
    clinic: 'Центральная городская поликлиника',
    education: '',
    work_experience: '',
    office_number: ''
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleCreateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doctorForm),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Врач добавлен" });
        setIsOpen(false);
        setDoctorForm({
          full_name: '',
          phone: '',
          position: '',
          specialization: '',
          login: '',
          password: '',
          photo_url: '',
          clinic: 'Центральная городская поликлиника',
          education: '',
          work_experience: '',
          office_number: ''
        });
        if (onDoctorsChange) onDoctorsChange();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить врача", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleUpdateDoctor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingDoctor.id, ...editingDoctor }),
      });

      if (response.ok) {
        toast({ title: "Успешно", description: "Данные обновлены" });
        setIsEditOpen(false);
        setEditingDoctor(null);
        if (onDoctorsChange) onDoctorsChange();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleDeleteDoctor = async (id: number) => {
    if (!confirm('Удалить врача?')) return;
    
    try {
      const response = await fetch(`${API_URL}?id=${id}`, { method: 'DELETE' });
      
      if (response.ok) {
        toast({ title: "Успешно", description: "Врач удален" });
        if (onDoctorsChange) onDoctorsChange();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleToggleActive = async (doctor: any) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: doctor.id, is_active: !doctor.is_active }),
      });

      if (response.ok) {
        toast({ 
          title: "Успешно", 
          description: doctor.is_active ? "Врач деактивирован" : "Врач активирован" 
        });
        if (onDoctorsChange) onDoctorsChange();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleUploadPhoto = async (file: File, isEdit: boolean = false) => {
    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('https://functions.poehali.dev/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok && data.url) {
        if (isEdit) {
          setEditingDoctor({ ...editingDoctor, photo_url: data.url });
        } else {
          setDoctorForm({ ...doctorForm, photo_url: data.url });
        }
        toast({ title: "Успешно", description: "Фото загружено" });
      } else {
        toast({ title: "Ошибка", description: "Не удалось загрузить фото", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с загрузкой", variant: "destructive" });
    } finally {
      setIsUploading(false);
      setIsDragging(false);
    }
  };

  return {
    doctors,
    setDoctors,
    doctorForm,
    setDoctorForm,
    isOpen,
    setIsOpen,
    editingDoctor,
    setEditingDoctor,
    isEditOpen,
    setIsEditOpen,
    isUploading,
    isDragging,
    setIsDragging,
    handleCreateDoctor,
    handleUpdateDoctor,
    handleDeleteDoctor,
    handleToggleActive,
    handleUploadPhoto
  };
};
