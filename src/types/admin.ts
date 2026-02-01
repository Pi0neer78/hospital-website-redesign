export interface AdminInfo {
  id: number;
  login: string;
  full_name?: string;
}

export interface Doctor {
  id: number;
  full_name: string;
  position: string;
  specialization: string;
  experience: string;
  education: string;
  photo_url?: string;
  login: string;
  password?: string;
  is_active: boolean;
  clinic: string;
}

export interface DoctorForm {
  full_name: string;
  position: string;
  specialization: string;
  experience: string;
  education: string;
  clinic: string;
  login: string;
  password: string;
  is_active: boolean;
  photo_url: string;
}

export interface Registrar {
  id: number;
  full_name: string;
  login: string;
  password?: string;
  clinic: string;
}

export interface RegistrarForm {
  full_name: string;
  login: string;
  password: string;
  clinic: string;
}

export interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  image_url?: string;
  display_order: number;
}

export interface FAQForm {
  question: string;
  answer: string;
  category: string;
  image_url: string;
  display_order: number;
}

export interface ForumUser {
  id: number;
  full_name: string;
  email?: string;
  is_blocked: boolean;
  block_reason?: string;
}

export interface ForumTopic {
  id: number;
  title: string;
  author: string;
  is_hidden: boolean;
  hide_reason?: string;
  created_at: string;
}

export interface Complaint {
  id: number;
  complaint_text: string;
  user_name?: string;
  user_email?: string;
  created_at: string;
  status: 'new' | 'resolved';
}

export interface Chat {
  id: number;
  user_name?: string;
  user_email?: string;
  status: 'active' | 'archived';
  operator_name?: string;
  created_at: string;
  last_message?: string;
  unread_count?: number;
}

export interface ChatMessage {
  id: number;
  chat_id: number;
  sender_type: 'user' | 'operator';
  message_text: string;
  created_at: string;
}

export interface ActivityLog {
  id: number;
  user_login: string;
  action_type: string;
  details: string;
  created_at: string;
  computer_name?: string;
}
