import { useState, useRef } from 'react';
import { API_URLS } from '@/constants/doctor';
import type { Appointment, DoctorInfo, Schedule, CalendarDay, ConfirmDialog, CancelDialog, CloneDialog, NewAppointmentDialog, RescheduleDialog } from '@/types/doctor';
import { useToast } from '@/hooks/use-toast';
import { checkSlotAvailability, showSlotErrorDialog } from '@/utils/slotChecker';

interface UseDoctorAppointmentsParams {
  doctorInfo: DoctorInfo | null;
  schedules: Schedule[];
  calendarData: {[key: string]: CalendarDay};
  soundEnabled: boolean;
  playNotificationSound: () => void;
  onAppointmentsChange?: () => void;
}

export const useDoctorAppointments = ({
  doctorInfo,
  schedules,
  calendarData,
  soundEnabled,
  playNotificationSound,
  onAppointmentsChange
}: UseDoctorAppointmentsParams) => {
  const { toast } = useToast();
  
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterFrom, setDateFilterFrom] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [dateFilterTo, setDateFilterTo] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const lastAppointmentIdsRef = useRef<Set<number>>(new Set());
  const [dateSlotCounts, setDateSlotCounts] = useState<{[key: string]: number}>({});
  
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    appointmentId: null,
    patientName: '',
    patientPhone: '',
    patientSnils: '',
    appointmentDate: '',
    appointmentDateRaw: '',
    appointmentTime: '',
    description: '',
    newDescription: ''
  });
  
  const [cancelDialog, setCancelDialog] = useState<CancelDialog>({
    open: false,
    appointmentId: null,
    patientName: '',
    patientPhone: '',
    patientSnils: '',
    appointmentDate: '',
    appointmentDateRaw: '',
    appointmentTime: '',
    description: ''
  });
  
  const [cloneDialog, setCloneDialog] = useState<CloneDialog>({
    open: false,
    appointment: null,
    newDate: '',
    newTime: '',
    newDescription: '',
    availableSlots: []
  });
  
  const [newAppointmentDialog, setNewAppointmentDialog] = useState<NewAppointmentDialog>({
    open: false,
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    patientSnils: '',
    patientOms: '',
    description: '',
    availableSlots: []
  });
  
  const [rescheduleDialog, setRescheduleDialog] = useState<RescheduleDialog>({
    open: false,
    appointment: null,
    newDate: '',
    newTime: '',
    availableSlots: [],
    availableDates: []
  });

  const handleUpdateAppointmentStatus = async (
    appointmentId: number,
    newStatus: string,
    description?: string,
    appointmentData?: Appointment
  ) => {
    if (!doctorInfo) return;

    try {
      const body: any = {
        id: appointmentId,
        status: newStatus,
        description: description
      };
      
      if (newStatus === 'completed') {
        const now = new Date();
        const moscowTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);
        body.completed_at = moscowTime.toISOString();
      }
      
      const response = await fetch(API_URLS.appointments, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        const statusText = newStatus === 'completed' ? 'Прием завершен' : 'Запись отменена';
        toast({ title: "Успешно", description: statusText });
        
        if (appointmentData) {
          const actionType = newStatus === 'completed' ? 'Завершение приема' : 'Отмена записи';
          await logAction(actionType, {
            appointment_id: appointmentId,
            patient_name: appointmentData.patient_name,
            patient_phone: appointmentData.patient_phone,
            patient_snils: appointmentData.patient_snils,
            appointment_date: appointmentData.appointment_date,
            appointment_time: appointmentData.appointment_time,
            description: description || appointmentData.description
          });
        }
        
        onAppointmentsChange?.();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось обновить статус", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCloneAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cloneDialog.appointment || !cloneDialog.newDate || !cloneDialog.newTime || !doctorInfo) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URLS.appointments,
      doctorInfo.id,
      cloneDialog.newDate,
      cloneDialog.newTime
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck.error || 'Слот времени занят');
      return;
    }

    try {
      const response = await fetch(API_URLS.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctorInfo.id,
          patient_name: cloneDialog.appointment.patient_name,
          patient_phone: cloneDialog.appointment.patient_phone,
          patient_snils: cloneDialog.appointment.patient_snils,
          appointment_date: cloneDialog.newDate,
          appointment_time: cloneDialog.newTime,
          description: cloneDialog.newDescription
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ 
          title: "Успешно", 
          description: `Запись клонирована на ${new Date(cloneDialog.newDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${cloneDialog.newTime}` 
        });
        
        await logAction('Клонирование записи', {
          original_appointment_id: cloneDialog.appointment.id,
          new_appointment_id: data.appointment?.id,
          patient_name: cloneDialog.appointment.patient_name,
          patient_phone: cloneDialog.appointment.patient_phone,
          patient_snils: cloneDialog.appointment.patient_snils,
          original_date: cloneDialog.appointment.appointment_date,
          original_time: cloneDialog.appointment.appointment_time,
          new_date: cloneDialog.newDate,
          new_time: cloneDialog.newTime,
          description: cloneDialog.newDescription
        });
        
        setCloneDialog({
          open: false,
          appointment: null,
          newDate: '',
          newTime: '',
          newDescription: '',
          availableSlots: []
        });
        onAppointmentsChange?.();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось клонировать запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCreateNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAppointmentDialog.date || !newAppointmentDialog.time || !newAppointmentDialog.patientName || !newAppointmentDialog.patientPhone || !doctorInfo) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URLS.appointments,
      doctorInfo.id,
      newAppointmentDialog.date,
      newAppointmentDialog.time
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck.error || 'Слот времени занят');
      return;
    }

    try {
      const response = await fetch(API_URLS.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctorInfo.id,
          patient_name: newAppointmentDialog.patientName,
          patient_phone: newAppointmentDialog.patientPhone,
          patient_snils: newAppointmentDialog.patientSnils,
          patient_oms: newAppointmentDialog.patientOms,
          appointment_date: newAppointmentDialog.date,
          appointment_time: newAppointmentDialog.time,
          description: newAppointmentDialog.description
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Запись создана" });
        
        await logAction('Создание записи', {
          appointment_id: data.appointment?.id,
          patient_name: newAppointmentDialog.patientName,
          patient_phone: newAppointmentDialog.patientPhone,
          patient_snils: newAppointmentDialog.patientSnils,
          appointment_date: newAppointmentDialog.date,
          appointment_time: newAppointmentDialog.time,
          description: newAppointmentDialog.description
        });
        
        setNewAppointmentDialog({
          open: false,
          date: '',
          time: '',
          patientName: '',
          patientPhone: '',
          patientSnils: '',
          patientOms: '',
          description: '',
          availableSlots: []
        });
        onAppointmentsChange?.();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось создать запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleDialog.appointment || !rescheduleDialog.newDate || !rescheduleDialog.newTime || !doctorInfo) {
      toast({ title: "Ошибка", description: "Выберите дату и время", variant: "destructive" });
      return;
    }

    const slotCheck = await checkSlotAvailability(
      API_URLS.appointments,
      doctorInfo.id,
      rescheduleDialog.newDate,
      rescheduleDialog.newTime,
      rescheduleDialog.appointment.id
    );

    if (!slotCheck.available) {
      showSlotErrorDialog(slotCheck.error || 'Слот времени занят');
      return;
    }

    try {
      const response = await fetch(API_URLS.appointments, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: rescheduleDialog.appointment.id,
          appointment_date: rescheduleDialog.newDate,
          appointment_time: rescheduleDialog.newTime
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await logAction('Перенос записи', {
          appointment_id: rescheduleDialog.appointment.id,
          patient_name: rescheduleDialog.appointment.patient_name,
          old_date: rescheduleDialog.appointment.appointment_date,
          old_time: rescheduleDialog.appointment.appointment_time,
          new_date: rescheduleDialog.newDate,
          new_time: rescheduleDialog.newTime
        });

        toast({ 
          title: "Успешно", 
          description: `Запись перенесена на ${new Date(rescheduleDialog.newDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${rescheduleDialog.newTime}` 
        });
        
        setRescheduleDialog({
          open: false,
          appointment: null,
          newDate: '',
          newTime: '',
          availableSlots: [],
          availableDates: []
        });
        onAppointmentsChange?.();
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось перенести запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const loadAvailableSlotsForClone = async (date: string) => {
    if (!doctorInfo) return;
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      setCloneDialog(prev => ({ ...prev, availableSlots: data.available_slots || [] }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const loadAvailableSlotsForNewAppointment = async (date: string) => {
    if (!doctorInfo) return;
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      setNewAppointmentDialog(prev => ({ ...prev, availableSlots: data.available_slots || [] }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const loadAvailableSlotsForReschedule = async (date: string) => {
    if (!doctorInfo) return;
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      setRescheduleDialog(prev => ({ ...prev, availableSlots: data.available_slots || [] }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const preloadSlotCounts = async () => {
    if (!doctorInfo) return;
    
    const counts: {[key: string]: number} = {};
    const days = getNext14DaysForDoctor();
    
    for (const day of days) {
      if (day.isWorking) {
        try {
          const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${day.date}`);
          const data = await response.json();
          counts[day.date] = data.available_slots?.length || 0;
        } catch (error) {
          counts[day.date] = 0;
        }
      } else {
        counts[day.date] = 0;
      }
    }
    
    setDateSlotCounts(counts);
  };

  const getNext14DaysForDoctor = () => {
    const days = [];
    for (let i = 0; i <= 13; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = (date.getDay() + 6) % 7;
      
      const hasSchedule = schedules.some(s => s.day_of_week === dayOfWeek && s.is_active);
      const calendarOverride = calendarData[dateStr];
      const isWorking = calendarOverride !== undefined ? calendarOverride.is_working : hasSchedule;
      
      days.push({
        date: dateStr,
        label: date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' }),
        isWorking
      });
    }
    return days;
  };

  const generateRescheduleDates = () => {
    const dates = [];
    for (let i = 0; i <= 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const dayOfWeek = (date.getDay() + 6) % 7;
      
      const hasSchedule = schedules.some(s => s.day_of_week === dayOfWeek && s.is_active);
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
    setRescheduleDialog(prev => ({ ...prev, availableDates: dates }));
  };

  const logAction = async (actionType: string, details: any) => {
    if (!doctorInfo) return;
    
    try {
      const response = await fetch(API_URLS.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          doctor_id: doctorInfo.id,
          user_login: doctorInfo.login || doctorInfo.full_name,
          action_type: actionType,
          details: JSON.stringify(details),
          computer_name: navigator.userAgent
        })
      });
      
      if (!response.ok) {
        console.error('Log action failed:', response.status, await response.text());
      }
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  return {
    appointments,
    setAppointments,
    statusFilter,
    setStatusFilter,
    dateFilterFrom,
    setDateFilterFrom,
    dateFilterTo,
    setDateFilterTo,
    searchQuery,
    setSearchQuery,
    selectedAppointment,
    setSelectedAppointment,
    lastAppointmentIdsRef,
    dateSlotCounts,
    setDateSlotCounts,
    confirmDialog,
    setConfirmDialog,
    cancelDialog,
    setCancelDialog,
    cloneDialog,
    setCloneDialog,
    newAppointmentDialog,
    setNewAppointmentDialog,
    rescheduleDialog,
    setRescheduleDialog,
    handleUpdateAppointmentStatus,
    handleCloneAppointment,
    handleCreateNewAppointment,
    handleRescheduleAppointment,
    loadAvailableSlotsForClone,
    loadAvailableSlotsForNewAppointment,
    loadAvailableSlotsForReschedule,
    preloadSlotCounts,
    getNext14DaysForDoctor,
    generateRescheduleDates,
    logAction
  };
};
