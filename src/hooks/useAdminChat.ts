import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://functions.poehali.dev/f0120272-0320-4731-8a43-e5c1362e3057';
const CHAT_POLL_INTERVAL = 60000; // 60 seconds

export const useAdminChat = (isAuthenticated: boolean, operatorNameInit: string = 'Оператор') => {
  const { toast } = useToast();
  
  const [chats, setChats] = useState<any[]>([]);
  const [archivedChats, setArchivedChats] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<any>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [operatorMessage, setOperatorMessage] = useState('');
  const [operatorName, setOperatorName] = useState(operatorNameInit);
  const [newChatsCount, setNewChatsCount] = useState(0);
  const [lastMessageCount, setLastMessageCount] = useState<{[key: number]: number}>({});
  const lastMessageCountRef = useRef<{[key: number]: number}>({});
  const [previousChatCount, setPreviousChatCount] = useState(0);
  const [showArchived, setShowArchived] = useState(false);
  const [notificationSound] = useState(() => 
    typeof Audio !== 'undefined' 
      ? new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0PVqzn7bViFg==') 
      : null
  );

  const loadChats = async (silent: boolean = false) => {
    try {
      const response = await fetch(`${API_URL}?status=${showArchived ? 'archived' : 'active'}`);
      const data = await response.json();
      const loadedChats = data.chats || [];
      
      if (showArchived) {
        setArchivedChats(loadedChats);
      } else {
        setChats(loadedChats);
        
        // Check for new chats
        if (loadedChats.length > previousChatCount && !silent) {
          const diff = loadedChats.length - previousChatCount;
          setNewChatsCount(diff);
          if (notificationSound) {
            notificationSound.play().catch(() => {});
          }
          toast({ 
            title: "Новый чат", 
            description: `Поступило ${diff} новых обращений` 
          });
        }
        setPreviousChatCount(loadedChats.length);
        
        // Check for new messages in existing chats
        loadedChats.forEach((chat: any) => {
          const prevCount = lastMessageCountRef.current[chat.id] || 0;
          const currentCount = chat.message_count || 0;
          
          if (currentCount > prevCount && prevCount > 0) {
            if (notificationSound) {
              notificationSound.play().catch(() => {});
            }
          }
          
          lastMessageCountRef.current[chat.id] = currentCount;
        });
        setLastMessageCount({...lastMessageCountRef.current});
      }
    } catch (error) {
      if (!silent) {
        toast({ title: "Ошибка", description: "Не удалось загрузить чаты", variant: "destructive" });
      }
    }
  };

  const loadChatMessages = async (chatId: number, silent: boolean = false) => {
    try {
      const response = await fetch(`${API_URL}?chat_id=${chatId}`);
      const data = await response.json();
      setChatMessages(data.messages || []);
    } catch (error) {
      if (!silent) {
        toast({ title: "Ошибка", description: "Не удалось загрузить сообщения", variant: "destructive" });
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!operatorMessage.trim() || !selectedChat) return;
    
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: selectedChat.id,
          sender: 'operator',
          sender_name: operatorName,
          message: operatorMessage
        }),
      });

      if (response.ok) {
        setOperatorMessage('');
        loadChatMessages(selectedChat.id);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось отправить сообщение", variant: "destructive" });
    }
  };

  const handleArchiveChat = async (chatId: number) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          status: 'archived'
        }),
      });

      if (response.ok) {
        toast({ title: "Успешно", description: "Чат архивирован" });
        loadChats();
        setSelectedChat(null);
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось архивировать чат", variant: "destructive" });
    }
  };

  const handleAssignOperator = async (chatId: number, operator: string) => {
    try {
      const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          assigned_operator: operator
        }),
      });

      if (response.ok) {
        toast({ title: "Успешно", description: "Оператор назначен" });
        loadChats();
      }
    } catch (error) {
      toast({ title: "Ошибка", description: "Не удалось назначить оператора", variant: "destructive" });
    }
  };

  // Polling effect
  useEffect(() => {
    if (!isAuthenticated) return;
    
    let interval: NodeJS.Timeout | null = null;
    let isPageVisible = true;
    
    const startPolling = () => {
      if (interval) clearInterval(interval);
      interval = setInterval(() => {
        if (isPageVisible) {
          loadChats(true);
          if (selectedChat) {
            loadChatMessages(selectedChat.id, true);
          }
        }
      }, CHAT_POLL_INTERVAL);
    };
    
    const handleVisibilityChange = () => {
      isPageVisible = !document.hidden;
      if (isPageVisible) {
        loadChats(true);
        if (selectedChat) {
          loadChatMessages(selectedChat.id, true);
        }
        startPolling();
      } else {
        if (interval) {
          clearInterval(interval);
          interval = null;
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling();
    
    return () => {
      if (interval) clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isAuthenticated, selectedChat]);

  // Auto-scroll effect
  useEffect(() => {
    const container = document.getElementById('chat-scroll-anchor');
    if (container && chatMessages.length > 0) {
      container.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages]);

  return {
    chats,
    archivedChats,
    selectedChat,
    setSelectedChat,
    chatMessages,
    operatorMessage,
    setOperatorMessage,
    operatorName,
    setOperatorName,
    newChatsCount,
    lastMessageCount,
    showArchived,
    setShowArchived,
    loadChats,
    loadChatMessages,
    handleSendMessage,
    handleArchiveChat,
    handleAssignOperator
  };
};
