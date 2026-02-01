import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { checkSlotAvailability, showSlotErrorDialog } from '@/utils/slotChecker';

const API_URL = 'https://functions.poehali.dev/a7f148cd-e1c2-40e3-9762-cc8b2bc2dffb';
const REGISTRARS_API = 'https://functions.poehali.dev/bda47195-c96f-4fb7-b72c-59d877add3c2';

interface UseRegistrarAppointmentsProps {
  selectedDoctor: any;
  schedules: any[];
  calendarData: {[key: string]: {is_working: boolean}};
  registrarInfo: any;
}

export const useRegistrarAppointments = ({ selectedDoctor, schedules, calendarData, registrarInfo }: UseRegistrarAppointmentsProps) => {
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  const [newAppointmentDialog, setNewAppointmentDialog] = useState({
    open: false,
    patientName: '',
    patientPhone: '',
    patientSnils: '',
    patientOms: '',
    description: '',
    time: ''
  });
  
  const [editDialog, setEditDialog] = useState<any>(null);
  const [cancelDialog, setCancelDialog] = useState<any>(null);
  
  const [rescheduleDialog, setRescheduleDialog] = useState<any>(null);
  const [rescheduleAvailableDates, setRescheduleAvailableDates] = useState<any[]>([]);
  const [rescheduleSelectedDate, setRescheduleSelectedDate] = useState<string>('');
  const [rescheduleAvailableSlots, setRescheduleAvailableSlots] = useState<string[]>([]);
  const [rescheduleSelectedSlot, setRescheduleSelectedSlot] = useState<string>('');
  const [rescheduleConfirmDialog, setRescheduleConfirmDialog] = useState<{open: boolean, data: any}>({open: false, data: null});
  const [rescheduleSuccessDialog, setRescheduleSuccessDialog] = useState<{open: boolean, data: any}>({open: false, data: null});
  
  const [cloneDialog, setCloneDialog] = useState<any>(null);
  const [cloneAvailableDates, setCloneAvailableDates] = useState<any[]>([]);
  const [cloneSelectedDate, setCloneSelectedDate] = useState<string>('');
  const [cloneAvailableSlots, setCloneAvailableSlots] = useState<string[]>([]);
  const [cloneSelectedSlot, setCloneSelectedSlot] = useState<string>('');

  const logAction = async (actionType: string, details: any) => {
    try {
      await fetch(REGISTRARS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registrar_id: registrarInfo?.id,
          action_type: actionType,
          details: JSON.stringify(details),
          timestamp: new Date().toISOString()
        }),
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const loadAppointments = async (doctorId: number) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      const endDateStr = endDate.toISOString().split('T')[0];
      
      const response = await fetch(`${API_URL}?doctor_id=${doctorId}&start_date=${today}&end_date=${endDateStr}`);
      const data = await response.json();
      setAppointments(data.appointments || []);
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить записи", variant: "destructive" });
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent, selectedDate: string) => {
    e.preventDefault();
    
    if (!newAppointmentDialog.patientName || !newAppointmentDialog.patientPhone || !newAppointmentDialog.time || !selectedDate) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URL,
      selectedDoctor.id,
      selectedDate,
      newAppointmentDialog.time
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          patient_name: newAppointmentDialog.patientName,
          patient_phone: newAppointmentDialog.patientPhone,
          patient_snils: newAppointmentDialog.patientSnils,
          patient_oms: newAppointmentDialog.patientOms,
          appointment_date: selectedDate,
          appointment_time: newAppointmentDialog.time,
          description: newAppointmentDialog.description,
          status: 'scheduled'
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await logAction('Создание записи', {
          patient_name: newAppointmentDialog.patientName,
          patient_phone: newAppointmentDialog.patientPhone,
          patient_snils: newAppointmentDialog.patientSnils,
          doctor_name: selectedDoctor.full_name,
          appointment_date: selectedDate,
          appointment_time: newAppointmentDialog.time,
          description: newAppointmentDialog.description
        });

        toast({ 
          title: "Успешно", 
          description: `Пациент ${newAppointmentDialog.patientName} записан` 
        });
        setNewAppointmentDialog({
          open: false,
          patientName: '',
          patientPhone: '',
          patientSnils: '',
          patientOms: '',
          description: '',
          time: ''
        });
        loadAppointments(selectedDoctor.id);
        return true;
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось создать запись", variant: "destructive" });
        return false;
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
      return false;
    }
  };

  const handleEditAppointment = async (appointmentId: number, updates: any) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          ...updates
        }),
      });

      if (response.ok) {
        await logAction('Редактирование записи', {
          appointment_id: appointmentId,
          ...updates
        });

        toast({ title: "Успешно", description: "Запись обновлена" });
        loadAppointments(selectedDoctor.id);
        setEditDialog(null);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCancelAppointment = async (appointmentId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: appointmentId,
          status: 'cancelled'
        }),
      });

      if (response.ok) {
        await logAction('Отмена записи', {
          appointment_id: cancelDialog.id,
          patient_name: cancelDialog.patient_name,
          patient_phone: cancelDialog.patient_phone,
          patient_snils: cancelDialog.patient_snils,
          doctor_name: selectedDoctor.full_name,
          appointment_date: cancelDialog.appointment_date,
          appointment_time: cancelDialog.appointment_time,
          description: cancelDialog.description
        });

        toast({ title: "Успешно", description: "Запись отменена" });
        loadAppointments(selectedDoctor.id);
        setCancelDialog(null);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const generateDates = () => {
    const dates = [];
    for (let i = 0; i <= 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = (date.getDay() + 6) % 7;
      
      const hasSchedule = schedules.some((s: any) => s.day_of_week === dayOfWeek && s.is_active);
      const calendarOverride = calendarData[dateStr];
      const isWorking = calendarOverride !== undefined ? calendarOverride.is_working : hasSchedule;
      
      dates.push({
        date: dateStr,
        label: date.toLocaleDateString('ru-RU', { 
          weekday: 'short', 
          day: 'numeric', 
          month: 'short' 
        }),
        isWorking,
      });
    }
    return dates;
  };

  const loadSlots = async (date: string, doctorId: number) => {
    try {
      const response = await fetch(`${API_URL}?action=available-slots&doctor_id=${doctorId}&date=${date}`);
      const data = await response.json();
      return data.available_slots || [];
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось загрузить слоты", variant: "destructive" });
      return [];
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleSelectedDate || !rescheduleSelectedSlot) {
      toast({ title: "Ошибка", description: "Выберите дату и время", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URL,
      rescheduleDialog.doctor_id,
      rescheduleSelectedDate,
      rescheduleSelectedSlot
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck);
      return;
    }

    setRescheduleConfirmDialog({
      open: true,
      data: {
        ...rescheduleDialog,
        new_date: rescheduleSelectedDate,
        new_time: rescheduleSelectedSlot
      }
    });
  };

  const confirmReschedule = async () => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rescheduleDialog.id,
          appointment_date: rescheduleSelectedDate,
          appointment_time: rescheduleSelectedSlot
        }),
      });

      if (response.ok) {
        await logAction('Перенос записи', {
          appointment_id: rescheduleDialog.id,
          old_date: rescheduleDialog.appointment_date,
          old_time: rescheduleDialog.appointment_time,
          new_date: rescheduleSelectedDate,
          new_time: rescheduleSelectedSlot
        });

        setRescheduleConfirmDialog({open: false, data: null});
        setRescheduleSuccessDialog({
          open: true,
          data: {
            patient_name: rescheduleDialog.patient_name,
            new_date: rescheduleSelectedDate,
            new_time: rescheduleSelectedSlot
          }
        });
        loadAppointments(selectedDoctor.id);
        setRescheduleDialog(null);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCloneAppointment = async () => {
    if (!cloneSelectedDate || !cloneSelectedSlot) {
      toast({ title: "Ошибка", description: "Выберите дату и время", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URL,
      cloneDialog.doctor_id,
      cloneSelectedDate,
      cloneSelectedSlot
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck);
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: cloneDialog.doctor_id,
          patient_name: cloneDialog.patient_name,
          patient_phone: cloneDialog.patient_phone,
          patient_snils: cloneDialog.patient_snils,
          patient_oms: cloneDialog.patient_oms,
          appointment_date: cloneSelectedDate,
          appointment_time: cloneSelectedSlot,
          description: cloneDialog.description,
          status: 'scheduled'
        }),
      });

      if (response.ok) {
        await logAction('Клонирование записи', {
          original_appointment_id: cloneDialog.id,
          patient_name: cloneDialog.patient_name,
          new_date: cloneSelectedDate,
          new_time: cloneSelectedSlot
        });

        toast({ title: "Успешно", description: "Запись скопирована" });
        loadAppointments(selectedDoctor.id);
        setCloneDialog(null);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const openRescheduleDialog = (appointment: any) => {
    setRescheduleDialog(appointment);
    setRescheduleSelectedDate('');
    setRescheduleSelectedSlot('');
    setRescheduleAvailableDates(generateDates());
  };

  const openCloneDialog = (appointment: any) => {
    setCloneDialog(appointment);
    setCloneSelectedDate('');
    setCloneSelectedSlot('');
    setCloneAvailableDates(generateDates());
  };

  const loadRescheduleSlots = async (date: string) => {
    if (!rescheduleDialog) return;
    const slots = await loadSlots(date, rescheduleDialog.doctor_id);
    setRescheduleAvailableSlots(slots);
  };

  const loadCloneSlots = async (date: string) => {
    if (!cloneDialog) return;
    const slots = await loadSlots(date, cloneDialog.doctor_id);
    setCloneAvailableSlots(slots);
  };

  return {
    appointments,
    searchQuery,
    setSearchQuery,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    newAppointmentDialog,
    setNewAppointmentDialog,
    editDialog,
    setEditDialog,
    cancelDialog,
    setCancelDialog,
    rescheduleDialog,
    rescheduleAvailableDates,
    rescheduleSelectedDate,
    setRescheduleSelectedDate,
    rescheduleAvailableSlots,
    rescheduleSelectedSlot,
    setRescheduleSelectedSlot,
    rescheduleConfirmDialog,
    setRescheduleConfirmDialog,
    rescheduleSuccessDialog,
    setRescheduleSuccessDialog,
    cloneDialog,
    cloneAvailableDates,
    cloneSelectedDate,
    setCloneSelectedDate,
    cloneAvailableSlots,
    cloneSelectedSlot,
    setCloneSelectedSlot,
    loadAppointments,
    handleCreateAppointment,
    handleEditAppointment,
    handleCancelAppointment,
    handleRescheduleAppointment,
    confirmReschedule,
    handleCloneAppointment,
    openRescheduleDialog,
    openCloneDialog,
    loadRescheduleSlots,
    loadCloneSlots
  };
};
