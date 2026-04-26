import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import * as XLSX from 'xlsx';
import { checkSlotAvailability, showSlotErrorDialog } from '@/utils/slotChecker';
import { validateFullName } from '@/utils/validation';
import { EditAppointmentForm } from '@/components/EditAppointmentForm';
import NameErrorModal from '@/components/NameErrorModal';
import { AppointmentContextMenu } from '@/components/AppointmentContextMenu';

const API_URLS = {
  auth: 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227',
  schedules: 'https://functions.poehali.dev/6f53f66d-3e47-4e57-93dd-52d63c16d38f',
  appointments: 'https://functions.poehali.dev/b3b698ed-7035-4503-8c49-85be11de75e5',
  doctors: 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688',
};

const DAYS_OF_WEEK = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота', 'Воскресенье'];

const Doctor = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<any>(null);
  const [isRegistrarAccess, setIsRegistrarAccess] = useState(false);
  const [isMDoctorAccess, setIsMDoctorAccess] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [schedules, setSchedules] = useState<any[]>([]);
  const [dailySchedules, setDailySchedules] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [scheduleForm, setScheduleForm] = useState({
    day_of_week: 0,
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '',
    break_end_time: '',
    slot_duration: 15
  });
  const [dailyScheduleForm, setDailyScheduleForm] = useState({
    schedule_date: '',
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '',
    break_end_time: '',
    slot_duration: 15,
    is_active: true
  });
  const [isOpen, setIsOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<any>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDailyScheduleOpen, setIsDailyScheduleOpen] = useState(false);
  const [editingDailySchedule, setEditingDailySchedule] = useState<any>(null);
  const [isDailyEditOpen, setIsDailyEditOpen] = useState(false);
  const [isBulkGenerateOpen, setIsBulkGenerateOpen] = useState(false);
  const [bulkGenerateForm, setBulkGenerateForm] = useState({
    start_date: new Date().toISOString().split('T')[0],
    end_date: '',
    start_time: '08:00',
    end_time: '17:00',
    break_start_time: '',
    break_end_time: '',
    slot_duration: 15,
    is_active: true
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilterFrom, setDateFilterFrom] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [dateFilterTo, setDateFilterTo] = useState<string>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [debouncedDateFrom, setDebouncedDateFrom] = useState(dateFilterFrom);
  const [debouncedDateTo, setDebouncedDateTo] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    return date.toISOString().split('T')[0];
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copyFromSchedule, setCopyFromSchedule] = useState<any>(null);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [selectedDaysToCopy, setSelectedDaysToCopy] = useState<number[]>([]);
  const lastAppointmentIdsRef = useRef<Set<number>>(new Set());
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(() => {
    const saved = localStorage.getItem('doctor_auto_refresh');
    return saved === 'true';
  });
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('doctor_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [checkInterval, setCheckInterval] = useState(() => {
    const saved = localStorage.getItem('doctor_check_interval');
    return saved ? parseInt(saved) : 900;
  });
  const [lastCheckTime, setLastCheckTime] = useState<Date | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{open: boolean, appointmentId: number | null, patientName: string, patientPhone: string, patientSnils: string, appointmentDate: string, appointmentDateRaw: string, appointmentTime: string, description: string, newDescription: string}>({
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
  const [wrongDateDialog, setWrongDateDialog] = useState<{open: boolean, appointmentDate: string, currentDate: string}>({
    open: false,
    appointmentDate: '',
    currentDate: ''
  });
  const [cancelDialog, setCancelDialog] = useState<{open: boolean, appointmentId: number | null, patientName: string, patientPhone: string, patientSnils: string, appointmentDate: string, appointmentDateRaw: string, appointmentTime: string, description: string}>({
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
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [calendarData, setCalendarData] = useState<{[key: string]: {is_working: boolean, note?: string}}>({});
  const [slotStats, setSlotStats] = useState<{[key: string]: {available: number, booked: number}}>({});
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [bulkSlotDialogOpen, setBulkSlotDialogOpen] = useState(false);
  const [bulkSlotDuration, setBulkSlotDuration] = useState(15);
  const [scheduleInstructionOpen, setScheduleInstructionOpen] = useState(false);
  const [calendarInstructionOpen, setCalendarInstructionOpen] = useState(false);
  const [cloneDialog, setCloneDialog] = useState<{
    open: boolean;
    appointment: any | null;
    newDate: string;
    newTime: string;
    newDescription: string;
    availableSlots: string[];
  }>({
    open: false,
    appointment: null,
    newDate: '',
    newTime: '',
    newDescription: '',
    availableSlots: []
  });
  const [newAppointmentDialog, setNewAppointmentDialog] = useState<{
    open: boolean;
    date: string;
    time: string;
    patientName: string;
    patientPhone: string;
    patientSnils: string;
    patientOms: string;
    description: string;
    availableSlots: string[];
  }>({
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
  const [newAppointmentNameError, setNewAppointmentNameError] = useState<string | null>(null);
  const [nameErrorModal, setNameErrorModal] = useState<{ open: boolean; message: string }>({ open: false, message: '' });
  const [dateSlotCounts, setDateSlotCounts] = useState<{[key: string]: number}>({});
  const [tipsContentOpen, setTipsContentOpen] = useState(false);
  const dialogSlotsCacheRef = useRef<Record<string, string[]>>({});
  const bulkSlotsCacheRef = useRef<Record<string, string[]>>({});
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [dayOffWarning, setDayOffWarning] = useState<{open: boolean, date: string, appointmentCount: number}>({open: false, date: '', appointmentCount: 0});
  
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);

  const [otherDoctorDialog, setOtherDoctorDialog] = useState<{
    open: boolean;
    selectedDoctorId: string;
    date: string;
    time: string;
    patientName: string;
    patientPhone: string;
    patientSnils: string;
    patientOms: string;
    description: string;
    availableSlots: string[];
    availableDates: string[];
    isLoadingDates: boolean;
    isLoadingSlots: boolean;
  }>({
    open: false,
    selectedDoctorId: '',
    date: '',
    time: '',
    patientName: '',
    patientPhone: '',
    patientSnils: '',
    patientOms: '',
    description: '',
    availableSlots: [],
    availableDates: [],
    isLoadingDates: false,
    isLoadingSlots: false
  });
  const [doctors, setDoctors] = useState<any[]>([]);
  
  const [editDialog, setEditDialog] = useState<{
    open: boolean;
    appointment: any | null;
  }>({
    open: false,
    appointment: null
  });
  
  const [rescheduleDialog, setRescheduleDialog] = useState<{
    open: boolean;
    appointment: any | null;
    newDate: string;
    newTime: string;
    availableSlots: string[];
    availableDates: any[];
  }>({
    open: false,
    appointment: null,
    newDate: '',
    newTime: '',
    availableSlots: [],
    availableDates: []
  });

  const [scheduleFilterFrom, setScheduleFilterFrom] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [scheduleFilterTo, setScheduleFilterTo] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    return date.toISOString().split('T')[0];
  });
  const [pastDateWarning, setPastDateWarning] = useState<{open: boolean, attemptedDate: string}>({open: false, attemptedDate: ''});
  const [debouncedCloneDate, setDebouncedCloneDate] = useState('');
  const [debouncedRescheduleDate, setDebouncedRescheduleDate] = useState('');
  const [debouncedNewAppointmentDate, setDebouncedNewAppointmentDate] = useState('');
  const [serverToday, setServerToday] = useState<string>('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateFrom(dateFilterFrom);
    }, 500);
    return () => clearTimeout(timer);
  }, [dateFilterFrom]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedDateTo(dateFilterTo);
    }, 500);
    return () => clearTimeout(timer);
  }, [dateFilterTo]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedCloneDate(cloneDialog.newDate), 300);
    return () => clearTimeout(timer);
  }, [cloneDialog.newDate]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedRescheduleDate(rescheduleDialog.newDate), 300);
    return () => clearTimeout(timer);
  }, [rescheduleDialog.newDate]);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedNewAppointmentDate(newAppointmentDialog.date), 300);
    return () => clearTimeout(timer);
  }, [newAppointmentDialog.date]);

  useEffect(() => {
    // Загружаем текущую дату с сервера UTC+3
    fetch(`${API_URLS.appointments}?action=server-time`)
      .then(r => r.json())
      .then(d => { if (d.today) setServerToday(d.today); })
      .catch(() => setServerToday(new Date().toISOString().split('T')[0]));

    const urlParams = new URLSearchParams(window.location.search);
    const doctorIdFromUrl = urlParams.get('id');
    const sourceFromUrl = urlParams.get('source');
    
    if (doctorIdFromUrl) {
      loadDoctorById(parseInt(doctorIdFromUrl), sourceFromUrl);
      return;
    }
    
    const auth = localStorage.getItem('doctor_auth');
    if (auth) {
      const doctor = JSON.parse(auth);
      setDoctorInfo(doctor);
      setIsAuthenticated(true);
      loadSchedules(doctor.id);
      loadDailySchedules(doctor.id);
      loadAppointments(doctor.id);
      loadCalendar(doctor.id, selectedYear);
    }
  }, []);

  useEffect(() => {
    if (doctorInfo) {
      loadAppointments(doctorInfo.id);
    }
  }, [debouncedDateFrom, debouncedDateTo]);

  useEffect(() => {
    if (doctorInfo && selectedYear) {
      loadCalendar(doctorInfo.id, selectedYear);
    }
  }, [selectedYear]);

  useEffect(() => {
    if (debouncedCloneDate && doctorInfo) {
      loadAvailableSlotsForClone(debouncedCloneDate);
    }
  }, [debouncedCloneDate]);

  useEffect(() => {
    if (debouncedNewAppointmentDate && doctorInfo) {
      loadAvailableSlotsForNewAppointment(debouncedNewAppointmentDate);
    }
  }, [debouncedNewAppointmentDate]);

  useEffect(() => {
    if (newAppointmentDialog.open && doctorInfo) {
      preloadSlotCounts();
    }
  }, [newAppointmentDialog.open]);

  useEffect(() => {
    if (debouncedRescheduleDate && doctorInfo) {
      loadAvailableSlotsForReschedule(debouncedRescheduleDate);
    }
  }, [debouncedRescheduleDate]);

  useEffect(() => {
    if (rescheduleDialog.open && doctorInfo) {
      generateRescheduleDates();
    }
  }, [rescheduleDialog.open]);



  const loadDoctorById = async (doctorId: number, source: string | null = null) => {
    try {
      const url = 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688';
      console.log('🔍 Загрузка врача по ID:', doctorId);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('📥 Ответ от API doctors:', data);
      console.log('📊 Всего врачей в базе:', data.doctors?.length || 0);
      
      if (response.ok && data.doctors && data.doctors.length > 0) {
        const doctor = data.doctors.find((d: any) => d.id === doctorId);
        
        if (doctor) {
          console.log('✅ Врач найден:', doctor);
          
          setDoctorInfo(doctor);
          setIsAuthenticated(true);
          
          if (source === 'mdoctor') {
            setIsMDoctorAccess(true);
          } else {
            setIsRegistrarAccess(true);
          }
          loadSchedules(doctor.id);
          loadDailySchedules(doctor.id);
          loadAppointments(doctor.id);
          loadCalendar(doctor.id, selectedYear);
          toast({ 
            title: "Доступ открыт", 
            description: `Личный кабинет: ${doctor.full_name}`,
            duration: 3000
          });
        } else {
          console.error('❌ Врач с ID', doctorId, 'не найден в списке');
          toast({ title: "Ошибка", description: `Врач с ID ${doctorId} не найден`, variant: "destructive" });
        }
      } else {
        console.error('❌ API не вернул список врачей. Ответ:', data);
        toast({ title: "Ошибка", description: "Не удалось загрузить список врачей", variant: "destructive" });
      }
    } catch (error) {
      console.error('❌ Ошибка загрузки врача:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить данные врача", variant: "destructive" });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, type: 'doctor' }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('doctor_auth', JSON.stringify(data.user));
        setDoctorInfo(data.user);
        setIsAuthenticated(true);
        loadSchedules(data.user.id);
        loadDailySchedules(data.user.id);
        loadAppointments(data.user.id);
        toast({ title: "Успешный вход", description: `Добро пожаловать, ${data.user.full_name}` });
      } else {
        toast({ title: "Ошибка", description: data.error || "Неверные данные", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const loadSchedules = async (doctorId: number) => {
    try {
      const response = await fetch(`${API_URLS.schedules}?doctor_id=${doctorId}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setSchedules(data.schedules || []);
    } catch (error) {
      console.error('Load schedules error:', error);
      toast({ 
        title: "Ошибка", 
        description: "Не удалось загрузить расписание. Проверьте подключение к интернету.", 
        variant: "destructive" 
      });
    }
  };

  const loadDailySchedules = async (doctorId: number) => {
    try {
      const today = new Date();
      const twoMonthsLater = new Date(today);
      twoMonthsLater.setMonth(today.getMonth() + 2);
      
      // ОПТИМИЗАЦИЯ: используем фильтрацию по датам для уменьшения объема
      const response = await fetch(`${API_URLS.schedules}?action=daily&doctor_id=${doctorId}&start_date=${today.toISOString().split('T')[0]}&end_date=${twoMonthsLater.toISOString().split('T')[0]}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data = await response.json();
      setDailySchedules(data.daily_schedules || []);
    } catch (error) {
      console.error('Load daily schedules error:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить ежедневное расписание", variant: "destructive" });
    }
  };

  const generateCombinedSchedule = () => {
    const combined: any[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const twoMonthsLater = new Date(today);
    twoMonthsLater.setMonth(today.getMonth() + 2);

    const dailyMap = new Map();
    dailySchedules.forEach((ds: any) => {
      dailyMap.set(ds.schedule_date, ds);
    });

    for (let d = new Date(today); d <= twoMonthsLater; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const dayOfWeek = (d.getDay() + 6) % 7;

      if (dailyMap.has(dateStr)) {
        combined.push(dailyMap.get(dateStr));
      } else {
        const weekSchedule = schedules.find((s: any) => s.day_of_week === dayOfWeek);
        if (weekSchedule && weekSchedule.is_active) {
          combined.push({
            id: `generated-${dateStr}`,
            schedule_date: dateStr,
            start_time: weekSchedule.start_time,
            end_time: weekSchedule.end_time,
            break_start_time: weekSchedule.break_start_time,
            break_end_time: weekSchedule.break_end_time,
            slot_duration: weekSchedule.slot_duration,
            is_active: true,
            is_generated: true
          });
        }
      }
    }

    return combined.filter(s => !s.is_generated);
  };

  const getScheduleDateRange = () => {
    const schedule = generateCombinedSchedule();
    if (schedule.length === 0) return { start: '', end: '' };
    const dates = schedule.map(s => s.schedule_date).sort();
    return {
      start: new Date(dates[0] + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
      end: new Date(dates[dates.length - 1] + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
  };

  const loadCalendar = async (doctorId: number, year: number) => {
    try {
      const response = await fetch(`${API_URLS.schedules}?action=calendar&doctor_id=${doctorId}&year=${year}`);
      const data = await response.json();
      const calendarMap: {[key: string]: {is_working: boolean, note?: string}} = {};
      (data.calendar || []).forEach((day: any) => {
        calendarMap[day.calendar_date] = {
          is_working: day.is_working,
          note: day.note
        };
      });
      setCalendarData(calendarMap);
      

    } catch (error) {
      console.error('Failed to load calendar:', error);
    }
  };



  const toggleCalendarDay = async (date: string) => {
    if (!doctorInfo) return;
    
    const currentStatus = calendarData[date]?.is_working ?? true;
    const newStatus = !currentStatus;
    
    if (!newStatus) {
      try {
        const response = await fetch(`${API_URLS.appointments}?doctor_id=${doctorInfo.id}&start_date=${date}&end_date=${date}`);
        const data = await response.json();
        const appointmentsOnDay = (data.appointments || []).filter((app: any) => app.status === 'scheduled' || app.status === 'completed' || app.status === 'cancelled');
        
        if (appointmentsOnDay.length > 0) {
          setDayOffWarning({open: true, date, appointmentCount: appointmentsOnDay.length});
          return;
        }
      } catch (error) {
        console.error('Failed to check appointments:', error);
      }
    }
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calendar',
          doctor_id: doctorInfo.id,
          calendar_date: date,
          is_working: newStatus
        })
      });
      
      if (response.ok) {
        await loadCalendar(doctorInfo.id, selectedYear);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить календарь", variant: "destructive" });
    }
  };

  const confirmDayOff = async () => {
    if (!doctorInfo) return;
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'calendar',
          doctor_id: doctorInfo.id,
          calendar_date: dayOffWarning.date,
          is_working: false
        })
      });
      
      if (response.ok) {
        toast({ 
          title: "День отмечен как выходной", 
          description: "Не забудьте уведомить пациентов о переносе",
          duration: 5000
        });
        await loadCalendar(doctorInfo.id, selectedYear);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось обновить календарь", variant: "destructive" });
    }
    
    setDayOffWarning({open: false, date: '', appointmentCount: 0});
  };

  const loadAppointments = async (doctorId: number, checkForNew = false) => {
    try {
      // ОПТИМИЗАЦИЯ: всегда используем фильтрацию по датам
      const startDate = dateFilterFrom || new Date().toISOString().split('T')[0];
      const endDate = dateFilterTo || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const timestamp = Date.now();
      const response = await fetch(`${API_URLS.appointments}?action=list&doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}&_t=${timestamp}`);
      const data = await response.json();
      const newAppointments = data.appointments || [];
      
      console.log('📋 Загружено записей:', newAppointments.length, 'checkForNew:', checkForNew, 'lastIds.size:', lastAppointmentIdsRef.current.size);
      
      // Проверяем новые записи ДО обновления
      if (checkForNew && lastAppointmentIdsRef.current.size > 0) {
        const currentIds = Array.from(lastAppointmentIdsRef.current);
        const newIds = newAppointments.map((a: any) => a.id);
        console.log('🔍 Текущие ID:', currentIds);
        console.log('🔍 Новые ID:', newIds);
        
        const addedAppointments = newAppointments.filter((a: any) => !lastAppointmentIdsRef.current.has(a.id));
        console.log('✨ Добавлено записей:', addedAppointments.length);
        
        if (addedAppointments.length > 0) {
          const latestAppointment = addedAppointments[addedAppointments.length - 1];
          
          console.log('🔔 Новая запись обнаружена:', latestAppointment);
          console.log('🔊 Звук включен:', soundEnabled);
          
          if (soundEnabled) {
            playNotificationSound();
          }
          
          const appointmentDate = new Date(latestAppointment.appointment_date).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
            weekday: 'short'
          });
          const appointmentTime = latestAppointment.appointment_time.slice(0, 5);
          const phoneNumber = latestAppointment.patient_phone || 'не указан';
          
          let description = `Пациент: ${latestAppointment.patient_name}\nТелефон: ${phoneNumber}\nДата: ${appointmentDate} в ${appointmentTime}`;
          if (latestAppointment.description) {
            description += `\nОписание: ${latestAppointment.description}`;
          }
          
          toast({
            title: "🔔 Новая запись на прием!",
            description: description,
            duration: 10000,
          });
        }
      }
      
      // Обновляем состояние ПОСЛЕ проверки
      setAppointments(newAppointments);
      setLastCheckTime(new Date());
      
      // Всегда обновляем список ID в ref (синхронно!)
      const newIds = new Set(newAppointments.map((a: any) => a.id));
      console.log('💾 Сохранено ID записей:', newIds.size);
      lastAppointmentIdsRef.current = newIds;
    } catch (error) {
      console.error('Ошибка загрузки записей:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить записи", variant: "destructive" });
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctor_id: doctorInfo.id,
          ...scheduleForm
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Расписание обновлено" });
        setScheduleForm({ day_of_week: 0, start_time: '08:00', end_time: '17:00', break_start_time: '', break_end_time: '', slot_duration: 15 });
        setIsOpen(false);
        loadSchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось сохранить расписание", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleToggleActive = async (scheduleId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: scheduleId,
          is_active: !currentStatus
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: currentStatus ? "День деактивирован" : "День активирован" });
        loadSchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось изменить статус", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleDeleteSchedule = async (scheduleId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот день из расписания?')) return;
    
    try {
      const response = await fetch(`${API_URLS.schedules}?id=${scheduleId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "День удален из расписания" });
        loadSchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleEditSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingSchedule.id,
          start_time: editingSchedule.start_time,
          end_time: editingSchedule.end_time,
          break_start_time: editingSchedule.break_start_time || null,
          break_end_time: editingSchedule.break_end_time || null,
          slot_duration: editingSchedule.slot_duration || 15
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Время приема обновлено" });
        setIsEditOpen(false);
        setEditingSchedule(null);
        loadSchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось обновить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCreateDailySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateScheduleDate(dailyScheduleForm.schedule_date)) {
      setPastDateWarning({open: true, attemptedDate: dailyScheduleForm.schedule_date});
      return;
    }
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'daily',
          doctor_id: doctorInfo.id,
          ...dailyScheduleForm
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "День добавлен в расписание" });
        setDailyScheduleForm({ schedule_date: '', start_time: '08:00', end_time: '17:00', break_start_time: '', break_end_time: '', slot_duration: 15, is_active: true });
        setIsDailyScheduleOpen(false);
        loadDailySchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось сохранить расписание", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleEditDailySchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateScheduleDate(editingDailySchedule.schedule_date)) {
      setPastDateWarning({open: true, attemptedDate: editingDailySchedule.schedule_date});
      return;
    }
    
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'daily',
          id: editingDailySchedule.id,
          start_time: editingDailySchedule.start_time,
          end_time: editingDailySchedule.end_time,
          break_start_time: editingDailySchedule.break_start_time || null,
          break_end_time: editingDailySchedule.break_end_time || null,
          slot_duration: editingDailySchedule.slot_duration || 15
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "Расписание дня обновлено" });
        setIsDailyEditOpen(false);
        setEditingDailySchedule(null);
        loadDailySchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось обновить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleToggleDailyActive = async (scheduleId: number, currentStatus: boolean) => {
    try {
      const response = await fetch(API_URLS.schedules, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'daily',
          id: scheduleId,
          is_active: !currentStatus
        }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: currentStatus ? "День деактивирован" : "День активирован" });
        loadDailySchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось изменить статус", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleCopyDailySchedule = async (sourceSchedule: any, targetDates: string[]) => {
    try {
      const promises = targetDates.map(date => 
        fetch(API_URLS.schedules, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'daily',
            doctor_id: doctorInfo.id,
            schedule_date: date,
            start_time: sourceSchedule.start_time,
            end_time: sourceSchedule.end_time,
            break_start_time: sourceSchedule.break_start_time,
            break_end_time: sourceSchedule.break_end_time,
            slot_duration: sourceSchedule.slot_duration,
            is_active: true
          }),
        })
      );
      
      await Promise.all(promises);
      toast({ title: "Успешно", description: `Расписание скопировано на ${targetDates.length} дней` });
      loadDailySchedules(doctorInfo.id);
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с копированием расписания", variant: "destructive" });
    }
  };

  const handleDeleteDailySchedule = async (scheduleId: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот день из расписания?')) return;
    
    try {
      const response = await fetch(`${API_URLS.schedules}?action=daily&id=${scheduleId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        toast({ title: "Успешно", description: "День удален из расписания" });
        loadDailySchedules(doctorInfo.id);
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось удалить", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleBulkGenerateDays = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bulkGenerateForm.start_date || !bulkGenerateForm.end_date) {
      toast({ title: "Ошибка", description: "Укажите период", variant: "destructive" });
      return;
    }
    
    if (!validateScheduleDate(bulkGenerateForm.start_date)) {
      setPastDateWarning({open: true, attemptedDate: bulkGenerateForm.start_date});
      return;
    }
    
    const startDate = new Date(bulkGenerateForm.start_date + 'T00:00:00');
    const endDate = new Date(bulkGenerateForm.end_date + 'T00:00:00');
    
    if (startDate > endDate) {
      toast({ title: "Ошибка", description: "Дата начала должна быть раньше даты окончания", variant: "destructive" });
      return;
    }
    
    const dates: string[] = [];
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }
    
    toast({ title: "Генерация дней", description: `Создаём ${dates.length} дней...` });
    
    try {
      for (const date of dates) {
        await fetch(API_URLS.schedules, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'daily',
            doctor_id: doctorInfo.id,
            schedule_date: date,
            start_time: bulkGenerateForm.start_time,
            end_time: bulkGenerateForm.end_time,
            break_start_time: bulkGenerateForm.break_start_time || null,
            break_end_time: bulkGenerateForm.break_end_time || null,
            slot_duration: bulkGenerateForm.slot_duration,
            is_active: bulkGenerateForm.is_active
          }),
        });
      }
      
      toast({ title: "Готово", description: `Создано ${dates.length} дней` });
      setIsBulkGenerateOpen(false);
      setBulkGenerateForm({
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        start_time: '08:00',
        end_time: '17:00',
        break_start_time: '',
        break_end_time: '',
        slot_duration: 15,
        is_active: true
      });
      loadDailySchedules(doctorInfo.id);
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: number, newStatus: string, description?: string, appointmentData?: any) => {
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

        setAppointments(prev => prev.map(a =>
          a.id === appointmentId
            ? { ...a, status: newStatus, description: description ?? a.description, ...(newStatus === 'completed' ? { completed_at: new Date().toISOString() } : {}) }
            : a
        ));
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось обновить статус", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.error('Failed to play sound:', error);
    }
  };

  const toggleSound = () => {
    const newValue = !soundEnabled;
    setSoundEnabled(newValue);
    localStorage.setItem('doctor_sound_enabled', String(newValue));
    toast({ 
      title: newValue ? 'Звук включен' : 'Звук выключен',
      description: newValue ? 'Вы будете слышать уведомления о новых записях' : 'Звуковые уведомления отключены',
      duration: 3000,
    });
  };

  const changeCheckInterval = (seconds: number) => {
    setCheckInterval(seconds);
    localStorage.setItem('doctor_check_interval', String(seconds));
    toast({ 
      title: 'Интервал обновлен',
      description: `Проверка новых записей каждые ${seconds} секунд`,
      duration: 3000,
    });
  };

  const toggleAutoRefresh = () => {
    const newValue = !autoRefreshEnabled;
    setAutoRefreshEnabled(newValue);
    localStorage.setItem('doctor_auto_refresh', String(newValue));
    toast({
      title: newValue ? 'Автообновление включено' : 'Автообновление выключено',
      description: newValue 
        ? `Записи будут проверяться каждые ${checkInterval} секунд`
        : 'Записи не будут обновляться автоматически',
      duration: 3000,
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_auth');
    setIsAuthenticated(false);
    setDoctorInfo(null);
  };

  const handleCopySchedule = (schedule: any) => {
    setCopyFromSchedule(schedule);
    setSelectedDaysToCopy([]);
    setIsCopyDialogOpen(true);
  };

  const handleApplyCopy = async () => {
    if (!copyFromSchedule || selectedDaysToCopy.length === 0) {
      toast({ title: "Ошибка", description: "Выберите дни для копирования", variant: "destructive" });
      return;
    }

    try {
      let successCount = 0;
      for (const dayOfWeek of selectedDaysToCopy) {
        const response = await fetch(API_URLS.schedules, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor_id: doctorInfo.id,
            day_of_week: dayOfWeek,
            start_time: copyFromSchedule.start_time,
            end_time: copyFromSchedule.end_time,
            break_start_time: copyFromSchedule.break_start_time || null,
            break_end_time: copyFromSchedule.break_end_time || null,
            slot_duration: copyFromSchedule.slot_duration || 15
          }),
        });
        
        if (response.ok) {
          successCount++;
        }
      }
      
      toast({ 
        title: "Успешно", 
        description: `Расписание скопировано на ${successCount} ${successCount === 1 ? 'день' : 'дней'}` 
      });
      setIsCopyDialogOpen(false);
      setCopyFromSchedule(null);
      setSelectedDaysToCopy([]);
      loadSchedules(doctorInfo.id);
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const loadSlotStatsForYear = async () => {
    if (!doctorInfo) return;
    
    setIsLoadingSlots(true);
    setLoadingProgress(0);
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const startDate = new Date(currentYear, currentMonth, 1);
    const endDate = new Date(currentYear, currentMonth + 2, 0);
    
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const startDateStr = fmt(startDate);
    const endDateStr = fmt(endDate);
    
    const dates: string[] = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const year = currentDate.getFullYear();
      const month = String(currentDate.getMonth() + 1).padStart(2, '0');
      const day = String(currentDate.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;
      dates.push(dateStr);
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const totalDays = dates.length;
    
    try {
      // ОПТИМИЗАЦИЯ: Батчинг - один запрос вместо ~90
      const response = await fetch(
        `${API_URLS.appointments}?action=available-slots-bulk&doctor_id=${doctorInfo.id}&start_date=${startDateStr}&end_date=${endDateStr}`
      );
      const data = await response.json();
      const slotsByDate = data.slots_by_date || {};
      
      const newStats: {[key: string]: {available: number, booked: number}} = {};
      
      dates.forEach((dateStr, index) => {
        const dayData = slotsByDate[dateStr];
        if (dayData) {
          newStats[dateStr] = {
            available: dayData.available_slots?.length || 0,
            booked: dayData.booked_slots || 0
          };
        } else {
          newStats[dateStr] = { available: 0, booked: 0 };
        }
        
        const progress = Math.round(((index + 1) / totalDays) * 100);
        setLoadingProgress(progress);
      });
      
      setSlotStats(newStats);
    } catch (error) {
      console.error('Failed to load slot stats:', error);
      const emptyStats: {[key: string]: {available: number, booked: number}} = {};
      dates.forEach(dateStr => {
        emptyStats[dateStr] = { available: 0, booked: 0 };
      });
      setSlotStats(emptyStats);
    }
    
    setIsLoadingSlots(false);
    setLoadingProgress(0);
    
    toast({
      title: "Готово",
      description: `Загружена статистика слотов на ${totalDays} дней (1 запрос вместо ${totalDays})`,
    });
  };

  const toggleDaySelection = (dayOfWeek: number) => {
    setSelectedDaysToCopy(prev => 
      prev.includes(dayOfWeek) 
        ? prev.filter(d => d !== dayOfWeek)
        : [...prev, dayOfWeek]
    );
  };

  const handleBulkSlotUpdate = async () => {
    if (!doctorInfo || schedules.length === 0) {
      toast({ title: "Ошибка", description: "Сначала создайте расписание", variant: "destructive" });
      return;
    }

    try {
      let successCount = 0;
      for (const schedule of schedules) {
        const response = await fetch(API_URLS.schedules, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            doctor_id: doctorInfo.id,
            day_of_week: schedule.day_of_week,
            start_time: schedule.start_time,
            end_time: schedule.end_time,
            break_start_time: schedule.break_start_time || null,
            break_end_time: schedule.break_end_time || null,
            slot_duration: bulkSlotDuration
          }),
        });
        
        if (response.ok) {
          successCount++;
        }
      }
      
      toast({ 
        title: "Успешно", 
        description: `Длительность слота ${bulkSlotDuration} минут применена ко всем дням` 
      });
      setBulkSlotDialogOpen(false);
      loadSchedules(doctorInfo.id);
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const loadAvailableSlotsForClone = async (date: string) => {
    if (!doctorInfo) return;

    const cached = dialogSlotsCacheRef.current[date] ?? bulkSlotsCacheRef.current[date];
    if (cached) {
      setCloneDialog(prev => ({ ...prev, availableSlots: cached }));
      return;
    }
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      const slots = data.available_slots || [];
      dialogSlotsCacheRef.current[date] = slots;
      setCloneDialog(prev => ({ ...prev, availableSlots: slots }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const handleOpenCloneDialog = (appointment: any) => {
    setCloneDialog({
      open: true,
      appointment,
      newDate: '',
      newTime: '',
      newDescription: appointment.description || '',
      availableSlots: []
    });
  };

  const setScheduleQuickFilter = (period: 'today' | 'week' | 'month') => {
    const todayStr = serverToday || new Date().toISOString().split('T')[0];
    const [ty, tm, td] = todayStr.split('-').map(Number);
    
    setScheduleFilterFrom(todayStr);
    
    const fmt = (d: Date) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
    if (period === 'today') {
      setScheduleFilterTo(todayStr);
    } else if (period === 'week') {
      setScheduleFilterTo(fmt(new Date(ty, tm - 1, td + 7)));
    } else if (period === 'month') {
      setScheduleFilterTo(fmt(new Date(ty, tm, td)));
    }
  };

  const validateScheduleDate = (dateStr: string): boolean => {
    const todayStr = serverToday || new Date().toISOString().split('T')[0];
    return dateStr >= todayStr;
  };

  const printSchedule = () => {
    const filtered = getFilteredSchedule();
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Рабочее расписание - ${doctorInfo.full_name}</title>
        <style>
          body {
            font-family: 'Segoe UI', Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 20px;
          }
          h1 {
            font-size: 24px;
            margin-bottom: 10px;
            color: #1e40af;
          }
          .doctor-info {
            background: #f0f9ff;
            border: 2px solid #3b82f6;
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
          }
          .info-row {
            display: flex;
            margin-bottom: 8px;
          }
          .info-label {
            font-weight: bold;
            min-width: 180px;
            color: #1e40af;
          }
          .info-value {
            color: #374151;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
          th {
            background: linear-gradient(to bottom, #3b82f6, #2563eb);
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #1e40af;
          }
          td {
            border: 1px solid #d1d5db;
            padding: 10px;
            text-align: left;
          }
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          tr:hover {
            background-color: #eff6ff;
          }
          .weekend {
            background-color: #fef2f2 !important;
          }
          .time-badge {
            background: #dbeafe;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
            color: #1e40af;
            display: inline-block;
          }
          .break-badge {
            background: #fef3c7;
            padding: 4px 8px;
            border-radius: 4px;
            font-weight: 500;
            color: #92400e;
            display: inline-block;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 10px;
            border-top: 1px solid #d1d5db;
            padding-top: 10px;
          }
          @media print {
            body { margin: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📅 Рабочее расписание</h1>
        </div>
        
        <div class="doctor-info">
          <div class="info-row">
            <div class="info-label">👨‍⚕️ Врач:</div>
            <div class="info-value">${doctorInfo.full_name}</div>
          </div>
          <div class="info-row">
            <div class="info-label">💼 Должность:</div>
            <div class="info-value">${doctorInfo.position || 'Не указана'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🔬 Специализация:</div>
            <div class="info-value">${doctorInfo.specialization || 'Не указана'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🏥 Поликлиника:</div>
            <div class="info-value">${doctorInfo.clinic || 'Не указана'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🚪 Кабинет:</div>
            <div class="info-value">${doctorInfo.office_number || 'Не указан'}</div>
          </div>
          <div class="info-row">
            <div class="info-label">📅 Период расписания:</div>
            <div class="info-value">${new Date(scheduleFilterFrom + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })} — ${new Date(scheduleFilterTo + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</div>
          </div>
          <div class="info-row">
            <div class="info-label">🖨️ Дата печати:</div>
            <div class="info-value">${new Date().toLocaleString('ru-RU')}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">№</th>
              <th>Дата</th>
              <th>День недели</th>
              <th>Время приёма</th>
              <th>Перерыв</th>
              <th>Длительность слота</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((schedule, index) => {
              const date = new Date(schedule.schedule_date + 'T00:00:00');
              const dayOfWeek = date.toLocaleDateString('ru-RU', { weekday: 'long' });
              const isWeekend = date.getDay() === 0 || date.getDay() === 6;
              
              return `
                <tr class="${isWeekend ? 'weekend' : ''}">
                  <td>${index + 1}</td>
                  <td>${date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                  <td><strong>${dayOfWeek}</strong></td>
                  <td>
                    <span class="time-badge">${schedule.start_time.slice(0, 5)} — ${schedule.end_time.slice(0, 5)}</span>
                  </td>
                  <td>
                    ${schedule.break_start_time && schedule.break_end_time 
                      ? `<span class="break-badge">${schedule.break_start_time.slice(0, 5)} — ${schedule.break_end_time.slice(0, 5)}</span>` 
                      : '—'}
                  </td>
                  <td>${schedule.slot_duration || 15} мин</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Всего рабочих дней: ${filtered.length}</p>
          <p>Документ сформирован автоматически системой управления записями</p>
        </div>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    
    toast({
      title: "Печать расписания",
      description: `Подготовлено к печати: ${filtered.length} рабочих дней`,
    });
  };

  const exportScheduleToExcel = () => {
    const filtered = getFilteredSchedule();
    
    const dataForExport = filtered.map((schedule, index) => {
      const date = new Date(schedule.schedule_date + 'T00:00:00');
      return {
        '№': index + 1,
        'Дата': date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        'День недели': date.toLocaleDateString('ru-RU', { weekday: 'long' }),
        'Время начала': schedule.start_time.slice(0, 5),
        'Время окончания': schedule.end_time.slice(0, 5),
        'Перерыв с': schedule.break_start_time ? schedule.break_start_time.slice(0, 5) : '—',
        'Перерыв до': schedule.break_end_time ? schedule.break_end_time.slice(0, 5) : '—',
        'Длительность слота (мин)': schedule.slot_duration || 15
      };
    });

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Расписание');

    const fileName = `Расписание_${doctorInfo.full_name}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Экспорт завершен",
      description: `Экспортировано: ${dataForExport.length} рабочих дней`,
    });
  };

  const getFilteredSchedule = () => {
    return dailySchedules.filter((schedule: any) => {
      const scheduleDate = schedule.schedule_date;
      return scheduleDate >= scheduleFilterFrom && scheduleDate <= scheduleFilterTo;
    }).sort((a: any, b: any) => a.schedule_date.localeCompare(b.schedule_date));
  };

  const handleCloneAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cloneDialog.appointment || !cloneDialog.newDate || !cloneDialog.newTime) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
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
          description: cloneDialog.newDescription,
          created_by: 2,
          skip_slot_check: false
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
        if (data.appointment) {
          setAppointments(prev => [...prev, data.appointment]);
        } else {
          loadAppointments(doctorInfo.id);
        }
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось клонировать запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const loadAvailableSlotsForNewAppointment = async (date: string) => {
    if (!doctorInfo) return;

    if (bulkSlotsCacheRef.current[date]) {
      setNewAppointmentDialog(prev => ({ ...prev, availableSlots: bulkSlotsCacheRef.current[date] }));
      return;
    }
    if (dialogSlotsCacheRef.current[date]) {
      setNewAppointmentDialog(prev => ({ ...prev, availableSlots: dialogSlotsCacheRef.current[date] }));
      return;
    }
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      const slots = data.available_slots || [];
      dialogSlotsCacheRef.current[date] = slots;
      setNewAppointmentDialog(prev => ({ ...prev, availableSlots: slots }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const preloadSlotCounts = async () => {
    if (!doctorInfo) return;
    
    const days = getNext14DaysForDoctor();
    if (days.length === 0) return;
    
    const startDate = days[0].date;
    const endDate = days[days.length - 1].date;
    
    try {
      const response = await fetch(
        `${API_URLS.appointments}?action=available-slots-bulk&doctor_id=${doctorInfo.id}&start_date=${startDate}&end_date=${endDate}`
      );
      const data = await response.json();
      const slotsByDate = data.slots_by_date || {};
      
      const counts: {[key: string]: number} = {};
      days.forEach(day => {
        if (day.isWorking) {
          const dayData = slotsByDate[day.date];
          const slots = dayData?.available_slots || [];
          counts[day.date] = slots.length;
          bulkSlotsCacheRef.current[day.date] = slots;
        } else {
          counts[day.date] = 0;
        }
      });
      
      setDateSlotCounts(counts);
    } catch (error) {
      console.error('Failed to preload slot counts:', error);
      const counts: {[key: string]: number} = {};
      days.forEach(day => {
        counts[day.date] = 0;
      });
      setDateSlotCounts(counts);
    }
  };

  const getNext14DaysForDoctor = () => {
    const days = [];
    const todayStr = serverToday || new Date().toISOString().split('T')[0];
    const [y0, m0, d0] = todayStr.split('-').map(Number);
    for (let i = 0; i <= 13; i++) {
      const date = new Date(y0, m0 - 1, d0 + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
      const dayOfWeek = (date.getDay() + 6) % 7;
      
      const hasSchedule = schedules.some((s: any) => s.day_of_week === dayOfWeek && s.is_active);
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

  const logAction = async (actionType: string, details: any) => {
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

  const openRescheduleDialog = (appointment: any) => {
    setRescheduleDialog({
      open: true,
      appointment,
      newDate: '',
      newTime: '',
      availableSlots: [],
      availableDates: []
    });
  };

  const generateRescheduleDates = () => {
    const dates = [];
    const todayStr = serverToday || new Date().toISOString().split('T')[0];
    const [y0, m0, d0] = todayStr.split('-').map(Number);
    for (let i = 0; i <= 13; i++) {
      const date = new Date(y0, m0 - 1, d0 + i);
      const dateStr = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
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
    setRescheduleDialog(prev => ({ ...prev, availableDates: dates }));
  };

  const loadAvailableSlotsForReschedule = async (date: string) => {
    if (!doctorInfo) return;

    const cached = dialogSlotsCacheRef.current[date] ?? bulkSlotsCacheRef.current[date];
    if (cached) {
      setRescheduleDialog(prev => ({ ...prev, availableSlots: cached }));
      return;
    }
    
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorInfo.id}&date=${date}`);
      const data = await response.json();
      const slots = data.available_slots || [];
      dialogSlotsCacheRef.current[date] = slots;
      setRescheduleDialog(prev => ({ ...prev, availableSlots: slots }));
    } catch (error) {
      console.error('Ошибка загрузки слотов:', error);
      toast({ title: "Ошибка", description: "Не удалось загрузить доступные слоты", variant: "destructive" });
    }
  };

  const handleRescheduleAppointment = async () => {
    if (!rescheduleDialog.appointment || !rescheduleDialog.newDate || !rescheduleDialog.newTime) {
      toast({ title: "Ошибка", description: "Выберите дату и время", variant: "destructive" });
      return;
    }

    const oldDate = rescheduleDialog.appointment.appointment_date;
    const oldTime = rescheduleDialog.appointment.appointment_time;
    const newDate = rescheduleDialog.newDate;
    const newTime = rescheduleDialog.newTime;

    // ОПТИМИЗАЦИЯ: для переноса (PUT) используем встроенную проверку через check-slot
    const slotCheck = await checkSlotAvailability(
      API_URLS.appointments,
      doctorInfo.id,
      newDate,
      newTime,
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
          appointment_date: newDate,
          appointment_time: newTime
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        await logAction('Перенос записи', {
          appointment_id: rescheduleDialog.appointment.id,
          patient_name: rescheduleDialog.appointment.patient_name,
          patient_phone: rescheduleDialog.appointment.patient_phone,
          patient_snils: rescheduleDialog.appointment.patient_snils,
          old_date: oldDate,
          old_time: oldTime,
          new_date: newDate,
          new_time: newTime
        });

        toast({ 
          title: "Успешно", 
          description: `Запись перенесена на ${new Date(newDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${newTime}` 
        });
        
        setRescheduleDialog({
          open: false,
          appointment: null,
          newDate: '',
          newTime: '',
          availableSlots: [],
          availableDates: []
        });
        setAppointments(prev => prev.map(a =>
          a.id === rescheduleDialog.appointment.id
            ? { ...a, appointment_date: newDate, appointment_time: newTime }
            : a
        ));
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось перенести запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };



  const handleCreateNewAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newAppointmentDialog.date || !newAppointmentDialog.time || !newAppointmentDialog.patientName || !newAppointmentDialog.patientPhone) {
      toast({ title: "Ошибка", description: "Заполните все обязательные поля", variant: "destructive" });
      return;
    }
    const nameError = validateFullName(newAppointmentDialog.patientName);
    if (nameError) {
      setNewAppointmentNameError(nameError);
      setNameErrorModal({ open: true, message: nameError });
      return;
    }
    setNewAppointmentNameError(null);

    // ОПТИМИЗАЦИЯ: проверка слота встроена в create_appointment, убираем отдельный запрос
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
          description: newAppointmentDialog.description,
          created_by: 2,
          skip_slot_check: false
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({ 
          title: "Успешно", 
          description: `Пациент ${newAppointmentDialog.patientName} записан на ${new Date(newAppointmentDialog.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${newAppointmentDialog.time}` 
        });
        
        await logAction('Создание записи', {
          appointment_id: data.appointment?.id,
          patient_name: newAppointmentDialog.patientName,
          patient_phone: newAppointmentDialog.patientPhone,
          patient_snils: newAppointmentDialog.patientSnils,
          patient_oms: newAppointmentDialog.patientOms,
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
        setNewAppointmentNameError(null);
        if (data.appointment) {
          setAppointments(prev => [...prev, data.appointment]);
        } else {
          loadAppointments(doctorInfo.id);
        }
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось создать запись", variant: "destructive" });
      }
    } catch (err) {
      console.error('Error creating appointment:', err);
      toast({ title: "Ошибка", description: "Не удалось создать запись", variant: "destructive" });
    }
  };

  const loadDoctorsList = async () => {
    try {
      const response = await fetch(API_URLS.doctors);
      const data = await response.json();
      if (data.doctors) {
        setDoctors(data.doctors.filter((d: any) => d.id !== doctorInfo?.id && d.is_active));
      }
    } catch (err) {
      console.error('Error loading doctors:', err);
    }
  };

  const loadAvailableDatesForOtherDoctor = async (doctorId: string) => {
    if (!doctorId) return;
    setOtherDoctorDialog(prev => ({ ...prev, isLoadingDates: true, availableDates: [], date: '', time: '', availableSlots: [] }));
    try {
      const startDate = serverToday || new Date().toISOString().split('T')[0];
      const [sy, sm, sd] = startDate.split('-').map(Number);
      const endDateObj = new Date(sy, sm - 1, sd + 14);
      const endDate = `${endDateObj.getFullYear()}-${String(endDateObj.getMonth()+1).padStart(2,'0')}-${String(endDateObj.getDate()).padStart(2,'0')}`;
      const response = await fetch(`${API_URLS.appointments}?action=available-slots-bulk&doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}`);
      const data = await response.json();
      if (data.slots_by_date) {
        const datesWithSlots = Object.entries(data.slots_by_date)
          .filter(([, info]: [string, any]) => info.available_slots && info.available_slots.length > 0)
          .map(([date]) => date)
          .sort();
        setOtherDoctorDialog(prev => ({ ...prev, availableDates: datesWithSlots, isLoadingDates: false }));
      } else {
        setOtherDoctorDialog(prev => ({ ...prev, isLoadingDates: false }));
      }
    } catch (err) {
      console.error('Error loading available dates:', err);
      setOtherDoctorDialog(prev => ({ ...prev, isLoadingDates: false }));
    }
  };

  const loadAvailableSlotsForOtherDoctor = async (doctorId: string, date: string) => {
    if (!doctorId || !date) return;
    setOtherDoctorDialog(prev => ({ ...prev, isLoadingSlots: true, time: '', availableSlots: [] }));
    try {
      const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorId}&date=${date}`);
      const data = await response.json();
      setOtherDoctorDialog(prev => ({ ...prev, availableSlots: data.available_slots || [], isLoadingSlots: false }));
    } catch (err) {
      console.error('Error loading slots for other doctor:', err);
      setOtherDoctorDialog(prev => ({ ...prev, isLoadingSlots: false }));
    }
  };

  const handleCreateAppointmentForOtherDoctor = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otherDoctorDialog.date || !otherDoctorDialog.time) {
      toast({ title: "Ошибка", description: "Заполните дату и время приема", variant: "destructive" });
      return;
    }

    if (!otherDoctorDialog.patientName || !otherDoctorDialog.patientPhone) {
      toast({ title: "Ошибка", description: "Заполните ФИО и телефон пациента", variant: "destructive" });
      return;
    }

    if (!otherDoctorDialog.selectedDoctorId) {
      toast({ title: "Ошибка", description: "Выберите врача", variant: "destructive" });
      return;
    }

    const slotCheckResult = await checkSlotAvailability(
      API_URLS.appointments,
      parseInt(otherDoctorDialog.selectedDoctorId),
      otherDoctorDialog.date,
      otherDoctorDialog.time
    );

    if (!slotCheckResult.available) {
      showSlotErrorDialog(slotCheckResult.error || 'Слот недоступен');
      return;
    }

    try {
      const response = await fetch(API_URLS.appointments, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          doctor_id: otherDoctorDialog.selectedDoctorId,
          appointment_date: otherDoctorDialog.date,
          appointment_time: otherDoctorDialog.time,
          patient_name: otherDoctorDialog.patientName,
          patient_phone: otherDoctorDialog.patientPhone,
          patient_snils: otherDoctorDialog.patientSnils,
          patient_oms: otherDoctorDialog.patientOms,
          description: otherDoctorDialog.description,
          created_by_doctor_id: doctorInfo.id
        })
      });
      const data = await response.json();
      if (data.success) {
        const selectedDoctor = doctors.find(d => d.id === parseInt(otherDoctorDialog.selectedDoctorId));
        toast({ 
          title: "Успешно", 
          description: `Пациент ${otherDoctorDialog.patientName} записан к врачу ${selectedDoctor?.full_name} на ${new Date(otherDoctorDialog.date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в ${otherDoctorDialog.time}` 
        });
        
        await logAction('Создание записи к другому врачу', {
          appointment_id: data.appointment?.id,
          doctor_id: otherDoctorDialog.selectedDoctorId,
          doctor_name: selectedDoctor?.full_name,
          patient_name: otherDoctorDialog.patientName,
          patient_phone: otherDoctorDialog.patientPhone,
          patient_snils: otherDoctorDialog.patientSnils,
          patient_oms: otherDoctorDialog.patientOms,
          appointment_date: otherDoctorDialog.date,
          appointment_time: otherDoctorDialog.time,
          description: otherDoctorDialog.description
        });
        
        setOtherDoctorDialog({
          open: false,
          selectedDoctorId: '',
          date: '',
          time: '',
          patientName: '',
          patientPhone: '',
          patientSnils: '',
          patientOms: '',
          description: '',
          availableSlots: [],
          availableDates: [],
          isLoadingDates: false,
          isLoadingSlots: false
        });
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось создать запись", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const exportToExcel = () => {
    const dataForExport = filteredAppointments
      .sort((a: any, b: any) => {
        const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
        if (dateCompare !== 0) return dateCompare;
        return a.appointment_time.localeCompare(b.appointment_time);
      })
      .map((app: any) => ({
        'ID записи': app.id,
        'Дата': new Date(app.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        'День недели': new Date(app.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long' }),
        'Время записи': app.appointment_time.slice(0, 5),
        'Время завершения': app.completed_at ? new Date(app.completed_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '—',
        'ФИО пациента': app.patient_name,
        'Телефон': app.patient_phone,
        'СНИЛС': app.patient_snils || '—',
        'ОМС': app.patient_oms || '—',
        'Описание': app.description || '—',
        'Статус': app.status === 'scheduled' ? 'Запланировано' : 
                  app.status === 'completed' ? 'Завершено' : 'Отменено',
        'Дата создания': app.created_at ? new Date(app.created_at).toLocaleString('ru-RU') : '—'
      }));

    const worksheet = XLSX.utils.json_to_sheet(dataForExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Записи пациентов');

    const fileName = `Записи_${doctorInfo.full_name}_${new Date().toLocaleDateString('ru-RU').replace(/\./g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);

    toast({
      title: "Экспорт завершен",
      description: `Экспортировано записей: ${dataForExport.length}`,
    });
  };

  const printAppointments = () => {
    const filtered = appointments.filter((app: any) => {
      const statusMatch = statusFilter === 'all' || app.status === statusFilter;
      const dateMatch = app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo;
      const searchMatch = searchQuery === '' || 
        app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.patient_phone.includes(searchQuery) ||
        (app.patient_snils && app.patient_snils.includes(searchQuery));
      return statusMatch && dateMatch && searchMatch;
    });
    
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Записи пациентов - ${doctorInfo.full_name}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            font-size: 12px;
          }
          h1 {
            text-align: center;
            font-size: 18px;
            margin-bottom: 10px;
          }
          .info {
            text-align: center;
            margin-bottom: 20px;
            font-size: 11px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #f2f2f2;
            font-weight: bold;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .status-scheduled {
            color: #ca8a04;
            font-weight: bold;
          }
          .status-completed {
            color: #16a34a;
            font-weight: bold;
          }
          .status-cancelled {
            color: #dc2626;
            font-weight: bold;
          }
          @media print {
            body { margin: 10px; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>Записи пациентов</h1>
        <div class="info">
          <div>Врач: ${doctorInfo.full_name}</div>
          <div>Специальность: ${doctorInfo.specialization || 'Не указана'}</div>
          <div>Дата печати: ${new Date().toLocaleString('ru-RU')}</div>
          <div>Всего записей: ${filtered.length}</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Дата</th>
              <th>Время</th>
              <th>Пациент</th>
              <th>Телефон</th>
              <th>СНИЛС</th>
              <th>ОМС</th>
              <th>Статус</th>
              <th>Описание</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map((app, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${new Date(app.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })}</td>
                <td>${app.appointment_time.slice(0, 5)}</td>
                <td>${app.patient_name}</td>
                <td>${app.patient_phone}</td>
                <td>${app.patient_snils || '—'}</td>
                <td>${app.patient_oms || '—'}</td>
                <td class="status-${app.status}">
                  ${app.status === 'scheduled' ? 'Запланировано' : 
                    app.status === 'completed' ? 'Завершено' : 'Отменено'}
                </td>
                <td>${app.description || '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 250);
    }
    
    toast({
      title: "Печать",
      description: `Подготовлено к печати: ${filtered.length} записей`,
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center flex items-center justify-center gap-2">
              <Icon name="Stethoscope" size={28} className="text-primary" />
              Вход для врачей
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <Input
                placeholder="Логин"
                value={loginForm.login}
                onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                required
              />
              <div className="relative">
                <Input
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  required
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute right-0 top-0 h-10 px-3 hover:bg-transparent"
                >
                  <Icon name={showLoginPassword ? "EyeOff" : "Eye"} size={16} className="text-muted-foreground" />
                </Button>
              </div>
              <Button type="submit" className="w-full">Войти</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  const filteredAppointments = appointments.filter((app: any) => {
    const statusMatch = statusFilter === 'all' || app.status === statusFilter;
    const dateMatch = app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo;
    const searchMatch = searchQuery === '' || 
      app.patient_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.patient_phone.includes(searchQuery) ||
      (app.patient_snils && app.patient_snils.includes(searchQuery)) ||
      (app.patient_oms && app.patient_oms.includes(searchQuery));
    return statusMatch && dateMatch && searchMatch;
  });

  const groupedAppointments = filteredAppointments.reduce((acc: any, app: any) => {
    if (!acc[app.appointment_date]) {
      acc[app.appointment_date] = [];
    }
    acc[app.appointment_date].push(app);
    return acc;
  }, {});

  const scheduledCount = appointments.filter((app: any) => app.status === 'scheduled').length;
  const completedCount = appointments.filter((app: any) => app.status === 'completed').length;
  const cancelledCount = appointments.filter((app: any) => app.status === 'cancelled').length;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="Stethoscope" size={32} className="text-primary" />
            <div>
              <h1 className="text-xl font-bold">{doctorInfo?.full_name}</h1>
              <p className="text-sm text-muted-foreground">{doctorInfo?.position}</p>
            </div>
            {isRegistrarAccess && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                <Icon name="UserCog" size={16} className="text-blue-600" />
                <span className="text-xs font-semibold text-blue-900">Доступ регистратора</span>
              </div>
            )}
            {isMDoctorAccess && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 border border-purple-200 rounded-lg">
                <Icon name="ShieldCheck" size={16} className="text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">Доступ главного врача</span>
              </div>
            )}

          </div>
          <div className="flex gap-2 items-center">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border">
              <span className="text-xs font-medium text-gray-700">Автообновление</span>
              <Button
                size="sm"
                variant={autoRefreshEnabled ? "default" : "outline"}
                onClick={toggleAutoRefresh}
                className="h-7 px-2"
              >
                <Icon name={autoRefreshEnabled ? "Pause" : "Play"} size={14} />
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={toggleSound}
                disabled={!autoRefreshEnabled}
                className="h-7 px-2"
                title={soundEnabled ? "Звук вкл" : "Звук выкл"}
              >
                <Icon name={soundEnabled ? "Volume2" : "VolumeX"} size={14} />
              </Button>
              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!autoRefreshEnabled}
                    className="h-7 px-2 text-xs"
                  >
                    {checkInterval}с
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-sm">
                  <DialogHeader>
                    <DialogTitle>Интервал проверки</DialogTitle>
                    <DialogDescription>
                      Выберите как часто проверять наличие новых записей
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-3">
                    {[15, 30, 60, 90, 120, 300, 600, 900].map((seconds) => (
                      <Button
                        key={seconds}
                        variant={checkInterval === seconds ? 'default' : 'outline'}
                        onClick={() => changeCheckInterval(seconds)}
                        className="h-16 flex flex-col"
                      >
                        <span className="text-2xl font-bold">{seconds}</span>
                        <span className="text-xs">секунд</span>
                      </Button>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                size="sm"
                variant="outline"
                onClick={() => loadAppointments(doctorInfo.id)}
                className="h-7 px-2 bg-orange-500 hover:bg-orange-600 text-white border-orange-600"
                title="Обновить записи вручную"
              >
                <Icon name="RefreshCw" size={14} />
              </Button>
            </div>
            <Button variant="default" asChild className="bg-blue-600 hover:bg-blue-700">
              <a href="/doctor-guide">
                <Icon name="BookOpen" size={18} className="mr-2" />
                Инструкция
              </a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/">
                <Icon name="Home" size={18} className="mr-2" />
                На главную
              </a>
            </Button>
            <Button variant="destructive" onClick={handleLogout}>
              <Icon name="LogOut" size={18} className="mr-2" />
              Выход
            </Button>
          </div>
        </div>
      </header>

      <Tabs defaultValue="calendar">
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-sm border-b border-border shadow-md">
          <div className="container mx-auto px-4 py-3">
            <TabsList className={`grid w-full ${isRegistrarAccess && !isMDoctorAccess ? 'grid-cols-2' : 'grid-cols-3'} h-auto p-1 bg-gradient-to-r from-blue-50 to-indigo-50`}>
              <TabsTrigger 
                value="calendar"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
              >
                <Icon name="Calendar" size={18} className="mr-1.5" />
                Календарь
              </TabsTrigger>
              <TabsTrigger 
                value="schedule"
                className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
              >
                <Icon name="Clock" size={18} className="mr-1.5" />
                Расписание
              </TabsTrigger>
              {(!isRegistrarAccess || isMDoctorAccess) && (
                <TabsTrigger 
                  value="appointments"
                  className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-600 data-[state=active]:text-white data-[state=active]:shadow-md py-2 px-4 font-semibold text-sm transition-all"
                >
                  <Icon name="Users" size={18} className="mr-1.5" />
                  Записи пациентов
                </TabsTrigger>
              )}
            </TabsList>
          </div>

        </div>

        <section className="pb-12">
          <div className="container mx-auto px-4">

            <TabsContent value="calendar" className="mt-6">
              <Card className="mb-6 bg-gradient-to-r from-green-50 to-teal-50 border-green-200">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Icon name="Calendar" size={24} className="text-green-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between cursor-pointer" onClick={() => setCalendarInstructionOpen(!calendarInstructionOpen)}>
                        <h3 className="text-base font-bold text-green-900">📅 Инструкция: Годовой календарь работы</h3>
                        <Icon 
                          name={calendarInstructionOpen ? "ChevronUp" : "ChevronDown"} 
                          size={20} 
                          className="text-green-600 flex-shrink-0"
                        />
                      </div>
                      
                      {calendarInstructionOpen && (
                        <div className="space-y-3 text-sm text-green-800 mt-3">
                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="font-semibold mb-1 text-green-900">🎯 Для чего нужен календарь?</p>
                            <p className="text-green-700">
                              Годовой календарь позволяет управлять рабочими и выходными днями на весь год вперёд. 
                              Отмечайте отпуска, праздники и особые дни — пациенты автоматически не увидят эти даты при записи.
                            </p>
                          </div>

                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="font-semibold mb-2 text-green-900">📋 Как работать с календарём:</p>
                            <ul className="list-decimal list-inside space-y-1.5 text-green-700 ml-2">
                              <li><strong>Один клик по дате</strong> — переключает день между рабочим и выходным</li>
                              <li><strong>Зелёная ячейка</strong> — рабочий день, пациенты могут записываться</li>
                              <li><strong>Красная ячейка</strong> — выходной день, записи заблокированы</li>
                              <li><strong>Кнопка "Получить слоты"</strong> — загружает статистику свободных/занятых слотов на 2 месяца</li>
                              <li><strong>Цифры в ячейке</strong> (например, 5/3) — свободных слотов / занятых слотов на этот день</li>
                            </ul>
                          </div>

                          <div className="bg-white/60 p-3 rounded-lg">
                            <p className="font-semibold mb-1 text-green-900">⚡ Важно знать!</p>
                            <p className="text-green-700">
                              <strong>Календарь главнее расписания!</strong> Если вы отметили день как выходной в календаре, 
                              пациенты не смогут записаться, даже если в еженедельном расписании этот день рабочий. 
                              Так вы можете легко блокировать отдельные даты без изменения всего расписания.
                            </p>
                          </div>

                          <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg">
                            <p className="font-semibold mb-1 text-amber-900">💡 Примеры использования:</p>
                            <div className="text-amber-800 text-xs space-y-1.5">
                              <p><strong>Отпуск:</strong> Кликните по всем датам с 1 по 14 июля — они станут красными, пациенты не увидят эти дни</p>
                              <p><strong>Праздники:</strong> 1 января, 8 марта → отметьте как выходные одним кликом</p>
                              <p><strong>Внеплановый день:</strong> Во вторник 15 мая нужно уехать? Кликните на 15 мая → день закрыт для записи</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 text-xs mt-4 pt-3 border-t border-green-200">
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-green-200 border-2 border-green-400 rounded shadow-sm"></div>
                          <span className="text-green-900 font-medium">Рабочий день</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <div className="w-5 h-5 bg-red-200 border-2 border-red-400 rounded shadow-sm"></div>
                          <span className="text-red-900 font-medium">Выходной день</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-4 mb-6 items-center">
                <div>
                  <label className="text-sm font-medium mb-2 block">Выберите год:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 border rounded-lg"
                  >
                    {[2025, 2026, 2027, 2028, 2029, 2030].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-6">
                  <Button
                    onClick={loadSlotStatsForYear}
                    disabled={isLoadingSlots}
                    size="lg"
                  >
                    {isLoadingSlots ? (
                      <>
                        <Icon name="Loader2" size={20} className="mr-2 animate-spin" />
                        Загрузка...
                      </>
                    ) : (
                      <>
                        <Icon name="BarChart3" size={20} className="mr-2" />
                        Получить слоты
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {isLoadingSlots ? (
                <Card className="bg-blue-50 border-blue-200">
                  <CardContent className="py-12 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                      <div className="w-full max-w-md">
                        <p className="text-lg font-semibold text-blue-900">Идет получение данных</p>
                        <p className="text-sm text-blue-700 mt-1">Загружаем статистику слотов на текущий и следующий месяц...</p>
                        <div className="mt-4">
                          <div className="flex justify-between text-sm text-blue-800 mb-2">
                            <span>Прогресс загрузки</span>
                            <span className="font-bold">{loadingProgress}%</span>
                          </div>
                          <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                            <div 
                              className="bg-blue-600 h-full rounded-full transition-all duration-300"
                              style={{ width: `${loadingProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 12 }, (_, i) => i).map(monthIndex => {
                    const monthName = new Date(selectedYear, monthIndex).toLocaleString('ru-RU', { month: 'long' });
                    const daysInMonth = new Date(selectedYear, monthIndex + 1, 0).getDate();
                  const firstDayOfWeek = (new Date(selectedYear, monthIndex, 1).getDay() + 6) % 7;
                  
                  return (
                    <Card key={monthIndex} className="overflow-hidden">
                      <CardHeader className="pb-2 pt-3 px-3">
                        <CardTitle className="text-sm capitalize font-semibold">{monthName} {selectedYear}</CardTitle>
                      </CardHeader>
                      <CardContent className="px-3 pb-3">
                        <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] mb-1">
                          <div className="font-semibold">Пн</div>
                          <div className="font-semibold">Вт</div>
                          <div className="font-semibold">Ср</div>
                          <div className="font-semibold">Чт</div>
                          <div className="font-semibold">Пт</div>
                          <div className="font-semibold text-red-600">Сб</div>
                          <div className="font-semibold text-red-600">Вс</div>
                        </div>
                        <div className="grid grid-cols-7 gap-0.5">
                          {Array.from({ length: firstDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="h-8"></div>
                          ))}
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const date = `${selectedYear}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                            const isWorking = calendarData[date]?.is_working ?? true;
                            const dayOfWeek = new Date(selectedYear, monthIndex, day).getDay();
                            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                            const today = new Date().toISOString().split('T')[0];
                            const isToday = date === today;
                            const stats = slotStats[date];
                            
                            return (
                              <button
                                key={day}
                                onClick={() => toggleCalendarDay(date)}
                                className={`h-auto min-h-[32px] text-[10px] rounded transition-all flex flex-col items-center justify-center p-0.5 ${
                                  isToday ? 'ring-1 ring-primary' : ''
                                } ${
                                  isWorking 
                                    ? 'bg-green-100 hover:bg-green-200 text-green-800 border border-green-300' 
                                    : 'bg-red-100 hover:bg-red-200 text-red-800 border border-red-300'
                                } ${
                                  isWeekend && isWorking ? 'opacity-70' : ''
                                }`}
                                title={isWorking ? 'Рабочий день (нажмите для выходного)' : 'Выходной (нажмите для рабочего)'}
                              >
                                <span className="font-medium">{day}</span>
                                {stats && (stats.available > 0 || stats.booked > 0) && (
                                  <span className="text-[8px] font-semibold mt-0.5">
                                    {stats.available}/{stats.booked}
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="schedule" className="mt-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold">Рабочее расписание</h2>
                <div className="flex gap-2">
                  <Dialog open={isDailyScheduleOpen} onOpenChange={setIsDailyScheduleOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="lg"
                        variant="secondary"
                        title="Добавить день в расписание"
                      >
                        <Icon name="Plus" size={20} className="mr-2" />
                        Добавить день
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить день</DialogTitle>
                      <DialogDescription>
                        Настройте индивидуальное расписание для конкретной даты
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleCreateDailySchedule} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Дата</label>
                        <Input
                          type="date"
                          value={dailyScheduleForm.schedule_date}
                          min={new Date().toISOString().split('T')[0]}
                          onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, schedule_date: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время начала</label>
                        <Input
                          type="time"
                          value={dailyScheduleForm.start_time}
                          onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время окончания</label>
                        <Input
                          type="time"
                          value={dailyScheduleForm.end_time}
                          onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, end_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Длительность слота (минуты)</label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          value={dailyScheduleForm.slot_duration}
                          onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, slot_duration: parseInt(e.target.value) || 15 })}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Интервал времени для одного приёма (например, 15, 20, 22, 30 минут)
                        </p>
                      </div>
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">Перерыв (необязательно)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Начало перерыва</label>
                            <Input
                              type="time"
                              value={dailyScheduleForm.break_start_time}
                              onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, break_start_time: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Конец перерыва</label>
                            <Input
                              type="time"
                              value={dailyScheduleForm.break_end_time}
                              onChange={(e) => setDailyScheduleForm({ ...dailyScheduleForm, break_end_time: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Сохранить</Button>
                    </form>
                  </DialogContent>
                  </Dialog>
                  <Dialog open={isBulkGenerateOpen} onOpenChange={setIsBulkGenerateOpen}>
                    <DialogTrigger asChild>
                      <Button
                        size="lg"
                        variant="secondary"
                        title="Создать несколько дней с одинаковыми параметрами"
                      >
                        <Icon name="Calendar" size={20} className="mr-2" />
                        Сгенерировать дни
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Массовое создание дней</DialogTitle>
                        <DialogDescription>
                          Создайте несколько дней сразу с одинаковыми параметрами расписания
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={handleBulkGenerateDays} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Дата начала</label>
                            <Input
                              type="date"
                              value={bulkGenerateForm.start_date}
                              min={new Date().toISOString().split('T')[0]}
                              onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, start_date: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Дата окончания</label>
                            <Input
                              type="date"
                              value={bulkGenerateForm.end_date}
                              min={bulkGenerateForm.start_date}
                              onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, end_date: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium mb-2 block">Время начала</label>
                            <Input
                              type="time"
                              value={bulkGenerateForm.start_time}
                              onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, start_time: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <label className="text-sm font-medium mb-2 block">Время окончания</label>
                            <Input
                              type="time"
                              value={bulkGenerateForm.end_time}
                              onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, end_time: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">Длительность слота (минуты)</label>
                          <Input
                            type="number"
                            min="1"
                            max="120"
                            step="1"
                            value={bulkGenerateForm.slot_duration}
                            onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, slot_duration: parseInt(e.target.value) || 15 })}
                            required
                          />
                        </div>
                        <div className="border-t pt-4">
                          <label className="text-sm font-medium mb-2 block">Перерыв (необязательно)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Начало перерыва</label>
                              <Input
                                type="time"
                                value={bulkGenerateForm.break_start_time}
                                onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, break_start_time: e.target.value })}
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground mb-1 block">Конец перерыва</label>
                              <Input
                                type="time"
                                value={bulkGenerateForm.break_end_time}
                                onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, break_end_time: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id="bulk-is-active"
                            checked={bulkGenerateForm.is_active}
                            onChange={(e) => setBulkGenerateForm({ ...bulkGenerateForm, is_active: e.target.checked })}
                            className="w-4 h-4"
                          />
                          <label htmlFor="bulk-is-active" className="text-sm font-medium cursor-pointer">
                            Создать дни как рабочие (активные)
                          </label>
                        </div>
                        <Button type="submit" className="w-full">Создать дни</Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Изменить время приема</DialogTitle>
                  </DialogHeader>
                  {editingSchedule && (
                    <form onSubmit={handleEditSchedule} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">День недели</label>
                        <Input
                          value={DAYS_OF_WEEK[editingSchedule.day_of_week]}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время начала</label>
                        <Input
                          type="time"
                          value={editingSchedule.start_time?.slice(0, 5) || '08:00'}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время окончания</label>
                        <Input
                          type="time"
                          value={editingSchedule.end_time?.slice(0, 5) || '17:00'}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, end_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Длительность слота (минуты)</label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          value={editingSchedule.slot_duration || 15}
                          onChange={(e) => setEditingSchedule({ ...editingSchedule, slot_duration: parseInt(e.target.value) || 15 })}
                          required
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Интервал времени для одного приёма
                        </p>
                      </div>
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">Перерыв (необязательно)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Начало перерыва</label>
                            <Input
                              type="time"
                              value={editingSchedule.break_start_time?.slice(0, 5) || ''}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, break_start_time: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Конец перерыва</label>
                            <Input
                              type="time"
                              value={editingSchedule.break_end_time?.slice(0, 5) || ''}
                              onChange={(e) => setEditingSchedule({ ...editingSchedule, break_end_time: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Сохранить изменения</Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Копировать расписание</DialogTitle>
                    <DialogDescription>
                      Выберите дни, на которые хотите скопировать это расписание
                    </DialogDescription>
                  </DialogHeader>
                  {copyFromSchedule && (
                    <div className="space-y-4">
                      <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="pt-4 space-y-2">
                          <p className="text-sm font-medium text-blue-900">
                            Копируется: {DAYS_OF_WEEK[copyFromSchedule.day_of_week]}
                          </p>
                          <p className="text-sm text-blue-700">
                            <Icon name="Clock" size={14} className="inline mr-1" />
                            {copyFromSchedule.start_time.slice(0, 5)} - {copyFromSchedule.end_time.slice(0, 5)}
                          </p>
                          {copyFromSchedule.break_start_time && copyFromSchedule.break_end_time && (
                            <p className="text-sm text-orange-700">
                              <Icon name="Coffee" size={14} className="inline mr-1" />
                              Перерыв: {copyFromSchedule.break_start_time.slice(0, 5)} - {copyFromSchedule.break_end_time.slice(0, 5)}
                            </p>
                          )}
                        </CardContent>
                      </Card>

                      <div className="space-y-2">
                        <p className="text-sm font-medium">Выберите дни недели:</p>
                        <div className="grid grid-cols-1 gap-2">
                          {DAYS_OF_WEEK.map((day, index) => {
                            const hasSchedule = schedules.some(s => s.day_of_week === index);
                            const isCurrentDay = index === copyFromSchedule.day_of_week;
                            
                            return (
                              <label
                                key={index}
                                className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                                  isCurrentDay 
                                    ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                                    : selectedDaysToCopy.includes(index)
                                    ? 'bg-primary/10 border-primary'
                                    : 'hover:bg-gray-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedDaysToCopy.includes(index)}
                                  onChange={() => toggleDaySelection(index)}
                                  disabled={isCurrentDay}
                                  className="w-4 h-4"
                                />
                                <div className="flex-1">
                                  <span className="font-medium">{day}</span>
                                  {hasSchedule && !isCurrentDay && (
                                    <span className="ml-2 text-xs text-orange-600">
                                      (будет перезаписан)
                                    </span>
                                  )}
                                  {isCurrentDay && (
                                    <span className="ml-2 text-xs text-gray-500">
                                      (текущий день)
                                    </span>
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setIsCopyDialogOpen(false)}
                        >
                          Отмена
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={handleApplyCopy}
                          disabled={selectedDaysToCopy.length === 0}
                        >
                          <Icon name="Copy" size={16} className="mr-2" />
                          Копировать на {selectedDaysToCopy.length} {selectedDaysToCopy.length === 1 ? 'день' : 'дней'}
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              <Dialog open={isDailyEditOpen} onOpenChange={setIsDailyEditOpen}>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Изменить расписание дня</DialogTitle>
                  </DialogHeader>
                  {editingDailySchedule && (
                    <form onSubmit={handleEditDailySchedule} className="space-y-4">
                      <div>
                        <label className="text-sm font-medium mb-2 block">Дата</label>
                        <Input
                          value={new Date(editingDailySchedule.schedule_date + 'T00:00:00').toLocaleDateString('ru-RU')}
                          disabled
                          className="bg-muted"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время начала</label>
                        <Input
                          type="time"
                          value={editingDailySchedule.start_time?.slice(0, 5) || '08:00'}
                          onChange={(e) => setEditingDailySchedule({ ...editingDailySchedule, start_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Время окончания</label>
                        <Input
                          type="time"
                          value={editingDailySchedule.end_time?.slice(0, 5) || '17:00'}
                          onChange={(e) => setEditingDailySchedule({ ...editingDailySchedule, end_time: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium mb-2 block">Длительность слота (минуты)</label>
                        <Input
                          type="number"
                          min="1"
                          max="120"
                          step="1"
                          value={editingDailySchedule.slot_duration || 15}
                          onChange={(e) => setEditingDailySchedule({ ...editingDailySchedule, slot_duration: parseInt(e.target.value) || 15 })}
                          required
                        />
                      </div>
                      <div className="border-t pt-4">
                        <label className="text-sm font-medium mb-2 block">Перерыв (необязательно)</label>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Начало перерыва</label>
                            <Input
                              type="time"
                              value={editingDailySchedule.break_start_time?.slice(0, 5) || ''}
                              onChange={(e) => setEditingDailySchedule({ ...editingDailySchedule, break_start_time: e.target.value })}
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1 block">Конец перерыва</label>
                            <Input
                              type="time"
                              value={editingDailySchedule.break_end_time?.slice(0, 5) || ''}
                              onChange={(e) => setEditingDailySchedule({ ...editingDailySchedule, break_end_time: e.target.value })}
                            />
                          </div>
                        </div>
                      </div>
                      <Button type="submit" className="w-full">Сохранить изменения</Button>
                    </form>
                  )}
                </DialogContent>
              </Dialog>

              <div className="mb-4">
                <div className="flex flex-wrap gap-2 items-end justify-between">
                  <div className="flex flex-wrap gap-2 items-end">
                    <div className="w-[165px]">
                      <label className="block text-xs font-medium mb-1">Фильтр с даты</label>
                      <Input
                        type="date"
                        value={scheduleFilterFrom}
                        onChange={(e) => setScheduleFilterFrom(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="h-8 text-xs w-full"
                      />
                    </div>
                    <div className="w-[165px]">
                      <label className="block text-xs font-medium mb-1">Фильтр по дату</label>
                      <Input
                        type="date"
                        value={scheduleFilterTo}
                        onChange={(e) => setScheduleFilterTo(e.target.value)}
                        min={scheduleFilterFrom}
                        className="h-8 text-xs w-full"
                      />
                    </div>
                    <div className="flex gap-1.5">
                      <Button
                        variant="outline"
                        onClick={() => setScheduleQuickFilter('today')}
                        size="sm"
                        className="h-8 text-xs px-2"
                      >
                        <Icon name="Calendar" size={12} className="mr-1" />
                        Сегодня
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setScheduleQuickFilter('week')}
                        size="sm"
                        className="h-8 text-xs px-2"
                      >
                        <Icon name="CalendarDays" size={12} className="mr-1" />
                        Неделя
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setScheduleQuickFilter('month')}
                        size="sm"
                        className="h-8 text-xs px-2"
                      >
                        <Icon name="CalendarRange" size={12} className="mr-1" />
                        Месяц
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={printSchedule}
                      variant="default"
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 h-8 text-xs px-3"
                    >
                      <Icon name="Printer" size={12} className="mr-1.5" />
                      Печать расписания
                    </Button>
                    <Button
                      onClick={exportScheduleToExcel}
                      variant="default"
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 h-8 text-xs px-3"
                    >
                      <Icon name="FileSpreadsheet" size={12} className="mr-1.5" />
                      Экспорт в Excel
                    </Button>
                  </div>
                </div>
              </div>

              <Card>
                <CardHeader className="border-b py-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Icon name="Calendar" size={18} />
                    Рабочее расписание ({getFilteredSchedule().length} дней)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="h-9">
                        <TableHead className="w-[110px] text-xs py-2">Дата</TableHead>
                        <TableHead className="w-[90px] text-xs py-2">День</TableHead>
                        <TableHead className="w-[90px] text-xs py-2">Статус</TableHead>
                        <TableHead className="w-[240px] text-xs py-2">Рабочее время</TableHead>
                        <TableHead className="w-[70px] text-xs py-2">Слот</TableHead>
                        <TableHead className="w-[110px] text-xs py-2">Перерыв</TableHead>
                        <TableHead className="text-right text-xs py-2">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getFilteredSchedule().map((schedule: any) => {
                        const dateObj = new Date(schedule.schedule_date + 'T00:00:00');
                        const dayName = dateObj.toLocaleDateString('ru-RU', { weekday: 'short' });
                        const dateFormatted = dateObj.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
                        
                        return (
                          <TableRow key={schedule.id} className={`${!schedule.is_active ? 'opacity-50' : ''} text-xs h-10`}>
                            <TableCell className="font-medium py-1.5">{dateFormatted}</TableCell>
                            <TableCell className="capitalize py-1.5">{dayName}</TableCell>
                            <TableCell className="py-1.5">
                              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                                schedule.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                              }`}>
                                {schedule.is_active ? 'Работа' : 'Выходной'}
                              </span>
                            </TableCell>
                            <TableCell className="py-1.5">{schedule.start_time.slice(0, 5)} — {schedule.end_time.slice(0, 5)}</TableCell>
                            <TableCell className="py-1.5">{schedule.slot_duration} м</TableCell>
                            <TableCell className="py-1.5">
                              {schedule.break_start_time && schedule.break_end_time 
                                ? `${schedule.break_start_time.slice(0, 5)}—${schedule.break_end_time.slice(0, 5)}`
                                : '—'
                              }
                            </TableCell>
                            <TableCell className="py-1.5">
                              <div className="flex gap-1 justify-end">
                                {!schedule.is_generated && (
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setEditingDailySchedule(schedule);
                                      setIsDailyEditOpen(true);
                                    }}
                                    title="Изменить параметры дня"
                                    className="h-7 w-7 p-0"
                                  >
                                    <Icon name="Edit" size={12} />
                                  </Button>
                                )}
                                {!schedule.is_generated && (
                                  <Button 
                                    size="sm" 
                                    variant={schedule.is_active ? "outline" : "default"}
                                    onClick={() => handleToggleDailyActive(schedule.id, schedule.is_active)}
                                    className="h-7 w-7 p-0"
                                    title={schedule.is_active ? "Деактивировать" : "Активировать"}
                                  >
                                    <Icon name={schedule.is_active ? "PauseCircle" : "PlayCircle"} size={12} />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {!isRegistrarAccess && (
            <TabsContent value="appointments" className="mt-6">
              <div className="mb-6 flex flex-col" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
                <div className="flex-shrink-0">
                  <h3 className="text-2xl font-bold mb-4">Записи пациентов</h3>
                
                <div className="flex gap-2 items-center flex-wrap mb-4">
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                    <Icon name="Search" size={14} className="text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="Поиск по ФИО, телефону, СНИЛС, ОМС..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="h-7 w-[200px] text-xs"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2 bg-muted/30 px-3 py-1.5 rounded-lg border">
                    <Icon name="Calendar" size={14} className="text-muted-foreground" />
                    <span className="text-xs font-medium text-muted-foreground">С</span>
                    <Input
                      type="date"
                      value={dateFilterFrom}
                      onChange={(e) => setDateFilterFrom(e.target.value)}
                      className="h-7 w-[130px] text-xs"
                    />
                    <span className="text-xs font-medium text-muted-foreground">По</span>
                    <Input
                      type="date"
                      value={dateFilterTo}
                      onChange={(e) => setDateFilterTo(e.target.value)}
                      className="h-7 w-[130px] text-xs"
                    />
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <Icon name="CalendarRange" size={14} />
                        Период
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                      <DropdownMenuItem 
                        onClick={() => {
                          const today = new Date().toISOString().split('T')[0];
                          setDateFilterFrom(today);
                          setDateFilterTo(today);
                        }}
                        className="cursor-pointer"
                      >
                        Сегодня
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const today = new Date();
                          const nextWeek = new Date(today);
                          nextWeek.setDate(today.getDate() + 7);
                          setDateFilterFrom(today.toISOString().split('T')[0]);
                          setDateFilterTo(nextWeek.toISOString().split('T')[0]);
                        }}
                        className="cursor-pointer"
                      >
                        Неделя
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => {
                          const today = new Date();
                          const nextMonth = new Date(today);
                          nextMonth.setMonth(today.getMonth() + 1);
                          setDateFilterFrom(today.toISOString().split('T')[0]);
                          setDateFilterTo(nextMonth.toISOString().split('T')[0]);
                        }}
                        className="cursor-pointer"
                      >
                        Месяц
                      </DropdownMenuItem>
                      {isMDoctorAccess && (
                        <>
                          <DropdownMenuItem 
                            onClick={() => {
                              const today = new Date();
                              const yesterday = new Date(today);
                              yesterday.setDate(today.getDate() - 1);
                              setDateFilterFrom(yesterday.toISOString().split('T')[0]);
                              setDateFilterTo(yesterday.toISOString().split('T')[0]);
                            }}
                            className="cursor-pointer"
                          >
                            <Icon name="History" size={14} className="mr-1.5 text-purple-500" />
                            Вчера
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const today = new Date();
                              const weekAgo = new Date(today);
                              weekAgo.setDate(today.getDate() - 7);
                              setDateFilterFrom(weekAgo.toISOString().split('T')[0]);
                              setDateFilterTo(today.toISOString().split('T')[0]);
                            }}
                            className="cursor-pointer"
                          >
                            <Icon name="History" size={14} className="mr-1.5 text-purple-500" />
                            Прошлая неделя
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const today = new Date();
                              const monthAgo = new Date(today);
                              monthAgo.setMonth(today.getMonth() - 1);
                              setDateFilterFrom(monthAgo.toISOString().split('T')[0]);
                              setDateFilterTo(today.toISOString().split('T')[0]);
                            }}
                            className="cursor-pointer"
                          >
                            <Icon name="History" size={14} className="mr-1.5 text-purple-500" />
                            Прошлый месяц
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const today = new Date();
                              const threeMonthsAgo = new Date(today);
                              threeMonthsAgo.setMonth(today.getMonth() - 3);
                              setDateFilterFrom(threeMonthsAgo.toISOString().split('T')[0]);
                              setDateFilterTo(today.toISOString().split('T')[0]);
                            }}
                            className="cursor-pointer"
                          >
                            <Icon name="History" size={14} className="mr-1.5 text-purple-500" />
                            3 месяца назад
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => {
                              const today = new Date();
                              const yearStart = new Date(today.getFullYear(), 0, 1);
                              setDateFilterFrom(yearStart.toISOString().split('T')[0]);
                              setDateFilterTo(today.toISOString().split('T')[0]);
                            }}
                            className="cursor-pointer"
                          >
                            <Icon name="History" size={14} className="mr-1.5 text-purple-500" />
                            С начала года
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs gap-1.5">
                        <Icon name="Filter" size={14} />
                        {statusFilter === 'all' ? 'Все' : 
                         statusFilter === 'scheduled' ? 'Запланировано' :
                         statusFilter === 'completed' ? 'Завершено' : 'Отменено'}
                        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-primary/10 text-xs font-semibold">
                          {filteredAppointments.length}
                        </span>
                        <Icon name="ChevronDown" size={14} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => setStatusFilter('all')} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <span>Все</span>
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-muted text-xs font-semibold">
                            {appointments.filter((app: any) => app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo).length}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('scheduled')} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Icon name="Clock" size={12} className="text-green-600" />
                            <span>Запланировано</span>
                          </div>
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                            {appointments.filter((app: any) => app.status === 'scheduled' && app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo).length}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('completed')} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Icon name="CheckCircle" size={12} className="text-blue-600" />
                            <span>Завершено</span>
                          </div>
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-800 text-xs font-semibold">
                            {appointments.filter((app: any) => app.status === 'completed' && app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo).length}
                          </span>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setStatusFilter('cancelled')} className="cursor-pointer">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <Icon name="XCircle" size={12} className="text-gray-600" />
                            <span>Отменено</span>
                          </div>
                          <span className="ml-2 px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-800 text-xs font-semibold">
                            {appointments.filter((app: any) => app.status === 'cancelled' && app.appointment_date >= dateFilterFrom && app.appointment_date <= dateFilterTo).length}
                          </span>
                        </div>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-2 items-center">
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => setNewAppointmentDialog({
                      open: true,
                      date: '',
                      time: '',
                      patientName: '',
                      patientPhone: '',
                      patientSnils: '',
                      patientOms: '',
                      description: '',
                      availableSlots: []
                    })}
                    className="gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs h-8 font-bold animate-pulse-blue"
                  >
                    <Icon name="UserPlus" size={14} />
                    Записать пациента
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    onClick={() => {
                      loadDoctorsList();
                      setOtherDoctorDialog({
                        open: true,
                        selectedDoctorId: '',
                        date: '',
                        time: '',
                        patientName: '',
                        patientPhone: '',
                        patientSnils: '',
                        patientOms: '',
                        description: '',
                        availableSlots: [],
                        availableDates: [],
                        isLoadingDates: false,
                        isLoadingSlots: false
                      });
                    }}
                    className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs h-8 font-bold"
                  >
                    <Icon name="Users" size={14} />
                    Другой врач
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={printAppointments}
                    className="gap-1.5 text-xs h-8"
                  >
                    <Icon name="Printer" size={14} />
                    Печать
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={exportToExcel}
                    className="gap-1.5 bg-green-50 hover:bg-green-100 border-green-300 text-green-700 hover:text-green-800 text-xs h-8"
                  >
                    <Icon name="Download" size={14} />
                    Экспорт
                  </Button>
                </div>
                
                <div className="flex gap-2 items-center">
                  {selectedAppointment && (
                    <>

                      {selectedAppointment.status === 'scheduled' && (
                        <>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 text-xs gap-1.5 bg-green-600 hover:bg-green-700 text-white font-bold animate-pulse-green"
                            onClick={() => setConfirmDialog({
                              open: true,
                              appointmentId: selectedAppointment.id,
                              patientName: selectedAppointment.patient_name,
                              patientPhone: selectedAppointment.patient_phone,
                              patientSnils: selectedAppointment.patient_snils || '',
                              appointmentDate: new Date(selectedAppointment.appointment_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                              appointmentDateRaw: selectedAppointment.appointment_date,
                              appointmentTime: selectedAppointment.appointment_time.slice(0, 5),
                              description: selectedAppointment.description || '',
                              newDescription: selectedAppointment.description || ''
                            })}
                          >
                            <Icon name="CheckCircle" size={14} />
                            Завершить прием
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => setEditDialog({
                              open: true,
                              appointment: selectedAppointment
                            })}
                          >
                            <Icon name="Edit" size={14} className="text-blue-600" />
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => openRescheduleDialog(selectedAppointment)}
                          >
                            <Icon name="Calendar" size={14} className="text-purple-600" />
                            Перенести
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => handleOpenCloneDialog(selectedAppointment)}
                          >
                            <Icon name="Copy" size={14} className="text-blue-600" />
                            Клонировать
                          </Button>
                          <Button
                            size="sm"
                            className="h-8 text-xs gap-1.5 bg-red-100 hover:bg-red-200 text-red-800 border-red-300"
                            onClick={() => setCancelDialog({
                              open: true,
                              appointmentId: selectedAppointment.id,
                              patientName: selectedAppointment.patient_name,
                              patientPhone: selectedAppointment.patient_phone,
                              patientSnils: selectedAppointment.patient_snils || '',
                              appointmentDate: new Date(selectedAppointment.appointment_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                              appointmentDateRaw: selectedAppointment.appointment_date,
                              appointmentTime: selectedAppointment.appointment_time.slice(0, 5),
                              description: selectedAppointment.description || ''
                            })}
                          >
                            <Icon name="XCircle" size={14} />
                            Отменить прием
                          </Button>
                        </>
                      )}
                      {(selectedAppointment.status === 'completed' || selectedAppointment.status === 'cancelled') && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => setEditDialog({
                              open: true,
                              appointment: selectedAppointment
                            })}
                          >
                            <Icon name="Edit" size={14} className="text-blue-600" />
                            Изменить
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs gap-1.5"
                            onClick={() => handleOpenCloneDialog(selectedAppointment)}
                          >
                            <Icon name="Copy" size={14} className="text-blue-600" />
                            Клонировать
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
                </div>
              
              <div className="flex-1 overflow-hidden">
              {filteredAppointments.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center text-muted-foreground">
                    {statusFilter === 'all' 
                      ? 'Нет записей в выбранном периоде'
                      : `Нет записей со статусом "${
                          statusFilter === 'scheduled' ? 'Запланировано' :
                          statusFilter === 'completed' ? 'Завершено' : 'Отменено'
                        }" в выбранном периоде`
                    }
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full flex flex-col overflow-hidden">
                  <CardContent className="p-0 flex-1 overflow-auto">
                    <TooltipProvider>
                    <div className="relative">
                      <Table>
                        <TableHeader className="sticky top-0 bg-muted z-10">
                          <TableRow className="h-8">
                            <TableHead className="w-[40px] py-1 px-2 text-xs h-8 bg-muted">Автор</TableHead>
                            <TableHead className="w-[100px] py-1 px-2 text-xs h-8 bg-muted">Дата</TableHead>
                            <TableHead className="w-[50px] py-1 px-2 text-xs h-8 bg-muted">Время</TableHead>
                            <TableHead className="w-[50px] py-1 px-2 text-xs h-8 bg-muted">Завер.</TableHead>
                            <TableHead className="w-[180px] py-1 px-2 text-xs h-8 bg-muted">Пациент</TableHead>
                            <TableHead className="py-1 px-2 text-xs h-8 bg-muted">Телефон</TableHead>
                            <TableHead className="hidden lg:table-cell py-1 px-2 text-xs h-8 bg-muted">СНИЛС</TableHead>
                            <TableHead className="hidden lg:table-cell py-1 px-2 text-xs h-8 bg-muted">ОМС</TableHead>
                            <TableHead className="hidden md:table-cell py-1 px-2 text-xs h-8 bg-muted">Описание</TableHead>
                            <TableHead className="w-[100px] py-1 px-2 text-xs h-8 bg-muted">Статус</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                        {filteredAppointments
                          .sort((a: any, b: any) => {
                            const dateCompare = a.appointment_date.localeCompare(b.appointment_date);
                            if (dateCompare !== 0) return dateCompare;
                            return a.appointment_time.localeCompare(b.appointment_time);
                          })
                          .map((appointment: any, index: number, array: any[]) => {
                            const prevAppointment = index > 0 ? array[index - 1] : null;
                            const isNewDay = !prevAppointment || prevAppointment.appointment_date !== appointment.appointment_date;
                            
                            return (
                              <AppointmentContextMenu
                                key={appointment.id}
                                appointment={appointment}
                                onEdit={() => {
                                  setEditDialog({
                                    open: true,
                                    appointment: appointment
                                  });
                                }}
                                onReschedule={() => openRescheduleDialog(appointment)}
                                onClone={() => handleOpenCloneDialog(appointment)}
                                onComplete={() => {
                                  setConfirmDialog({
                                    open: true,
                                    appointmentId: appointment.id,
                                    patientName: appointment.patient_name,
                                    patientPhone: appointment.patient_phone,
                                    patientSnils: appointment.patient_snils || '',
                                    appointmentDate: new Date(appointment.appointment_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                                    appointmentDateRaw: appointment.appointment_date,
                                    appointmentTime: appointment.appointment_time.slice(0, 5),
                                    description: appointment.description || '',
                                    newDescription: appointment.description || ''
                                  });
                                }}
                                onCancel={() => {
                                  setCancelDialog({
                                    open: true,
                                    appointmentId: appointment.id,
                                    patientName: appointment.patient_name,
                                    patientPhone: appointment.patient_phone,
                                    patientSnils: appointment.patient_snils || '',
                                    appointmentDate: new Date(appointment.appointment_date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' }),
                                    appointmentDateRaw: appointment.appointment_date,
                                    appointmentTime: appointment.appointment_time.slice(0, 5),
                                    description: appointment.description || ''
                                  });
                                }}
                              >
                                <TableRow 
                                  className={`h-8 cursor-pointer transition-colors ${isNewDay && index > 0 ? 'border-t-[3px] border-t-gray-300' : ''} ${
                                    selectedAppointment?.id === appointment.id 
                                      ? 'bg-primary/20 hover:bg-primary/25' 
                                      : 'hover:bg-muted/50'
                                  }`}
                                  onClick={() => setSelectedAppointment(appointment)}
                                >
                                <TableCell className="text-xs py-1 px-2 h-8 text-center">
                                  {(() => {
                                    const createdAt = appointment.created_at ? new Date(appointment.created_at + 'Z') : null;
                                    const createdDate = createdAt ? createdAt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' }) : '';
                                    const createdTime = createdAt ? createdAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: 'Europe/Moscow' }) : '';
                                    const fullDate = createdAt ? `${createdDate} в ${createdTime}` : '';
                                    
                                    let tooltipText = '';
                                    let icon = null;
                                    
                                    if (appointment.created_by === 1) {
                                      tooltipText = `Запись создана пациентом${fullDate ? ' ' + fullDate : ''}`;
                                      icon = <Icon name="User" size={16} className="text-red-500" />;
                                    } else if (appointment.created_by === 2) {
                                      tooltipText = `Запись создана врачом${fullDate ? ' ' + fullDate : ''}`;
                                      icon = <Icon name="Stethoscope" size={16} className="text-blue-500" />;
                                    } else if (appointment.created_by === 3) {
                                      tooltipText = `Запись создана регистратором${fullDate ? ' ' + fullDate : ''}`;
                                      icon = <Icon name="UserCog" size={16} className="text-green-500" />;
                                    } else {
                                      tooltipText = `Автор не указан${fullDate ? ', создано ' + fullDate : ''}`;
                                      icon = <Icon name="User" size={16} className="text-gray-400" />;
                                    }
                                    
                                    return (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <div className="inline-flex cursor-help">{icon}</div>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p className="text-xs">{tooltipText}</p>
                                        </TooltipContent>
                                      </Tooltip>
                                    );
                                  })()}
                                </TableCell>
                                <TableCell className={`text-xs py-1 px-2 h-8 ${
                                  selectedAppointment?.id === appointment.id ? 'font-bold' : 'font-medium'
                                }`}>
                                  {isNewDay && new Date(appointment.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { 
                                    day: 'numeric', 
                                    month: 'short',
                                    weekday: 'short'
                                  })}
                                </TableCell>
                                <TableCell className={`text-xs py-1 px-2 h-8 ${
                                  selectedAppointment?.id === appointment.id ? 'font-bold' : 'font-medium'
                                }`}>
                                  {appointment.appointment_time.slice(0, 5)}
                                </TableCell>
                                <TableCell className={`text-xs py-1 px-2 h-8 ${
                                  selectedAppointment?.id === appointment.id ? 'font-bold' : 'font-medium'
                                }`}>
                                  {appointment.status === 'completed' && appointment.completed_at ? (
                                    <span className="text-blue-600">
                                      {new Date(appointment.completed_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </TableCell>
                                <TableCell className={`text-xs py-1 px-2 h-8 ${
                                  selectedAppointment?.id === appointment.id ? 'font-bold' : 'font-medium'
                                }`}>{appointment.patient_name}</TableCell>
                                <TableCell className="text-xs py-1 px-2 h-8">{appointment.patient_phone}</TableCell>
                                <TableCell className="hidden lg:table-cell text-xs py-1 px-2 h-8">{appointment.patient_snils || '—'}</TableCell>
                                <TableCell className="hidden lg:table-cell text-xs py-1 px-2 h-8">{appointment.patient_oms || '—'}</TableCell>
                                <TableCell className="hidden md:table-cell text-xs text-muted-foreground py-1 px-2 h-8">
                                  {appointment.description || '—'}
                                </TableCell>
                                <TableCell className="py-1 px-2 h-8">
                                  <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap inline-block ${
                                    appointment.status === 'scheduled' 
                                      ? 'bg-green-100 text-green-800' 
                                      : appointment.status === 'completed'
                                      ? 'bg-blue-100 text-blue-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {appointment.status === 'scheduled' ? 'Запланировано' : 
                                     appointment.status === 'completed' ? 'Завершено' : 'Отменено'}
                                  </span>
                                </TableCell>
                              </TableRow>
                              </AppointmentContextMenu>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                    </TooltipProvider>
                  </CardContent>
                </Card>
              )}
              </div>
              </div>
            </TabsContent>
            )}
          </div>
        </section>
      </Tabs>

      <Dialog open={editDialog.open} onOpenChange={(open) => setEditDialog({...editDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Редактирование записи</DialogTitle>
            <DialogDescription>
              {editDialog.appointment && (
                <>
                  Дата: {new Date(editDialog.appointment.appointment_date).toLocaleDateString('ru-RU')} в {editDialog.appointment.appointment_time}
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {editDialog.appointment && (
            <EditAppointmentForm
              appointment={editDialog.appointment}
              onSuccess={() => {
                setEditDialog({ open: false, appointment: null });
                loadAppointments(doctorInfo.id);
                if (newAppointmentDialog.open && newAppointmentDialog.date) {
                  loadAvailableSlotsForNewAppointment(newAppointmentDialog.date);
                }
              }}
              onCancel={() => setEditDialog({ open: false, appointment: null })}
            />
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={confirmDialog.open} onOpenChange={(open) => setConfirmDialog({...confirmDialog, open})}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Завершить прием?</DialogTitle>
            <DialogDescription className="text-center pt-2">
              <div className="bg-primary/10 rounded-lg p-4 space-y-2">
                <p className="font-semibold text-foreground text-lg">{confirmDialog.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {confirmDialog.appointmentDate} в {confirmDialog.appointmentTime}
                </p>
              </div>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {confirmDialog.description && (
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-muted-foreground mb-1">Исходное описание:</p>
                <p className="text-sm">{confirmDialog.description}</p>
              </div>
            )}
            
            <div>
              <label className="text-sm font-medium mb-2 block">
                Комментарий врача (необязательно)
              </label>
              <Textarea
                value={confirmDialog.newDescription}
                onChange={(e) => setConfirmDialog({...confirmDialog, newDescription: e.target.value})}
                placeholder="Добавьте комментарий о приёме, диагнозе или рекомендациях..."
                rows={4}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Этот комментарий будет сохранён вместе с записью
              </p>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setConfirmDialog({...confirmDialog, open: false})}
            >
              Отмена
            </Button>
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (confirmDialog.appointmentId) {
                  const today = new Date().toISOString().split('T')[0];
                  const appointmentDate = confirmDialog.appointmentDateRaw;
                  
                  if (appointmentDate !== today) {
                    setWrongDateDialog({
                      open: true,
                      appointmentDate: confirmDialog.appointmentDate,
                      currentDate: new Date().toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
                    });
                    setConfirmDialog({
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
                    return;
                  }
                  
                  handleUpdateAppointmentStatus(
                    confirmDialog.appointmentId, 
                    'completed', 
                    confirmDialog.newDescription,
                    {
                      patient_name: confirmDialog.patientName,
                      patient_phone: confirmDialog.patientPhone,
                      patient_snils: confirmDialog.patientSnils,
                      appointment_date: confirmDialog.appointmentDateRaw,
                      appointment_time: confirmDialog.appointmentTime,
                      description: confirmDialog.description
                    }
                  );
                  setConfirmDialog({
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
                }
              }}
            >
              <Icon name="CheckCircle" size={18} className="mr-2" />
              Завершить прием
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cancelDialog.open} onOpenChange={(open) => setCancelDialog({...cancelDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">Отменить запись?</DialogTitle>
            <DialogDescription className="text-center pt-4 space-y-2">
              <div className="bg-red-50 rounded-lg p-4 space-y-2 border border-red-200">
                <p className="font-semibold text-foreground text-lg">{cancelDialog.patientName}</p>
                <p className="text-sm text-muted-foreground">
                  {cancelDialog.appointmentDate} в {cancelDialog.appointmentTime}
                </p>
              </div>
              <p className="text-base text-foreground pt-2">
                Вы уверены, что хотите отменить запись этого пациента?
              </p>
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setCancelDialog({...cancelDialog, open: false})}
            >
              Нет
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={() => {
                if (cancelDialog.appointmentId) {
                  handleUpdateAppointmentStatus(
                    cancelDialog.appointmentId, 
                    'cancelled',
                    undefined,
                    {
                      patient_name: cancelDialog.patientName,
                      patient_phone: cancelDialog.patientPhone,
                      patient_snils: cancelDialog.patientSnils,
                      appointment_date: cancelDialog.appointmentDateRaw,
                      appointment_time: cancelDialog.appointmentTime,
                      description: cancelDialog.description
                    }
                  );
                  setCancelDialog({
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
                }
              }}
            >
              <Icon name="XCircle" size={18} className="mr-2" />
              Да
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={wrongDateDialog.open} onOpenChange={(open) => setWrongDateDialog({...wrongDateDialog, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">⚠️ Ошибка!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/9098e103-3bc4-4ea2-aebf-7bfcd56796a7.jpg" 
                alt="Сердитый врач"
                className="w-48 h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            <div className="text-center space-y-3">
              <p className="text-lg font-semibold text-red-600">
                Нельзя завершить прием другого дня!
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 space-y-2">
                <p className="text-sm text-foreground">
                  <strong>Дата приема:</strong> {wrongDateDialog.appointmentDate}
                </p>
                <p className="text-sm text-foreground">
                  <strong>Сегодня:</strong> {wrongDateDialog.currentDate}
                </p>
              </div>
              <p className="text-base text-muted-foreground">
                Вы можете завершить прием только в день его проведения
              </p>
            </div>
          </div>

          <Button
            className="w-full mt-4"
            onClick={() => setWrongDateDialog({open: false, appointmentDate: '', currentDate: ''})}
          >
            Понятно
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={pastDateWarning.open} onOpenChange={(open) => setPastDateWarning({...pastDateWarning, open})}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl text-red-600">😡 Стоп! Машина времени сломалась!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="relative">
                <img 
                  src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/9b6a0dd8-f1f0-496a-b035-93bc7c57d11c.jpg" 
                  alt="Очень сердитый доктор"
                  className="w-64 h-64 object-contain rounded-2xl shadow-2xl border-4 border-red-500 bg-white"
                />
                <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-3 shadow-lg animate-bounce">
                  <Icon name="AlertTriangle" size={32} />
                </div>
              </div>
            </div>
            
            <div className="text-center space-y-4">
              <p className="text-2xl font-bold text-red-700">
                Нельзя изменять прошлое!
              </p>
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 space-y-3 shadow-lg">
                <p className="text-lg font-semibold text-foreground">
                  🚫 Вы пытаетесь создать/изменить запись на прошедшую дату:
                </p>
                <div className="bg-white/80 rounded-lg p-4 border-2 border-red-400">
                  <p className="text-3xl font-bold text-red-600">
                    {new Date(pastDateWarning.attemptedDate + 'T00:00:00').toLocaleDateString('ru-RU', { 
                      weekday: 'long', 
                      day: 'numeric', 
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <p className="text-base text-muted-foreground">
                  ⏰ <strong>Сегодня:</strong> {new Date().toLocaleDateString('ru-RU', { 
                    day: 'numeric', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
              <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4">
                <p className="text-base font-semibold text-yellow-900 mb-2">
                  ⚡ Правила временно́го континуума:
                </p>
                <ul className="text-sm text-yellow-800 space-y-1 text-left list-disc list-inside">
                  <li>Можно создавать расписание только на <strong>сегодня и будущее</strong></li>
                  <li>Прошлое изменить нельзя (даже если очень хочется)</li>
                  <li>Доктор не одобряет попытки нарушить законы времени!</li>
                </ul>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-6 bg-red-600 hover:bg-red-700 text-lg py-6"
            onClick={() => setPastDateWarning({open: false, attemptedDate: ''})}
          >
            <Icon name="ThumbsUp" size={20} className="mr-2" />
            Понял, буду работать с будущим!
          </Button>
        </DialogContent>
      </Dialog>

      <Dialog open={newAppointmentDialog.open} onOpenChange={(open) => {
        // Проверяем, есть ли модальное окно ошибки слота
        const slotErrorDialog = document.getElementById('slot-error-overlay');
        if (!open && slotErrorDialog) {
          // Если пытаются закрыть диалог, но открыто окно ошибки - игнорируем
          return;
        }
        setNewAppointmentDialog({...newAppointmentDialog, open});
      }}>
        <DialogContent className="sm:max-w-2xl" onPointerDownOutside={(e) => {
          // Блокируем закрытие диалога при клике на overlay, если открыто окно ошибки
          const slotErrorDialog = document.getElementById('slot-error-overlay');
          if (slotErrorDialog) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Записать пациента на прием</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateNewAppointment} className="space-y-3">
            {newAppointmentDialog.date && newAppointmentDialog.time && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm font-semibold text-blue-900">
                  📅 {new Date(newAppointmentDialog.date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} в {newAppointmentDialog.time}
                </p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Дата приема</label>
                <div className="grid grid-cols-4 gap-1">
                  {getNext14DaysForDoctor().map((day) => {
                    const slotCount = dateSlotCounts[day.date];
                    const hasSlots = slotCount !== undefined && slotCount > 0;
                    
                    return (
                      <Button
                        key={day.date}
                        type="button"
                        variant={newAppointmentDialog.date === day.date ? 'default' : 'outline'}
                        className={`h-14 flex flex-col text-xs p-1 ${!day.isWorking || !hasSlots ? 'opacity-40 cursor-not-allowed' : ''}`}
                        onClick={() => day.isWorking && hasSlots && setNewAppointmentDialog({...newAppointmentDialog, date: day.date, time: ''})}
                        disabled={!day.isWorking || !hasSlots}
                      >
                        <span className="text-[9px] text-muted-foreground leading-tight">{day.label.split(',')[0]}</span>
                        <span className="text-xs font-bold leading-tight">{day.label.split(',')[1]}</span>
                        {!day.isWorking ? (
                          <span className="text-[8px] text-red-500 leading-tight">Выходной</span>
                        ) : slotCount === undefined ? (
                          <span className="text-[8px] text-muted-foreground leading-tight">...</span>
                        ) : slotCount === 0 ? (
                          <span className="text-[8px] text-red-500 leading-tight">Нет мест</span>
                        ) : (
                          <span className="text-[8px] text-green-600 leading-tight font-semibold">{slotCount}</span>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">Время приема</label>
                {newAppointmentDialog.date && newAppointmentDialog.availableSlots.length > 0 ? (
                  <div className="grid grid-cols-4 gap-1 h-[200px] overflow-y-auto p-1.5 border rounded-md bg-muted/20">
                    {newAppointmentDialog.availableSlots.map((slot: string) => (
                      <Button
                        key={slot}
                        type="button"
                        size="sm"
                        variant={newAppointmentDialog.time === slot ? 'default' : 'outline'}
                        onClick={() => setNewAppointmentDialog({...newAppointmentDialog, time: slot})}
                        className="h-7 text-xs"
                      >
                        {slot}
                      </Button>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center border rounded-md bg-muted/30">
                    <p className="text-xs text-muted-foreground text-center">
                      {newAppointmentDialog.date ? 'Нет доступных слотов' : 'Выберите дату'}
                    </p>
                  </div>
                )}
                <div className="mt-2">
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Или введите своё время:
                  </label>
                  <Input
                    type="time"
                    value={newAppointmentDialog.time}
                    onChange={(e) => setNewAppointmentDialog({...newAppointmentDialog, time: e.target.value})}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">ФИО пациента *</label>
                <Input
                  value={newAppointmentDialog.patientName}
                  onChange={(e) => {
                    setNewAppointmentDialog({...newAppointmentDialog, patientName: e.target.value});
                    if (newAppointmentNameError) setNewAppointmentNameError(validateFullName(e.target.value));
                  }}
                  placeholder="Иванов Иван Иванович"
                  className={`h-9 text-sm${newAppointmentNameError ? ' border-red-500 focus-visible:ring-red-500' : ''}`}
                />
                {newAppointmentNameError && <p className="text-xs text-red-500 mt-1">{newAppointmentNameError}</p>}
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">Телефон *</label>
                <Input
                  type="tel"
                  value={newAppointmentDialog.patientPhone}
                  onChange={(e) => setNewAppointmentDialog({...newAppointmentDialog, patientPhone: e.target.value})}
                  placeholder="+79991234567"
                  className="h-9 text-sm"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium mb-1 block">СНИЛС</label>
                <Input
                  value={newAppointmentDialog.patientSnils}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    let formatted = '';
                    if (digits.length <= 3) {
                      formatted = digits;
                    } else if (digits.length <= 6) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                    } else if (digits.length <= 9) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
                    } else {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)}-${digits.slice(9, 11)}`;
                    }
                    setNewAppointmentDialog({...newAppointmentDialog, patientSnils: formatted});
                  }}
                  placeholder="123-123-123-12"
                  className="h-9 text-sm"
                  maxLength={14}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1 block">ОМС</label>
                <Input
                  value={newAppointmentDialog.patientOms}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    let formatted = '';
                    if (digits.length <= 4) {
                      formatted = digits;
                    } else if (digits.length <= 8) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                    } else if (digits.length <= 12) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
                    } else {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
                    }
                    setNewAppointmentDialog({...newAppointmentDialog, patientOms: formatted});
                  }}
                  placeholder="1234-1234-1234-1234"
                  className="h-9 text-sm"
                  maxLength={19}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Описание</label>
              <Input
                value={newAppointmentDialog.description}
                onChange={(e) => setNewAppointmentDialog({...newAppointmentDialog, description: e.target.value})}
                placeholder="Краткое описание"
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => {
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
                  setNewAppointmentNameError(null);
                }}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!newAppointmentDialog.date || !newAppointmentDialog.time || !newAppointmentDialog.patientName || !newAppointmentDialog.patientPhone}
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Записать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={otherDoctorDialog.open} onOpenChange={(open) => {
        if (!open) {
          setOtherDoctorDialog({
            open: false,
            selectedDoctorId: '',
            date: '',
            time: '',
            patientName: '',
            patientPhone: '',
            patientSnils: '',
            patientOms: '',
            description: '',
            availableSlots: [],
            availableDates: [],
            isLoadingDates: false,
            isLoadingSlots: false
          });
        }
      }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Записать пациента к другому врачу</DialogTitle>
            <DialogDescription>
              Выберите врача, дату и время приема
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreateAppointmentForOtherDoctor} className="space-y-3">
            <div>
              <label className="text-xs font-medium mb-1 block">Выберите врача</label>
              <Select
                value={otherDoctorDialog.selectedDoctorId}
                onValueChange={(value) => {
                  setOtherDoctorDialog(prev => ({...prev, selectedDoctorId: value, date: '', time: '', availableSlots: [], availableDates: []}));
                  loadAvailableDatesForOtherDoctor(value);
                }}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={doctors.length === 0 ? "Загрузка врачей..." : "Выберите врача"} />
                </SelectTrigger>
                <SelectContent>
                  {(() => {
                    const groupedDoctors = doctors.reduce((groups: any, doctor: any) => {
                      const clinic = doctor.clinic || 'Не указана';
                      if (!groups[clinic]) {
                        groups[clinic] = [];
                      }
                      groups[clinic].push(doctor);
                      return groups;
                    }, {});

                    return Object.entries(groupedDoctors).map(([clinic, clinicDoctors]: [string, any]) => (
                      <SelectGroup key={clinic}>
                        <SelectLabel>{clinic}</SelectLabel>
                        {clinicDoctors.map((doctor: any) => (
                          <SelectItem key={doctor.id} value={doctor.id.toString()}>
                            {doctor.full_name} — {doctor.position || doctor.specialization}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    ));
                  })()}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">Дата приема</label>
                {otherDoctorDialog.isLoadingDates ? (
                  <div className="h-9 flex items-center px-3 border rounded-md bg-muted text-sm text-muted-foreground">
                    <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                    Загрузка дат...
                  </div>
                ) : (
                  <Select
                    value={otherDoctorDialog.date}
                    onValueChange={(value) => {
                      setOtherDoctorDialog(prev => ({...prev, date: value, time: '', availableSlots: []}));
                      loadAvailableSlotsForOtherDoctor(otherDoctorDialog.selectedDoctorId, value);
                    }}
                    disabled={!otherDoctorDialog.selectedDoctorId || otherDoctorDialog.availableDates.length === 0}
                  >
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder={!otherDoctorDialog.selectedDoctorId ? "Сначала врача" : otherDoctorDialog.availableDates.length === 0 ? "Нет дат" : "Выберите дату"} />
                    </SelectTrigger>
                    <SelectContent>
                      {otherDoctorDialog.availableDates.map((date) => (
                        <SelectItem key={date} value={date}>
                          {new Date(date + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Время приема</label>
                {otherDoctorDialog.isLoadingSlots ? (
                  <div className="h-9 flex items-center px-3 border rounded-md bg-muted text-sm text-muted-foreground">
                    <Icon name="Loader2" size={14} className="mr-2 animate-spin" />
                    Загрузка...
                  </div>
                ) : (
                <Select
                  value={otherDoctorDialog.time}
                  onValueChange={(value) => setOtherDoctorDialog(prev => ({...prev, time: value}))}
                  disabled={!otherDoctorDialog.date || otherDoctorDialog.availableSlots.length === 0}
                >
                  <SelectTrigger className="h-9 text-sm">
                    <SelectValue placeholder={otherDoctorDialog.availableSlots.length === 0 && otherDoctorDialog.date && otherDoctorDialog.selectedDoctorId ? "Нет слотов" : "Выберите время"} />
                  </SelectTrigger>
                  <SelectContent>
                    {otherDoctorDialog.availableSlots.map((slot: string) => (
                      <SelectItem key={slot} value={slot}>{slot}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                )}
              </div>
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">ФИО пациента</label>
              <Input
                value={otherDoctorDialog.patientName}
                onChange={(e) => setOtherDoctorDialog({...otherDoctorDialog, patientName: e.target.value})}
                placeholder="Иванов Иван Иванович"
                className="h-9 text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block">Телефон</label>
              <Input
                value={otherDoctorDialog.patientPhone}
                onChange={(e) => {
                  const digits = e.target.value.replace(/\D/g, '');
                  let formatted = '';
                  if (digits.length > 0) {
                    formatted = '+7';
                    if (digits.length > 1) {
                      formatted += ` (${digits.slice(1, 4)}`;
                      if (digits.length >= 4) {
                        formatted += `) ${digits.slice(4, 7)}`;
                        if (digits.length >= 7) {
                          formatted += `-${digits.slice(7, 9)}`;
                          if (digits.length >= 9) {
                            formatted += `-${digits.slice(9, 11)}`;
                          }
                        }
                      }
                    }
                  }
                  setOtherDoctorDialog({...otherDoctorDialog, patientPhone: formatted});
                }}
                placeholder="+7 (999) 999-99-99"
                className="h-9 text-sm"
                maxLength={18}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium mb-1 block">СНИЛС</label>
                <Input
                  value={otherDoctorDialog.patientSnils}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    let formatted = '';
                    if (digits.length <= 3) {
                      formatted = digits;
                    } else if (digits.length <= 6) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3)}`;
                    } else if (digits.length <= 9) {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
                    } else {
                      formatted = `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6, 9)} ${digits.slice(9, 11)}`;
                    }
                    setOtherDoctorDialog({...otherDoctorDialog, patientSnils: formatted});
                  }}
                  placeholder="123-456-789 00"
                  className="h-9 text-sm"
                  maxLength={14}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">ОМС</label>
                <Input
                  value={otherDoctorDialog.patientOms}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, '');
                    let formatted = '';
                    if (digits.length <= 4) {
                      formatted = digits;
                    } else if (digits.length <= 8) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4)}`;
                    } else if (digits.length <= 12) {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8)}`;
                    } else {
                      formatted = `${digits.slice(0, 4)}-${digits.slice(4, 8)}-${digits.slice(8, 12)}-${digits.slice(12, 16)}`;
                    }
                    setOtherDoctorDialog({...otherDoctorDialog, patientOms: formatted});
                  }}
                  placeholder="1234-1234-1234-1234"
                  className="h-9 text-sm"
                  maxLength={19}
                />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1 block">Описание</label>
              <Input
                value={otherDoctorDialog.description}
                onChange={(e) => setOtherDoctorDialog({...otherDoctorDialog, description: e.target.value})}
                placeholder="Краткое описание"
                className="h-9 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOtherDoctorDialog({
                  open: false,
                  selectedDoctorId: '',
                  date: '',
                  time: '',
                  patientName: '',
                  patientPhone: '',
                  patientSnils: '',
                  patientOms: '',
                  description: '',
                  availableSlots: [],
                  availableDates: [],
                  isLoadingDates: false,
                  isLoadingSlots: false
                })}
              >
                Отмена
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!otherDoctorDialog.selectedDoctorId || !otherDoctorDialog.date || !otherDoctorDialog.time || !otherDoctorDialog.patientName || !otherDoctorDialog.patientPhone}
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                Записать
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>



      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => {
        // Проверяем, есть ли модальное окно ошибки слота
        const slotErrorDialog = document.getElementById('slot-error-overlay');
        if (!open && slotErrorDialog) {
          // Если пытаются закрыть диалог, но открыто окно ошибки - игнорируем
          return;
        }
        setRescheduleDialog({...rescheduleDialog, open});
      }}>
        <DialogContent className="max-w-4xl" onPointerDownOutside={(e) => {
          // Блокируем закрытие диалога при клике на overlay, если открыто окно ошибки
          const slotErrorDialog = document.getElementById('slot-error-overlay');
          if (slotErrorDialog) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Перенести запись</DialogTitle>
            <DialogDescription>
              {rescheduleDialog.appointment?.patient_name} • {rescheduleDialog.appointment && new Date(rescheduleDialog.appointment.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU')} • {rescheduleDialog.appointment?.appointment_time.slice(0, 5)}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Выберите новую дату</label>
              <div className="grid grid-cols-7 gap-2">
                {rescheduleDialog.availableDates.map((dateInfo: any) => (
                  <button
                    key={dateInfo.date}
                    type="button"
                    onClick={() => dateInfo.isWorking && setRescheduleDialog(prev => ({ ...prev, newDate: dateInfo.date }))}
                    disabled={!dateInfo.isWorking}
                    className={`p-2 rounded-lg border text-xs transition-all ${
                      rescheduleDialog.newDate === dateInfo.date
                        ? 'bg-primary text-primary-foreground border-primary'
                        : dateInfo.isWorking
                        ? 'bg-white hover:bg-gray-50 border-gray-200'
                        : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                    }`}
                  >
                    <div className="font-medium">{dateInfo.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {rescheduleDialog.newDate && (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Выберите время на {new Date(rescheduleDialog.newDate + 'T00:00:00').toLocaleDateString('ru-RU')}
                  </label>
                  {rescheduleDialog.availableSlots.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Нет свободных слотов на эту дату</p>
                  ) : (
                    <div className="grid grid-cols-6 gap-2">
                      {rescheduleDialog.availableSlots.map((time: string) => (
                        <Button
                          key={time}
                          type="button"
                          variant={rescheduleDialog.newTime === time ? "default" : "outline"}
                          size="sm"
                          onClick={() => setRescheduleDialog(prev => ({ ...prev, newTime: time }))}
                        >
                          {time}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs font-medium mb-1 block text-muted-foreground">
                    Или введите своё время:
                  </label>
                  <Input
                    type="time"
                    value={rescheduleDialog.newTime}
                    onChange={(e) => setRescheduleDialog(prev => ({ ...prev, newTime: e.target.value }))}
                    className="h-9 text-sm"
                  />
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button 
                variant="outline" 
                className="flex-1" 
                onClick={() => setRescheduleDialog({
                  open: false,
                  appointment: null,
                  newDate: '',
                  newTime: '',
                  availableSlots: [],
                  availableDates: []
                })}
              >
                Отмена
              </Button>
              <Button 
                className="flex-1" 
                onClick={handleRescheduleAppointment}
                disabled={!rescheduleDialog.newDate || !rescheduleDialog.newTime}
              >
                Перенести
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={cloneDialog.open} onOpenChange={(open) => {
        // Проверяем, есть ли модальное окно ошибки слота
        const slotErrorDialog = document.getElementById('slot-error-overlay');
        if (!open && slotErrorDialog) {
          // Если пытаются закрыть диалог, но открыто окно ошибки - игнорируем
          return;
        }
        setCloneDialog({...cloneDialog, open});
      }}>
        <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => {
          // Блокируем закрытие диалога при клике на overlay, если открыто окно ошибки
          const slotErrorDialog = document.getElementById('slot-error-overlay');
          if (slotErrorDialog) {
            e.preventDefault();
          }
        }}>
          <DialogHeader>
            <DialogTitle>Клонировать запись</DialogTitle>
            <DialogDescription>
              Создайте новую запись для пациента на другую дату и время
            </DialogDescription>
          </DialogHeader>
          {cloneDialog.appointment && (
            <form onSubmit={handleCloneAppointment} className="space-y-4">
              {cloneDialog.newDate && cloneDialog.newTime && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-green-900">
                    🔄 Новая запись: {new Date(cloneDialog.newDate + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })} в {cloneDialog.newTime}
                  </p>
                </div>
              )}
              <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                <p className="text-sm"><strong>Пациент:</strong> {cloneDialog.appointment.patient_name}</p>
                <p className="text-sm"><strong>Телефон:</strong> {cloneDialog.appointment.patient_phone}</p>
                {cloneDialog.appointment.patient_snils && (
                  <p className="text-sm"><strong>СНИЛС:</strong> {cloneDialog.appointment.patient_snils}</p>
                )}
                <p className="text-sm text-muted-foreground">
                  <strong>Запись:</strong> {new Date(cloneDialog.appointment.appointment_date + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {cloneDialog.appointment.appointment_time.slice(0, 5)}
                </p>
                {cloneDialog.appointment.status === 'completed' && cloneDialog.appointment.completed_at && (
                  <p className="text-sm text-blue-600">
                    <strong>Завершено:</strong> {new Date(cloneDialog.appointment.completed_at).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })} в {new Date(cloneDialog.appointment.completed_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Новая дата</label>
                <Input
                  type="date"
                  value={cloneDialog.newDate}
                  onChange={(e) => {
                    const selectedDate = e.target.value;
                    setCloneDialog({...cloneDialog, newDate: selectedDate, newTime: ''});
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                  className="text-sm"
                />
                {cloneDialog.newDate && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Выбрано: {new Date(cloneDialog.newDate + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', weekday: 'short' })}
                  </p>
                )}
              </div>

              {cloneDialog.newDate && (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Новое время</label>
                    {cloneDialog.availableSlots.length > 0 ? (
                      <div className="grid grid-cols-4 gap-2 max-h-[180px] overflow-y-auto p-2 border rounded-md">
                        {cloneDialog.availableSlots.map((slot: string) => (
                          <Button
                            key={slot}
                            type="button"
                            size="sm"
                            variant={cloneDialog.newTime === slot ? 'default' : 'outline'}
                            onClick={() => setCloneDialog({...cloneDialog, newTime: slot})}
                            className="h-8"
                          >
                            {slot}
                          </Button>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground p-3 border rounded-md bg-muted/30">
                        Нет доступных слотов на выбранную дату
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-medium mb-1 block text-muted-foreground">
                      Или введите своё время:
                    </label>
                    <Input
                      type="time"
                      value={cloneDialog.newTime}
                      onChange={(e) => setCloneDialog({...cloneDialog, newTime: e.target.value})}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Описание проблемы (необязательно)</label>
                <Textarea
                  value={cloneDialog.newDescription}
                  onChange={(e) => setCloneDialog({...cloneDialog, newDescription: e.target.value})}
                  placeholder="Краткое описание проблемы"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setCloneDialog({
                    open: false,
                    appointment: null,
                    newDate: '',
                    newTime: '',
                    newDescription: '',
                    availableSlots: []
                  })}
                >
                  Отмена
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={!cloneDialog.newDate || !cloneDialog.newTime}
                >
                  <Icon name="Copy" size={16} className="mr-2" />
                  Клонировать
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={dayOffWarning.open} onOpenChange={(open) => setDayOffWarning({...dayOffWarning, open})}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl">⚠️ Внимание!</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-center">
              <img 
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/63fb9e22-96eb-474f-a24c-08bcdfc6cc6a.jpg" 
                alt="Удивленный врач"
                className="w-48 h-48 object-cover rounded-lg shadow-lg"
              />
            </div>
            
            <div className="text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">
                На этот день уже есть записи!
              </p>
              <p className="text-sm text-muted-foreground">
                Найдено записей: <span className="font-bold text-orange-600">{dayOffWarning.appointmentCount}</span>
              </p>
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 mt-3">
                <p className="text-sm text-orange-900">
                  Если вы сделаете этот день выходным, не забудьте уведомить пациентов о необходимости переноса записи!
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setDayOffWarning({open: false, date: '', appointmentCount: 0})}
            >
              Отмена
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDayOff}
            >
              <Icon name="AlertTriangle" size={18} className="mr-2" />
              Да, сделать выходным
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <NameErrorModal
        open={nameErrorModal.open}
        errorMessage={nameErrorModal.message}
        onClose={() => setNameErrorModal({ open: false, message: '' })}
      />
    </div>
  );
};

export default Doctor;