export interface RegistrarInfo {
  id: number;
  full_name: string;
  login: string;
  clinic: string;
}

export interface Doctor {
  id: number;
  full_name: string;
  position: string;
  specialization?: string;
  photo_url?: string;
  clinic: string;
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
  photo_url?: string;
}

export interface NewAppointmentDialog {
  open: boolean;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
  time: string;
}

export interface EditDialog {
  open: boolean;
  appointment: Appointment | null;
  patientName: string;
  patientPhone: string;
  patientSnils: string;
  patientOms: string;
  description: string;
}

export interface CancelDialog {
  open: boolean;
  appointment: Appointment | null;
}

export interface RescheduleDialog {
  open: boolean;
  appointment: Appointment | null;
}

export interface CloneDialog {
  open: boolean;
  appointment: Appointment | null;
  newDescription: string;
}

export interface AvailableDate {
  date: string;
  label: string;
  slotCount: number;
  isWorking: boolean;
}

export interface CalendarDay {
  is_working: boolean;
}
