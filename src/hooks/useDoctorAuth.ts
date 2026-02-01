import { useState, useEffect } from 'react';
import { DoctorInfo } from '@/types/doctor';
import { API_URLS } from '@/constants/doctor';
import { useToast } from '@/hooks/use-toast';

export const useDoctorAuth = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [doctorInfo, setDoctorInfo] = useState<DoctorInfo | null>(null);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });

  useEffect(() => {
    const auth = localStorage.getItem('doctor_auth');
    if (auth) {
      const doctor = JSON.parse(auth);
      setDoctorInfo(doctor);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent, onSuccess: (doctor: DoctorInfo) => void) => {
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
        toast({ title: "Успешный вход", description: `Добро пожаловать, ${data.user.full_name}` });
        onSuccess(data.user);
      } else {
        toast({ title: "Ошибка", description: data.error || "Неверные данные", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('doctor_auth');
    setIsAuthenticated(false);
    setDoctorInfo(null);
  };

  return {
    isAuthenticated,
    doctorInfo,
    loginForm,
    setLoginForm,
    handleLogin,
    handleLogout
  };
};
