const API_URLS = {
  doctors: 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688',
  appointments: 'https://functions.poehali.dev/b1d89a5b-55d9-4ee9-bf3e-78d8f2013f83',
  schedules: 'https://functions.poehali.dev/6f53f66d-3e47-4e57-93dd-52d63c16d38f',
};

export const loadDoctors = async (clinic: string) => {
  const response = await fetch(API_URLS.doctors);
  const data = await response.json();
  
  const filteredDoctors = (data.doctors || []).filter((d: any) => {
    return d.clinic === clinic && d.is_active;
  });
  
  return filteredDoctors;
};

export const loadSchedules = async (doctorId: number) => {
  const response = await fetch(`${API_URLS.schedules}?doctor_id=${doctorId}`);
  const data = await response.json();
  return data.schedules || [];
};

export const loadCalendar = async (doctorId: number) => {
  const year = new Date().getFullYear();
  const response = await fetch(`${API_URLS.schedules}?action=calendar&doctor_id=${doctorId}&year=${year}`);
  const data = await response.json();
  
  const calendarMap: {[key: string]: {is_working: boolean}} = {};
  (data.calendar || []).forEach((day: any) => {
    calendarMap[day.calendar_date] = { is_working: day.is_working };
  });
  
  return calendarMap;
};

export const loadAppointments = async (doctorId: number, dateFrom?: string, dateTo?: string) => {
  const today = dateFrom || new Date().toISOString().split('T')[0];
  const endDate = dateTo || (() => {
    const end = new Date();
    end.setDate(end.getDate() + 30);
    return end.toISOString().split('T')[0];
  })();
  
  const response = await fetch(`${API_URLS.appointments}?doctor_id=${doctorId}&start_date=${today}&end_date=${endDate}`);
  const data = await response.json();
  return data.appointments || [];
};

export const loadAvailableSlots = async (doctorId: number, date: string) => {
  const response = await fetch(`${API_URLS.appointments}?action=available-slots&doctor_id=${doctorId}&date=${date}`);
  const data = await response.json();
  return data.available_slots || [];
};