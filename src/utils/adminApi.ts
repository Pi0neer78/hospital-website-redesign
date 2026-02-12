const API_URLS = {
  doctors: 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688',
  faq: 'https://functions.poehali.dev/fb5160e8-f170-4c21-97a9-3afbcb6f78a9',
  forumModeration: 'https://functions.poehali.dev/70286923-439c-45b7-9744-403f0827a0c1',
  complaints: 'https://functions.poehali.dev/a6c04c63-0223-4bcc-b146-24acdef33536',
  chat: 'https://functions.poehali.dev/f0120272-0320-4731-8a43-e5c1362e3057',
  registrars: 'https://functions.poehali.dev/bda47195-c96f-4fb7-b72c-59d877add3c2',
  appointments: 'https://functions.poehali.dev/b1d89a5b-55d9-4ee9-bf3e-78d8f2013f83',
};

export const loadDoctors = async () => {
  const response = await fetch(API_URLS.doctors);
  const data = await response.json();
  return data.doctors || [];
};

export const loadRegistrars = async () => {
  const response = await fetch(`${API_URLS.registrars}?action=list`);
  const data = await response.json();
  return data.registrars || [];
};

export const loadFaqs = async () => {
  const response = await fetch(API_URLS.faq);
  const data = await response.json();
  return data.faqs || [];
};

export const loadForumUsers = async () => {
  const response = await fetch(`${API_URLS.forumModeration}?action=users`);
  const data = await response.json();
  return data.users || [];
};

export const loadForumTopics = async () => {
  const response = await fetch(`${API_URLS.forumModeration}?action=topics`);
  const data = await response.json();
  return data.topics || [];
};

export const loadComplaints = async (dateFrom?: string, dateTo?: string) => {
  let url = API_URLS.complaints;
  const params = new URLSearchParams();
  if (dateFrom) params.append('date_from', dateFrom);
  if (dateTo) params.append('date_to', dateTo);
  if (params.toString()) url += `?${params.toString()}`;
  
  const response = await fetch(url);
  const data = await response.json();
  return data.complaints || [];
};

export const loadChats = async (showArchived: boolean) => {
  const response = await fetch(`${API_URLS.chat}?status=${showArchived ? 'archived' : 'active'}`);
  const data = await response.json();
  return data.chats || [];
};

export const loadChatMessages = async (chatId: number) => {
  const response = await fetch(`${API_URLS.chat}?chat_id=${chatId}`);
  const data = await response.json();
  return data.messages || [];
};

export const loadRegistrarLogs = async (registrarId?: number, filters?: any) => {
  let url = `${API_URLS.registrars}?action=logs`;
  if (registrarId) url += `&registrar_id=${registrarId}`;
  url += '&limit=500';
  
  const response = await fetch(url);
  const data = await response.json();
  let logs = data.logs || [];
  
  if (filters?.type && filters.type !== 'all') {
    logs = logs.filter((log: any) => log.action_type === filters.type);
  }
  if (filters?.text) {
    logs = logs.filter((log: any) => 
      JSON.stringify(log).toLowerCase().includes(filters.text.toLowerCase())
    );
  }
  if (filters?.dateFrom) {
    logs = logs.filter((log: any) => log.timestamp >= filters.dateFrom);
  }
  if (filters?.dateTo) {
    logs = logs.filter((log: any) => log.timestamp <= filters.dateTo);
  }
  
  return logs;
};

export const loadDoctorLogs = async (doctorId?: number, filters?: any) => {
  let url = `${API_URLS.appointments}?action=doctor-logs`;
  if (doctorId) url += `&doctor_id=${doctorId}`;
  url += '&limit=500';
  
  const response = await fetch(url);
  const data = await response.json();
  let logs = data.logs || [];
  
  if (filters?.type && filters.type !== 'all') {
    logs = logs.filter((log: any) => log.action_type === filters.type);
  }
  if (filters?.text) {
    logs = logs.filter((log: any) => 
      JSON.stringify(log).toLowerCase().includes(filters.text.toLowerCase())
    );
  }
  if (filters?.dateFrom) {
    logs = logs.filter((log: any) => log.timestamp >= filters.dateFrom);
  }
  if (filters?.dateTo) {
    logs = logs.filter((log: any) => log.timestamp <= filters.dateTo);
  }
  
  return logs;
};