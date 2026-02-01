import { useState } from 'react';
import { API_URLS } from '@/constants/doctor';
import type { Schedule, DailySchedule } from '@/types/doctor';
import { useToast } from '@/hooks/use-toast';

interface ScheduleForm {
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time: string;
  break_end_time: string;
  slot_duration: number;
}

interface DailyScheduleForm {
  schedule_date: string;
  start_time: string;
  end_time: string;
  break_start_time: string;
  break_end_time: string;
  slot_duration: number;
  is_active: boolean;
}

export const useDoctorSchedules = (doctorId: number | null, onSchedulesChange?: () => void) => {
  const { toast } = useToast();
  
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dailySchedules, setDailySchedules] = useState<DailySchedule[]>([]);
  
  const [scheduleForm, setScheduleForm] = useState<ScheduleForm>({
    day_of_week: 0,
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '',
    break_end_time: '',
    slot_duration: 15
  });
  
  const [dailyScheduleForm, setDailyScheduleForm] = useState<DailyScheduleForm>({
    schedule_date: '',
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '',
    break_end_time: '',
    slot_duration: 15,
    is_active: true
  });
  
  const [isOpen, setIsOpen] = useState(false);
  const [isDailyScheduleOpen, setIsDailyScheduleOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDailyEditOpen, setIsDailyEditOpen] = useState(false);
  
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null);
  const [editingDailySchedule, setEditingDailySchedule] = useState<DailySchedule | null>(null);
  
  const [copyFromSchedule, setCopyFromSchedule] = useState<Schedule | null>(null);
  const [selectedDaysToCopy, setSelectedDaysToCopy] = useState<number[]>([]);

  const handleAddSchedule = async () => {
    if (!doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addSchedule',
        doctor_id: doctorId,
        ...scheduleForm
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Расписание добавлено' });
      setSchedules(data.schedules);
      setIsOpen(false);
      setScheduleForm({
        day_of_week: 0,
        start_time: '08:00',
        end_time: '17:00',
        break_start_time: '',
        break_end_time: '',
        slot_duration: 15
      });
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleUpdateSchedule = async () => {
    if (!editingSchedule || !doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateSchedule',
        schedule_id: editingSchedule.id,
        doctor_id: doctorId,
        ...scheduleForm
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Расписание обновлено' });
      setSchedules(data.schedules);
      setIsEditOpen(false);
      setEditingSchedule(null);
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteSchedule',
        schedule_id: scheduleId,
        doctor_id: doctorId
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Расписание удалено' });
      setSchedules(data.schedules);
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleAddDailySchedule = async () => {
    if (!doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addDailySchedule',
        doctor_id: doctorId,
        ...dailyScheduleForm
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Суточное расписание добавлено' });
      setDailySchedules(data.daily_schedules);
      setIsDailyScheduleOpen(false);
      setDailyScheduleForm({
        schedule_date: '',
        start_time: '08:00',
        end_time: '17:00',
        break_start_time: '',
        break_end_time: '',
        slot_duration: 15,
        is_active: true
      });
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleUpdateDailySchedule = async () => {
    if (!editingDailySchedule || !doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateDailySchedule',
        schedule_id: editingDailySchedule.id,
        doctor_id: doctorId,
        ...dailyScheduleForm
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Суточное расписание обновлено' });
      setDailySchedules(data.daily_schedules);
      setIsDailyEditOpen(false);
      setEditingDailySchedule(null);
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleDeleteDailySchedule = async (scheduleId: number) => {
    if (!doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteDailySchedule',
        schedule_id: scheduleId,
        doctor_id: doctorId
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Суточное расписание удалено' });
      setDailySchedules(data.daily_schedules);
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  const handleCopyScheduleToDays = async () => {
    if (!copyFromSchedule || selectedDaysToCopy.length === 0 || !doctorId) return;

    const response = await fetch(API_URLS.schedules, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'copySchedule',
        doctor_id: doctorId,
        source_schedule_id: copyFromSchedule.id,
        target_days: selectedDaysToCopy
      })
    });

    const data = await response.json();
    if (data.success) {
      toast({ title: 'Расписание скопировано' });
      setSchedules(data.schedules);
      setCopyFromSchedule(null);
      setSelectedDaysToCopy([]);
      onSchedulesChange?.();
    } else {
      toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
    }
  };

  return {
    schedules,
    setSchedules,
    dailySchedules,
    setDailySchedules,
    scheduleForm,
    setScheduleForm,
    dailyScheduleForm,
    setDailyScheduleForm,
    isOpen,
    setIsOpen,
    isDailyScheduleOpen,
    setIsDailyScheduleOpen,
    isEditOpen,
    setIsEditOpen,
    isDailyEditOpen,
    setIsDailyEditOpen,
    editingSchedule,
    setEditingSchedule,
    editingDailySchedule,
    setEditingDailySchedule,
    copyFromSchedule,
    setCopyFromSchedule,
    selectedDaysToCopy,
    setSelectedDaysToCopy,
    handleAddSchedule,
    handleUpdateSchedule,
    handleDeleteSchedule,
    handleAddDailySchedule,
    handleUpdateDailySchedule,
    handleDeleteDailySchedule,
    handleCopyScheduleToDays
  };
};
