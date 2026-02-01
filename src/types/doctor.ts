export interface DoctorInfo {
  id: number;
  full_name: string;
  login: string;
  position: string;
  specialization?: string;
}

export interface Schedule {
  id: number;
  doctor_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  slot_duration: number;
  is_active: boolean;
}

export interface DailySchedule {
  id: number;
  doctor_id: number;
  schedule_date: string;
  start_time: string;
  end_time: string;
  break_start_time?: string;
  break_end_time?: string;
  slot_duration: number;
  is_active: boolean;
}

export interface Appointment {
  id: number;
  doctor_id: number;
  patient_name: string;
  patient_phone: string;
  patient_snils?: string;
  patient_oms?: string;
  appointment_date: string;
  appointment_time: string;
  description?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at?: string;
  completed_at?: string;
}

export interface CalendarDay {
  is_working: boolean;
  note?: string;
}

export interface SlotStats {
  available: number;
  booked: number;
}

export interface ConfirmDialog {
  open: boolean;
  appointmentId: number | null;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  appointmentDate: string;
  appointmentDateRaw: string;
  appointmentTime: string;
  description: string;
  newDescription: string;
}

export interface CancelDialog {
  open: boolean;
  appointmentId: number | null;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  appointmentDate: string;
  appointmentDateRaw: string;
  appointmentTime: string;
  description: string;
}

export interface CloneDialog {
  open: boolean;
  appointment: Appointment | null;
  newDate: string;
  newTime: string;
  newDescription: string;
  availableSlots: string[];
}

export interface NewAppointmentDialog {
  open: boolean;
  date: string;
  time: string;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
  availableSlots: string[];
}

export interface RescheduleDialog {
  open: boolean;
  appointment: Appointment | null;
  newDate: string;
  newTime: string;
  availableSlots: string[];
  availableDates: DayOption[];
}

export interface DayOption {
  date: string;
  label: string;
  isWorking: boolean;
}
