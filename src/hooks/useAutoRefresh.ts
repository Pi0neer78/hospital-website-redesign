import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useAutoRefresh = () => {
  const { toast } = useToast();
  
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

  return {
    autoRefreshEnabled,
    soundEnabled,
    checkInterval,
    lastCheckTime,
    setLastCheckTime,
    toggleAutoRefresh,
    toggleSound,
    changeCheckInterval,
    playNotificationSound
  };
};
