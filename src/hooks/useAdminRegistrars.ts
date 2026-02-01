import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/bda47195-c96f-4fb7-b72c-59d877add3c2';

export const useAdminRegistrars = (onRegistrarsChange?: () => void) => {
  const { toast } = useToast();
  
  const [registrars, setRegistrars] = useState<any[]>([]);
  const [registrarForm, setRegistrarForm] = useState({
    full_name: '',
    phone: '',
    login: '',
    password: '',
    clinic: 'Центральная городская поликлиника'
  });
  const [isRegistrarOpen, setIsRegistrarOpen] = useState(false);
  const [editingRegistrar, setEditingRegistrar] = useState<any>(null);
  const [isRegistrarEditOpen, setIsRegistrarEditOpen] = useState(false);

  const handleCreateRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', ...registrarForm }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Регистратор добавлен" });
        setIsRegistrarOpen(false);
        setRegistrarForm({
          full_name: '',
          phone: '',
          login: '',
          password: '',
          clinic: 'Центральная городская поликлиника'
        });
        if (onRegistrarsChange) onRegistrarsChange();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось добавить регистратора", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleUpdateRegistrar = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: editingRegistrar.id, ...editingRegistrar }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Данные обновлены" });
        setIsRegistrarEditOpen(false);
        setEditingRegistrar(null);
        if (onRegistrarsChange) onRegistrarsChange();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось обновить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleDeleteRegistrar = async (id: number) => {
    if (!confirm('Удалить регистратора?')) return;
    
    try {
      const response = await fetch(`${API_URL}?action=delete&id=${id}`, { method: 'DELETE' });
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Регистратор удален" });
        if (onRegistrarsChange) onRegistrarsChange();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  return {
    registrars,
    setRegistrars,
    registrarForm,
    setRegistrarForm,
    isRegistrarOpen,
    setIsRegistrarOpen,
    editingRegistrar,
    setEditingRegistrar,
    isRegistrarEditOpen,
    setIsRegistrarEditOpen,
    handleCreateRegistrar,
    handleUpdateRegistrar,
    handleDeleteRegistrar
  };
};
