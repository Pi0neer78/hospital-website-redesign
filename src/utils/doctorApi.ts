import { API_URLS } from '@/constants/doctor';
import type { DoctorInfo, CalendarDay, Appointment } from '@/types/doctor';

export const loadSchedules = async (doctorId: number) => {
  const response = await fetch(`${API_URLS.schedules}?doctor_id=${doctorId}`);
  const data = await response.json();
  return data.schedules || [];
};

export const loadDailySchedules = async (doctorId: number) => {
  const today = new Date();
  const twoMonthsLater = new Date(today);
  twoMonthsLater.setMonth(today.getMonth() + 2);
  
  const response = await fetch(`${API_URLS.schedules}?action=daily&doctor_id=${doctorId}&start_date=${today.toISOString().split('T')[0]}&end_date=${twoMonthsLater.toISOString().split('T')[0]}`);
  const data = await response.json();
  return data.daily_schedules || [];
};

export const loadCalendar = async (doctorId: number, year: number) => {
  const response = await fetch(`${API_URLS.schedules}?action=calendar&doctor_id=${doctorId}&year=${year}`);
  const data = await response.json();
  const calendarMap: {[key: string]: CalendarDay} = {};
  (data.calendar || []).forEach((day: any) => {
    calendarMap[day.calendar_date] = {
      is_working: day.is_working,
      note: day.note
    };
  });
  return calendarMap;
};

export const loadAppointments = async (doctorId: number, dateFilterFrom: string, dateFilterTo: string) => {
  const startDate = dateFilterFrom || new Date().toISOString().split('T')[0];
  const endDate = dateFilterTo || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const response = await fetch(`${API_URLS.appointments}?doctor_id=${doctorId}&start_date=${startDate}&end_date=${endDate}`);
  const data = await response.json();
  return data.appointments || [];
};

export const checkDayOffAppointments = async (doctorId: number, date: string) => {
  const response = await fetch(`${API_URLS.appointments}?doctor_id=${doctorId}&start_date=${date}&end_date=${date}`);
  const data = await response.json();
  const appointmentsOnDay = (data.appointments || []).filter((app: Appointment) => 
    app.status === 'scheduled' || app.status === 'completed' || app.status === 'cancelled'
  );
  return appointmentsOnDay.length;
};

export const updateCalendarDay = async (doctorId: number, date: string, isWorking: boolean) => {
  const response = await fetch(API_URLS.schedules, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'calendar',
      doctor_id: doctorId,
      calendar_date: date,
      is_working: isWorking
    })
  });
  return response.ok;
};