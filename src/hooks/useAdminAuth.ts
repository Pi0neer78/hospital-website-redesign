import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227';

export const useAdminAuth = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [adminInfo, setAdminInfo] = useState<any>(null);

  useEffect(() => {
    const auth = localStorage.getItem('admin_auth');
    if (auth) {
      const admin = JSON.parse(auth);
      setAdminInfo(admin);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent, onSuccess?: () => void) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, type: 'admin' }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('admin_auth', JSON.stringify(data.user));
        setAdminInfo(data.user);
        setIsAuthenticated(true);
        toast({ title: "Успешный вход", description: `Добро пожаловать, ${data.user.full_name}` });
        if (onSuccess) onSuccess();
      } else {
        toast({ title: "Ошибка", description: data.error || "Неверные данные", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_auth');
    setIsAuthenticated(false);
    setAdminInfo(null);
  };

  return {
    isAuthenticated,
    adminInfo,
    loginForm,
    setLoginForm,
    handleLogin,
    handleLogout
  };
};
