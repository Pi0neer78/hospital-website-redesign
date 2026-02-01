import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227';

export const useRegistrarAuth = () => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [registrarInfo, setRegistrarInfo] = useState<any>(null);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });

  useEffect(() => {
    const auth = localStorage.getItem('registrar_auth');
    if (auth) {
      const registrar = JSON.parse(auth);
      setRegistrarInfo(registrar);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent, onSuccess?: (clinic: string) => void) => {
    e.preventDefault();
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...loginForm, type: 'registrar' }),
      });
      
      const data = await response.json();
      
      if (response.ok && data.success) {
        localStorage.setItem('registrar_auth', JSON.stringify(data.user));
        setRegistrarInfo(data.user);
        setIsAuthenticated(true);
        toast({ title: "Успешный вход", description: `Добро пожаловать, ${data.user.full_name}` });
        if (onSuccess) onSuccess(data.user.clinic);
      } else {
        toast({ title: "Ошибка", description: data.error || "Неверные данные", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('registrar_auth');
    setIsAuthenticated(false);
    setRegistrarInfo(null);
  };

  return {
    isAuthenticated,
    registrarInfo,
    loginForm,
    setLoginForm,
    handleLogin,
    handleLogout
  };
};
