/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuTrigger, ContextMenuSeparator } from '@/components/ui/context-menu';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import RatingsStats from '@/components/ratings/RatingsStats';
import * as XLSX from 'xlsx';

const API_URLS = {
  auth: 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227',
  doctors: 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688',
  complaints: 'https://functions.poehali.dev/a6c04c63-0223-4bcc-b146-24acdef33536',
  sendEmail: 'https://functions.poehali.dev/d84a5ebe-b78c-4f71-8651-84a53f83538e',
  sendMax: 'https://functions.poehali.dev/2c30c595-bb80-4a76-ada9-ce851777ada2',
  registry: 'https://functions.poehali.dev/e644fdea-011f-4d16-b984-98838c4e6c69',
  doctorReport: 'https://functions.poehali.dev/8c48472a-a65f-4daf-9336-5a0454915673',
};

const MDoctor = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ login: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchFio, setSearchFio] = useState('');
  const [searchPosition, setSearchPosition] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [complaintComment, setComplaintComment] = useState('');
  const [complaintStatus, setComplaintStatus] = useState('');
  const [showComplaintDialog, setShowComplaintDialog] = useState(false);
  const [complaintSearch, setComplaintSearch] = useState('');
  const [complaintPageSize, setComplaintPageSize] = useState(20);
  const [complaintPage, setComplaintPage] = useState(1);
  const [complaintStatusFilter, setComplaintStatusFilter] = useState('all');
  const [showEmailError, setShowEmailError] = useState(false);
  const [emailErrorAddress, setEmailErrorAddress] = useState('');
  const [hoveredDoctorPhoto, setHoveredDoctorPhoto] = useState<string | null>(null);
  const [photoPosition, setPhotoPosition] = useState({ x: 0, y: 0 });
  const [registryRecords, setRegistryRecords] = useState<any[]>([]);
  const [registrySearch, setRegistrySearch] = useState('');
  const [registrySelected, setRegistrySelected] = useState<Set<number>>(new Set());
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [sendChannel, setSendChannel] = useState<'email' | 'max'>('email');
  const [sendMessage, setSendMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editRecord, setEditRecord] = useState<any>(null);
  const [editForm, setEditForm] = useState({ full_name: '', phone: '', email: '' });
  const [reportDateFrom, setReportDateFrom] = useState('');
  const [reportDateTo, setReportDateTo] = useState('');
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportFilterScheduled, setReportFilterScheduled] = useState('all');
  const [reportFilterCompleted, setReportFilterCompleted] = useState('all');
  const [reportFilterViolations, setReportFilterViolations] = useState('all');
  const [showLogDialog, setShowLogDialog] = useState(false);
  const [logEntries, setLogEntries] = useState<any[]>([]);
  const [logLoading, setLogLoading] = useState(false);

  const loadDoctors = async () => {
    try {
      const response = await fetch(`${API_URLS.doctors}?action=get_all`);
      const data = await response.json();
      if (data.doctors) {
        setDoctors(data.doctors);
      }
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  };

  const loadComplaints = async () => {
    try {
      const params = new URLSearchParams({ action: 'get_all' });
      if (dateFrom) params.append('date_from', dateFrom);
      if (dateTo) params.append('date_to', dateTo);
      
      const response = await fetch(`${API_URLS.complaints}?${params}`);
      const data = await response.json();
      if (data.complaints) {
        setComplaints(data.complaints);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
    }
  };

  const loadRegistry = async () => {
    try {
      const params = new URLSearchParams();
      if (registrySearch) params.append('search', registrySearch);
      const response = await fetch(`${API_URLS.registry}?${params}`);
      const data = await response.json();
      if (data.records) setRegistryRecords(data.records);
    } catch (error) {
      console.error('Error loading registry:', error);
    }
  };

  const handleRegistrySend = async () => {
    if (registrySelected.size === 0 || !sendMessage.trim()) {
      toast({ title: 'Ошибка', description: 'Выберите записи и введите текст сообщения', variant: 'destructive' });
      return;
    }
    setIsSending(true);
    try {
      const response = await fetch(API_URLS.registry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: sendChannel === 'email' ? 'send_email' : 'send_max',
          ids: Array.from(registrySelected),
          message: sendMessage
        })
      });
      const data = await response.json();
      if (data.success) {
        await logAction(sendChannel === 'email' ? 'Рассылка email из реестра' : 'Рассылка MAX из реестра', {
          recipients_count: registrySelected.size,
          sent_count: data.sent_count,
          message: sendMessage.substring(0, 200)
        });
        toast({ title: 'Успех', description: `Отправлено: ${data.sent_count}${data.errors?.length ? `. Ошибки: ${data.errors.length}` : ''}` });
        if (data.errors?.length) {
          console.log('Send errors:', data.errors);
        }
        setShowSendDialog(false);
        setSendMessage('');
        loadRegistry();
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    } finally {
      setIsSending(false);
    }
  };

  const loadReport = async () => {
    setReportLoading(true);
    try {
      const params = new URLSearchParams();
      if (reportDateFrom) params.append('date_from', reportDateFrom);
      if (reportDateTo) params.append('date_to', reportDateTo);
      const response = await fetch(`${API_URLS.doctorReport}?${params}`);
      const data = await response.json();
      if (data.report) setReportData(data.report);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить отчёт', variant: 'destructive' });
    } finally {
      setReportLoading(false);
    }
  };

  const openEditDialog = (rec: any) => {
    setEditRecord(rec);
    setEditForm({ full_name: rec.full_name || '', phone: rec.phone || '', email: rec.email || '' });
    setShowEditDialog(true);
  };

  const handleRegistryUpdate = async () => {
    if (!editRecord) return;
    try {
      const response = await fetch(API_URLS.registry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'update', id: editRecord.id, ...editForm })
      });
      const data = await response.json();
      if (data.success) {
        await logAction('Редактирование записи реестра', {
          record_id: editRecord.id,
          full_name: editForm.full_name,
          phone: editForm.phone,
          email: editForm.email
        });
        toast({ title: 'Сохранено' });
        setShowEditDialog(false);
        loadRegistry();
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось сохранить', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleRegistryDelete = async (rec: any) => {
    if (!confirm(`Удалить запись "${rec.full_name}"?`)) return;
    try {
      const response = await fetch(API_URLS.registry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', id: rec.id })
      });
      const data = await response.json();
      if (data.success) {
        await logAction('Удаление записи реестра', {
          record_id: rec.id,
          full_name: rec.full_name,
          phone: rec.phone
        });
        toast({ title: 'Удалено' });
        const next = new Set(registrySelected);
        next.delete(rec.id);
        setRegistrySelected(next);
        loadRegistry();
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleRegistryDeleteSelected = async () => {
    if (registrySelected.size === 0) return;
    if (!confirm(`Удалить выбранные записи (${registrySelected.size})?`)) return;
    try {
      const response = await fetch(API_URLS.registry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete', ids: Array.from(registrySelected) })
      });
      const data = await response.json();
      if (data.success) {
        await logAction('Массовое удаление из реестра', {
          deleted_count: data.deleted,
          ids: Array.from(registrySelected)
        });
        toast({ title: 'Удалено', description: `Удалено записей: ${data.deleted}` });
        setRegistrySelected(new Set());
        loadRegistry();
      }
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const logAction = async (actionType: string, details: any) => {
    try {
      const mdoctorUser = localStorage.getItem('mdoctor_user');
      const adminLogin = mdoctorUser ? JSON.parse(mdoctorUser).login : 'admin';
      
      await fetch(API_URLS.registry, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'log',
          admin_login: adminLogin,
          action_type: actionType,
          details: JSON.stringify(details),
          computer_name: navigator.userAgent
        })
      });
    } catch (error) {
      console.error('Failed to log action:', error);
    }
  };

  const loadLogs = async (adminLogin?: string) => {
    setLogLoading(true);
    try {
      const params = new URLSearchParams({ action: 'logs', limit: '200' });
      if (adminLogin) params.append('admin_login', adminLogin);
      const response = await fetch(`${API_URLS.registry}?${params}`);
      const data = await response.json();
      if (data.logs) setLogEntries(data.logs);
    } catch {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить журнал', variant: 'destructive' });
    } finally {
      setLogLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('mdoctor_token');
    if (token) {
      setIsAuthenticated(true);
      loadDoctors();
      loadComplaints();
      loadRegistry();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(API_URLS.auth, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login_admin',
          login: loginForm.login,
          password: loginForm.password
        })
      });
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('mdoctor_token', data.token);
        localStorage.setItem('mdoctor_user', JSON.stringify({ login: loginForm.login }));
        setIsAuthenticated(true);
        toast({ title: 'Вход выполнен', description: 'Добро пожаловать!' });
        loadDoctors();
        loadComplaints();
      } else {
        toast({ title: 'Ошибка', description: data.message || 'Неверный логин или пароль', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('mdoctor_token');
    localStorage.removeItem('mdoctor_user');
    setIsAuthenticated(false);
    setLoginForm({ login: '', password: '' });
    toast({ title: 'Выход', description: 'Вы вышли из системы' });
  };

  const handleDoctorClick = async (doctor: any) => {
    try {
      window.open(`/doctor?id=${doctor.id}&source=mdoctor`, '_blank');
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось перейти в кабинет врача', variant: 'destructive' });
    }
  };

  const handlePhotoHover = (photoUrl: string | null, event?: React.MouseEvent) => {
    if (photoUrl && event) {
      setPhotoPosition({ x: event.clientX + 20, y: event.clientY + 20 });
    }
    setHoveredDoctorPhoto(photoUrl);
  };

  const handleComplaintAction = (complaint: any) => {
    setSelectedComplaint(complaint);
    setComplaintComment(complaint.comment || '');
    setComplaintStatus(complaint.status);
    setShowComplaintDialog(true);
  };

  const isComplaintResolved = selectedComplaint?.status === 'resolved';

  const updateComplaintStatus = async () => {
    if (!selectedComplaint) return;

    try {
      const mdoctorUser = localStorage.getItem('mdoctor_user');
      const adminLogin = mdoctorUser ? JSON.parse(mdoctorUser).login : 'admin';

      const response = await fetch(API_URLS.complaints, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_status',
          complaint_id: selectedComplaint.id,
          status: complaintStatus,
          comment: complaintComment,
          resolved_at: complaintStatus === 'resolved' ? new Date().toISOString() : null,
          admin_login: adminLogin
        })
      });

      const data = await response.json();
      console.log('Update complaint response:', data);
      if (data.success || data.message === 'Статус жалобы обновлён') {
        await logAction('Изменение статуса жалобы', {
          complaint_id: selectedComplaint.id,
          patient_name: selectedComplaint.name,
          old_status: selectedComplaint.status,
          new_status: complaintStatus,
          comment: complaintComment
        });
        toast({ title: 'Успех', description: 'Статус жалобы обновлён' });
        loadComplaints();
        setShowComplaintDialog(false);
        setSelectedComplaint(null);
      } else {
        toast({ title: 'Ошибка', description: data.message || 'Не удалось обновить статус', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const sendEmailResponse = async () => {
    if (!selectedComplaint || !selectedComplaint.email || !complaintComment) {
      toast({ title: 'Ошибка', description: 'Необходимо указать email и комментарий', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URLS.sendEmail, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedComplaint.email,
          complaint_date: selectedComplaint.created_at,
          complaint_message: selectedComplaint.message,
          comment: complaintComment
        })
      });

      const data = await response.json();
      if (data.success) {
        await logAction('Отправка email по жалобе', {
          complaint_id: selectedComplaint.id,
          patient_name: selectedComplaint.name,
          email: selectedComplaint.email,
          comment: complaintComment
        });
        toast({ title: 'Успех', description: 'Ответ отправлен на email пациента' });
        
        // Обновляем статус жалобы с пометкой о дате ответа
        await fetch(API_URLS.complaints, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            complaint_id: selectedComplaint.id,
            status: complaintStatus,
            comment: complaintComment,
            responded_at: data.sent_at,
            admin_login: localStorage.getItem('mdoctor_user') ? JSON.parse(localStorage.getItem('mdoctor_user')!).login : 'admin'
          })
        });
        
        // Обновляем локальное состояние жалобы
        setSelectedComplaint({ ...selectedComplaint, responded_at: data.sent_at });
        await loadComplaints();
      } else {
        setEmailErrorAddress(selectedComplaint.email);
        setShowEmailError(true);
      }
    } catch (error) {
      setEmailErrorAddress(selectedComplaint.email);
      setShowEmailError(true);
    }
  };

  const sendMaxResponse = async () => {
    if (!selectedComplaint || !selectedComplaint.phone || !complaintComment) {
      toast({ title: 'Ошибка', description: 'Необходимо указать телефон и комментарий', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URLS.sendMax, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: selectedComplaint.phone,
          complaint_date: selectedComplaint.created_at,
          complaint_message: selectedComplaint.message,
          comment: complaintComment
        })
      });

      const data = await response.json();
      if (data.success) {
        await logAction('Отправка MAX по жалобе', {
          complaint_id: selectedComplaint.id,
          patient_name: selectedComplaint.name,
          phone: selectedComplaint.phone,
          comment: complaintComment
        });
        toast({ title: 'Успех', description: 'Ответ отправлен в мессенджер MAX' });

        await fetch(API_URLS.complaints, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'update_status',
            complaint_id: selectedComplaint.id,
            status: complaintStatus,
            comment: complaintComment,
            max_responded_at: data.sent_at,
            admin_login: localStorage.getItem('mdoctor_user') ? JSON.parse(localStorage.getItem('mdoctor_user')!).login : 'admin'
          })
        });

        setSelectedComplaint({ ...selectedComplaint, max_responded_at: data.sent_at });
        await loadComplaints();
      } else {
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить сообщение в MAX', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение в MAX', variant: 'destructive' });
    }
  };

  const groupedDoctors = doctors.reduce((acc: Record<string, any[]>, doctor: any) => {
    const clinic = doctor.clinic || 'Не указано';
    if (!acc[clinic]) {
      acc[clinic] = [];
    }
    acc[clinic].push(doctor);
    return acc;
  }, {} as Record<string, any[]>);

  const filteredGroupedDoctors = Object.entries(groupedDoctors).reduce((acc: Record<string, any[]>, [clinic, docs]: [string, any]) => {
    const filtered = (docs as any[]).filter((doc: any) => {
      const fioMatch = !searchFio || doc.full_name?.toLowerCase().includes(searchFio.toLowerCase());
      const positionMatch = !searchPosition || doc.position?.toLowerCase().includes(searchPosition.toLowerCase());
      return fioMatch && positionMatch;
    });
    
    if (filtered.length > 0) {
      acc[clinic] = filtered;
    }
    return acc;
  }, {} as Record<string, any[]>);

  const allFilteredComplaints = complaints.filter((c: any) => {
    if (complaintStatusFilter !== 'all' && c.status !== complaintStatusFilter) return false;
    if (!complaintSearch) return true;
    const search = complaintSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.phone?.toLowerCase().includes(search) ||
      c.message?.toLowerCase().includes(search)
    );
  });
  const complaintTotalPages = Math.max(1, Math.ceil(allFilteredComplaints.length / complaintPageSize));
  const safeComplaintPage = Math.min(complaintPage, complaintTotalPages);
  const filteredComplaints = allFilteredComplaints.slice((safeComplaintPage - 1) * complaintPageSize, safeComplaintPage * complaintPageSize);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Кабинет главного врача</CardTitle>
            <CardDescription className="text-center">Войдите для продолжения</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Логин</label>
                <Input
                  type="text"
                  value={loginForm.login}
                  onChange={(e) => setLoginForm({ ...loginForm, login: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium">Пароль</label>
                <div className="relative">
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full">
                <Icon name="LogIn" className="mr-2" size={16} />
                Войти
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')}>
              <Icon name="Home" size={20} />
            </Button>
            <h1 className="text-2xl font-bold text-gray-800">Кабинет главного врача</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleLogout}>
              <Icon name="LogOut" className="mr-2" size={16} />
              Выйти
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4">
        <Tabs defaultValue="doctors" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-xl mx-auto h-10">
            <TabsTrigger value="doctors" className="py-1.5">
              <Icon name="Users" className="mr-2" size={16} />
              Врачи
            </TabsTrigger>
            <TabsTrigger value="complaints" className="py-1.5">
              <Icon name="AlertCircle" className="mr-2" size={16} />
              Жалобы
            </TabsTrigger>
            <TabsTrigger value="registry" className="py-1.5" onClick={() => loadRegistry()}>
              <Icon name="BookUser" className="mr-2" size={16} />
              Реестр
            </TabsTrigger>
            <TabsTrigger value="reports" className="py-1.5">
              <Icon name="FileText" className="mr-2" size={16} />
              Отчеты
            </TabsTrigger>
            <TabsTrigger value="ratings" className="py-1.5">
              <Icon name="Star" className="mr-2" size={16} />
              Голосование
            </TabsTrigger>
          </TabsList>

          <TabsContent value="doctors">
            <Card>
              <CardHeader>
                <CardTitle>Список врачей</CardTitle>
                <CardDescription>Все зарегистрированные врачи в системе</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по ФИО..."
                      value={searchFio}
                      onChange={(e) => setSearchFio(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      placeholder="Поиск по должности..."
                      value={searchPosition}
                      onChange={(e) => setSearchPosition(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-6">
                  {Object.entries(filteredGroupedDoctors).map(([clinic, docs]) => (
                    <div key={clinic} className="border rounded-lg p-4">
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Icon name="Building2" size={20} />
                        {clinic}
                        <span className="text-sm text-muted-foreground font-normal">({(docs as any[]).length})</span>
                      </h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-12"></TableHead>
                              <TableHead>ФИО</TableHead>
                              <TableHead>Специализация</TableHead>
                              <TableHead>Должность</TableHead>
                              <TableHead>Телефон</TableHead>
                              <TableHead>Стаж</TableHead>
                              <TableHead>Кабинет</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {(docs as any[]).map((doctor: any) => (
                              <TableRow key={doctor.id}>
                                <TableCell>
                                  {doctor.photo_url && (
                                    <div
                                      className="relative"
                                      onMouseEnter={(e) => handlePhotoHover(doctor.photo_url, e)}
                                      onMouseMove={(e) => setPhotoPosition({ x: e.clientX + 20, y: e.clientY + 20 })}
                                      onMouseLeave={() => handlePhotoHover(null)}
                                    >
                                      <img
                                        src={doctor.photo_url}
                                        alt={doctor.full_name}
                                        className="w-8 h-8 object-cover cursor-pointer"
                                      />
                                    </div>
                                  )}
                                </TableCell>
                                <TableCell>
                                  <button
                                    onClick={() => handleDoctorClick(doctor)}
                                    className="font-medium text-blue-600 hover:text-blue-800 hover:underline cursor-pointer"
                                  >
                                    {doctor.full_name}
                                  </button>
                                </TableCell>
                                <TableCell>{doctor.specialization}</TableCell>
                                <TableCell>{doctor.position}</TableCell>
                                <TableCell>{doctor.phone}</TableCell>
                                <TableCell>{doctor.work_experience || '—'}</TableCell>
                                <TableCell>{doctor.office_number || '—'}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  ))}
                  {Object.keys(filteredGroupedDoctors).length === 0 && (
                    <div className="text-center text-muted-foreground py-8">
                      {doctors.length === 0 ? 'Нет данных' : 'Ничего не найдено'}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="complaints">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Жалобы пациентов</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 space-y-2">
                  <div className="flex gap-1 items-end">
                    <div className="flex gap-1 items-end flex-1">
                      <div className="w-64">
                        <Input
                          placeholder="Поиск по ФИО, телефону, тексту жалобы..."
                          value={complaintSearch}
                          onChange={(e) => setComplaintSearch(e.target.value)}
                          className="h-8 text-sm"
                        />
                      </div>
                      <Button size="sm" variant="outline" onClick={() => { setComplaintSearch(''); setDateFrom(''); setDateTo(''); setComplaintStatusFilter('all'); setComplaintPage(1); }} className="h-8 w-8 p-0">
                        <Icon name="X" size={12} />
                      </Button>
                      <div>
                        <Input
                          type="date"
                          value={dateFrom}
                          onChange={(e) => setDateFrom(e.target.value)}
                          className="h-8 w-32 text-xs"
                        />
                      </div>
                      <div>
                        <Input
                          type="date"
                          value={dateTo}
                          onChange={(e) => setDateTo(e.target.value)}
                          className="h-8 w-32 text-xs"
                        />
                      </div>
                      <Select value={complaintStatusFilter} onValueChange={setComplaintStatusFilter}>
                        <SelectTrigger className="h-8 w-36 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Все статусы</SelectItem>
                          <SelectItem value="new">Новые</SelectItem>
                          <SelectItem value="in_progress">На рассмотрении</SelectItem>
                          <SelectItem value="resolved">Решены</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" variant="outline" onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      
                      const statusText = complaintStatusFilter === 'all' ? 'Все статусы' : 
                                        complaintStatusFilter === 'new' ? 'Новые' :
                                        complaintStatusFilter === 'in_progress' ? 'На рассмотрении' : 'Решены';
                      const periodText = dateFrom || dateTo 
                        ? `Период: ${dateFrom ? new Date(dateFrom).toLocaleDateString('ru-RU') : 'начало'} - ${dateTo ? new Date(dateTo).toLocaleDateString('ru-RU') : 'сегодня'}`
                        : 'Период: всё время';
                      
                      const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Жалобы</title>
  <style>
    @page { size: landscape; margin: 10mm 10mm 20mm 10mm; @bottom-center { content: "Страница " counter(page) " из " counter(pages); font-size: 10px; color: #666; } }
    body { font-family: Arial, sans-serif; font-size: 13px; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h2 { margin: 5px 0; font-size: 18px; }
    .header p { margin: 3px 0; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th, td { border: 1px solid #333; padding: 6px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; font-size: 12px; }
    .status-resolved { color: green; }
    .status-progress { color: orange; }
    .status-new { color: gray; }
    .footer { font-size: 11px; color: #666; margin-top: 10px; }
    .page-footer { position: fixed; bottom: 0; left: 0; right: 0; text-align: center; font-size: 10px; color: #666; padding: 5px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Список жалоб пациентов</h2>
    <p>Организация: ГБУЗ Антрацитовская центральная городская многопрофильная больница</p>
    <p>${periodText} | Статус: ${statusText}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th style="width: 6%">Почта</th>
        <th style="width: 6%">MAX</th>
        <th style="width: 6%">ФИО</th>
        <th style="width: 10%">Email</th>
        <th style="width: 9%">Телефон</th>
        <th style="width: 22%">Текст жалобы</th>
        <th style="width: 24%">Комментарий</th>
        <th style="width: 10%">Дата</th>
        <th style="width: 7%">Статус</th>
      </tr>
    </thead>
    <tbody>
      ${filteredComplaints.map((c: any) => `
        <tr>
          <td style="font-size: 11px;">${c.responded_at ? '📧 ' + new Date(c.responded_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'}</td>
          <td style="font-size: 11px;">${c.max_responded_at ? '💬 ' + new Date(c.max_responded_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'}</td>
          <td>${c.name || '—'}</td>
          <td style="font-size: 11px;">${c.email || '—'}</td>
          <td>${c.phone || '—'}</td>
          <td>${c.message}</td>
          <td>${c.comment || '—'}</td>
          <td style="font-size: 11px;">${new Date(c.created_at).toLocaleDateString('ru-RU')} ${new Date(c.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
          <td class="${
            c.status === 'resolved' ? 'status-resolved' :
            c.status === 'in_progress' ? 'status-progress' : 'status-new'
          }">${
            c.status === 'resolved' ? 'Решена' :
            c.status === 'in_progress' ? 'На рассм.' : 'Новая'
          }</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">
    Всего записей: ${complaints.length} | Отображено: ${filteredComplaints.length}
  </div>
</body>
</html>
                      `;
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => {
                        printWindow.print();
                        printWindow.close();
                      }, 250);
                    }} className="h-8">
                      <Icon name="Printer" size={12} className="mr-1" />
                      <span className="text-xs">Печать</span>
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const rows = filteredComplaints.map((c: any) => ({
                        'ФИО': c.name || '',
                        'Email': c.email || '',
                        'Телефон': c.phone || '',
                        'Жалоба': c.message || '',
                        'Комментарий': c.comment || '',
                        'Дата': new Date(c.created_at).toLocaleDateString('ru-RU'),
                        'Статус': c.status === 'resolved' ? 'Решена' : c.status === 'in_progress' ? 'На рассмотрении' : c.status === 'new' ? 'Новая' : c.status,
                        'Ответ почта': c.responded_at ? new Date(c.responded_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '',
                        'Ответ MAX': c.max_responded_at ? new Date(c.max_responded_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : ''
                      }));
                      const ws = XLSX.utils.json_to_sheet(rows);
                      ws['!cols'] = [{ wch: 20 }, { wch: 25 }, { wch: 15 }, { wch: 40 }, { wch: 30 }, { wch: 12 }, { wch: 15 }, { wch: 18 }, { wch: 18 }];
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Жалобы');
                      XLSX.writeFile(wb, 'жалобы.xlsx');
                      }} className="h-8 bg-green-600 text-white hover:bg-green-700 border-green-600">
                        <Icon name="Download" size={12} className="mr-1" />
                        <span className="text-xs">Экспорт в Эксель</span>
                      </Button>
                    </div>
                    <Button size="sm" variant="outline" onClick={loadComplaints} className="h-8 bg-blue-500 text-white hover:bg-blue-600 border-blue-500">
                      <Icon name="RefreshCw" size={12} className="mr-1" />
                      <span className="text-xs">Обновить</span>
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto border rounded-md" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-orange-100 z-10">
                      <TableRow className="text-xs">
                        <TableHead className="py-2 w-10"></TableHead>
                        <TableHead className="py-2 w-32">Ответ</TableHead>
                        <TableHead className="py-2">ФИО</TableHead>
                        <TableHead className="py-2">Email</TableHead>
                        <TableHead className="py-2">Телефон</TableHead>
                        <TableHead className="py-2">Текст жалобы</TableHead>
                        <TableHead className="py-2">Комментарий</TableHead>
                        <TableHead className="py-2">Дата</TableHead>
                        <TableHead className="py-2">Статус</TableHead>
                        <TableHead className="py-2">Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredComplaints.map((complaint: any) => (
                        <TableRow key={complaint.id} className="text-xs">
                          <TableCell className="py-2">
                            <div className="flex gap-1">
                              <Icon 
                                name="Mail" 
                                size={14} 
                                className={complaint.responded_at ? 'text-blue-600' : 'text-gray-300'} 
                                title={complaint.responded_at ? 'Ответ по почте отправлен' : 'Почта: не отвечено'}
                              />
                              <Icon 
                                name="MessageCircle" 
                                size={14} 
                                className={complaint.max_responded_at ? 'text-green-600' : 'text-gray-300'} 
                                title={complaint.max_responded_at ? 'Ответ по MAX отправлен' : 'MAX: не отвечено'}
                              />
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="space-y-0.5">
                              {complaint.responded_at && (
                                <div className="flex items-center gap-1 text-blue-600">
                                  <Icon name="Mail" size={10} />
                                  <span>{new Date(complaint.responded_at).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }).replace(',', '')}</span>
                                </div>
                              )}
                              {complaint.max_responded_at && (
                                <div className="flex items-center gap-1 text-green-600">
                                  <Icon name="MessageCircle" size={10} />
                                  <span>{new Date(complaint.max_responded_at).toLocaleString('ru-RU', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: '2-digit',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  }).replace(',', '')}</span>
                                </div>
                              )}
                              {!complaint.responded_at && !complaint.max_responded_at && '—'}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">{complaint.name || '—'}</TableCell>
                          <TableCell className="py-2">{complaint.email || '—'}</TableCell>
                          <TableCell className="py-2">{complaint.phone || '—'}</TableCell>
                          <TableCell className="py-2 max-w-xs">
                            <div 
                              className="line-clamp-1" 
                              title={complaint.message}
                            >
                              {complaint.message}
                            </div>
                          </TableCell>
                          <TableCell className="py-2 max-w-xs">
                            <div 
                              className="line-clamp-1" 
                              title={complaint.comment || ''}
                            >
                              {complaint.comment || '—'}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div>{new Date(complaint.created_at).toLocaleDateString('ru-RU')}</div>
                            <div className="text-muted-foreground">
                              {new Date(complaint.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className={`px-2 py-0.5 rounded-full whitespace-nowrap ${
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {complaint.status === 'resolved' ? 'Решена' :
                               complaint.status === 'in_progress' ? 'На рассмотр.' : 'Новая'}
                            </span>
                          </TableCell>
                          <TableCell className="py-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplaintAction(complaint)}
                              className="h-7 px-2"
                            >
                              <Icon name="Edit" size={12} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {filteredComplaints.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            Нет данных
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                <div className="mt-3 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Показано {(safeComplaintPage - 1) * complaintPageSize + 1}–{Math.min(safeComplaintPage * complaintPageSize, allFilteredComplaints.length)} из {allFilteredComplaints.length}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={safeComplaintPage <= 1} onClick={() => setComplaintPage(1)} title="Первая страница">
                      <Icon name="ChevronsLeft" size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={safeComplaintPage <= 1} onClick={() => setComplaintPage(safeComplaintPage - 1)} title="Предыдущая">
                      <Icon name="ChevronLeft" size={14} />
                    </Button>
                    <span className="text-sm px-2">{safeComplaintPage} / {complaintTotalPages}</span>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={safeComplaintPage >= complaintTotalPages} onClick={() => setComplaintPage(safeComplaintPage + 1)} title="Следующая">
                      <Icon name="ChevronRight" size={14} />
                    </Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0" disabled={safeComplaintPage >= complaintTotalPages} onClick={() => setComplaintPage(complaintTotalPages)} title="Последняя страница">
                      <Icon name="ChevronsRight" size={14} />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Показывать:</span>
                    <Select value={complaintPageSize.toString()} onValueChange={(v) => { setComplaintPageSize(Number(v)); setComplaintPage(1); }}>
                      <SelectTrigger className="h-8 w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="registry">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Реестр пациентов</CardTitle>

              </CardHeader>
              <CardContent>
                <div className="mb-3 flex gap-2 items-end flex-wrap">
                  <div className="w-64">
                    <Input
                      placeholder="Поиск по ФИО, телефону, email..."
                      value={registrySearch}
                      onChange={(e) => setRegistrySearch(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && loadRegistry()}
                      className="h-8 text-sm"
                    />
                  </div>
                  <Button size="sm" variant="outline" onClick={loadRegistry} className="h-8">
                    <Icon name="Search" size={12} className="mr-1" />
                    <span className="text-xs">Найти</span>
                  </Button>
                  <div className="flex gap-1 ml-auto">
                    <Button size="sm" variant="outline" onClick={() => {
                      const allIds = new Set(registryRecords.map((r: any) => r.id));
                      setRegistrySelected(allIds);
                    }} className="h-8 w-8 p-0" title="Выбрать все">
                      <Icon name="CheckSquare" size={12} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => setRegistrySelected(new Set())} className="h-8 w-8 p-0" title="Снять все">
                      <Icon name="Square" size={12} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const inverted = new Set<number>();
                      registryRecords.forEach((r: any) => {
                        if (!registrySelected.has(r.id)) inverted.add(r.id);
                      });
                      setRegistrySelected(inverted);
                    }} className="h-8 w-8 p-0" title="Инвертировать">
                      <Icon name="Replace" size={12} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Реестр пациентов</title>
  <style>
    @page { size: landscape; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 12px; }
    .header { text-align: center; margin-bottom: 15px; }
    .header h2 { margin: 5px 0; font-size: 18px; }
    .header p { margin: 3px 0; font-size: 12px; color: #666; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 5px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; font-size: 11px; }
    td { font-size: 11px; }
    .footer { font-size: 11px; color: #666; margin-top: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h2>Реестр пациентов</h2>
    <p>Дата печати: ${new Date().toLocaleString('ru-RU')}</p>
  </div>
  <table>
    <thead>
      <tr>
        <th>ФИО</th>
        <th>Телефон</th>
        <th>Email</th>
        <th>Источник</th>
        <th>Жалоба</th>
        <th>Запись</th>
        <th>Посл. email</th>
        <th>Посл. MAX</th>
      </tr>
    </thead>
    <tbody>
      ${registryRecords.map((r: any) => `
        <tr>
          <td>${r.full_name || '—'}</td>
          <td>${r.phone || '—'}</td>
          <td>${r.email || '—'}</td>
          <td>${r.source_type === 'complaint' ? 'Жалоба' : 'Запись'}</td>
          <td>${r.complaint_date ? new Date(r.complaint_date).toLocaleDateString('ru-RU') : '—'}</td>
          <td>${r.appointment_date ? new Date(r.appointment_date).toLocaleDateString('ru-RU') : '—'}</td>
          <td>${r.last_email_sent_at ? new Date(r.last_email_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'}</td>
          <td>${r.last_max_sent_at ? new Date(r.last_max_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '—'}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
  <div class="footer">Всего записей: ${registryRecords.length}</div>
</body>
</html>`;
                      printWindow.document.write(printContent);
                      printWindow.document.close();
                      printWindow.focus();
                      setTimeout(() => { printWindow.print(); printWindow.close(); }, 250);
                    }} className="h-8 w-8 p-0" title="Печать">
                      <Icon name="Printer" size={12} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const rows = registryRecords.map((r: any) => ({
                        'ФИО': r.full_name || '',
                        'Телефон': r.phone || '',
                        'Email': r.email || '',
                        'Источник': r.source_type === 'complaint' ? 'Жалоба' : 'Запись',
                        'Дата жалобы': r.complaint_date ? new Date(r.complaint_date).toLocaleDateString('ru-RU') : '',
                        'Дата записи': r.appointment_date ? new Date(r.appointment_date).toLocaleDateString('ru-RU') : '',
                        'Посл. email': r.last_email_sent_at ? new Date(r.last_email_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '',
                        'Текст email': r.last_email_text || '',
                        'Посл. MAX': r.last_max_sent_at ? new Date(r.last_max_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '') : '',
                        'Текст MAX': r.last_max_text || ''
                      }));
                      const ws = XLSX.utils.json_to_sheet(rows);
                      ws['!cols'] = [{ wch: 25 }, { wch: 15 }, { wch: 25 }, { wch: 10 }, { wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 30 }];
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Реестр');
                      XLSX.writeFile(wb, 'реестр_пациентов.xlsx');
                    }} className="h-8 w-8 p-0 bg-green-600 text-white hover:bg-green-700 border-green-600" title="Экспорт в Excel">
                      <Icon name="Download" size={12} />
                    </Button>
                  </div>
                  <Button size="sm" onClick={() => { setSendChannel('email'); setShowSendDialog(true); }} disabled={registrySelected.size === 0} className="h-8 bg-blue-600 hover:bg-blue-700">
                    <Icon name="Mail" size={12} className="mr-1" />
                    <span className="text-xs">На почту ({registrySelected.size})</span>
                  </Button>
                  <Button size="sm" onClick={() => { setSendChannel('max'); setShowSendDialog(true); }} disabled={registrySelected.size === 0} className="h-8 bg-green-600 hover:bg-green-700">
                    <Icon name="MessageCircle" size={12} className="mr-1" />
                    <span className="text-xs">В MAX ({registrySelected.size})</span>
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleRegistryDeleteSelected} disabled={registrySelected.size === 0} className="h-8 text-red-600 border-red-300 hover:bg-red-50">
                    <Icon name="Trash2" size={12} className="mr-1" />
                    <span className="text-xs">Удалить ({registrySelected.size})</span>
                  </Button>
                </div>

                <div className="overflow-x-auto border rounded-md" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-blue-100 z-10">
                      <TableRow className="text-xs">
                        <TableHead className="py-2 w-10">
                          <input
                            type="checkbox"
                            checked={registryRecords.length > 0 && registrySelected.size === registryRecords.length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setRegistrySelected(new Set(registryRecords.map((r: any) => r.id)));
                              } else {
                                setRegistrySelected(new Set());
                              }
                            }}
                            className="w-4 h-4 cursor-pointer"
                          />
                        </TableHead>
                        <TableHead className="py-2">ФИО</TableHead>
                        <TableHead className="py-2">Телефон</TableHead>
                        <TableHead className="py-2">Email</TableHead>
                        <TableHead className="py-2">Источник</TableHead>
                        <TableHead className="py-2">Жалоба</TableHead>
                        <TableHead className="py-2">Запись</TableHead>
                        <TableHead className="py-2">Посл. email</TableHead>
                        <TableHead className="py-2">Посл. MAX</TableHead>
                        <TableHead className="py-2 w-16"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {registryRecords.map((rec: any) => (
                        <ContextMenu key={rec.id}>
                          <ContextMenuTrigger asChild>
                            <TableRow className={`text-xs ${registrySelected.has(rec.id) ? 'bg-blue-50' : ''}`}>
                              <TableCell className="py-2">
                                <input
                                  type="checkbox"
                                  checked={registrySelected.has(rec.id)}
                                  onChange={(e) => {
                                    const next = new Set(registrySelected);
                                    if (e.target.checked) next.add(rec.id);
                                    else next.delete(rec.id);
                                    setRegistrySelected(next);
                                  }}
                                  className="w-4 h-4 cursor-pointer"
                                />
                              </TableCell>
                              <TableCell className="py-2 font-medium">{rec.full_name || '—'}</TableCell>
                              <TableCell className="py-2">{rec.phone || '—'}</TableCell>
                              <TableCell className="py-2" style={{ fontSize: '11px' }}>{rec.email || '—'}</TableCell>
                              <TableCell className="py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[10px] ${rec.source_type === 'complaint' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                                  {rec.source_type === 'complaint' ? 'Жалоба' : 'Запись'}
                                </span>
                              </TableCell>
                              <TableCell className="py-2">{rec.complaint_date ? new Date(rec.complaint_date).toLocaleDateString('ru-RU') : '—'}</TableCell>
                              <TableCell className="py-2">{rec.appointment_date ? new Date(rec.appointment_date).toLocaleDateString('ru-RU') : '—'}</TableCell>
                              <TableCell className="py-2">
                                {rec.last_email_sent_at ? (
                                  <div title={rec.last_email_text || ''}>
                                    <div className="text-blue-600">{new Date(rec.last_email_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</div>
                                    <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[120px]">{rec.last_email_text}</div>
                                  </div>
                                ) : '—'}
                              </TableCell>
                              <TableCell className="py-2">
                                {rec.last_max_sent_at ? (
                                  <div title={rec.last_max_text || ''}>
                                    <div className="text-green-600">{new Date(rec.last_max_sent_at).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(',', '')}</div>
                                    <div className="text-[10px] text-muted-foreground line-clamp-1 max-w-[120px]">{rec.last_max_text}</div>
                                  </div>
                                ) : '—'}
                              </TableCell>
                              <TableCell className="py-2">
                                <div className="flex gap-1">
                                  <button onClick={() => openEditDialog(rec)} className="p-1 rounded hover:bg-blue-100 text-blue-600" title="Изменить">
                                    <Icon name="Pencil" size={14} />
                                  </button>
                                  <button onClick={() => handleRegistryDelete(rec)} className="p-1 rounded hover:bg-red-100 text-red-500" title="Удалить">
                                    <Icon name="Trash2" size={14} />
                                  </button>
                                </div>
                              </TableCell>
                            </TableRow>
                          </ContextMenuTrigger>
                          <ContextMenuContent>
                            <ContextMenuItem onClick={() => openEditDialog(rec)} className="cursor-pointer">
                              <Icon name="Pencil" size={14} className="mr-2 text-blue-600" />
                              Изменить
                            </ContextMenuItem>
                            <ContextMenuSeparator />
                            <ContextMenuItem onClick={() => handleRegistryDelete(rec)} className="cursor-pointer text-red-600 focus:text-red-600">
                              <Icon name="Trash2" size={14} className="mr-2" />
                              Удалить
                            </ContextMenuItem>
                          </ContextMenuContent>
                        </ContextMenu>
                      ))}
                      {registryRecords.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                            Нет данных
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Всего записей: {registryRecords.length} | Выбрано: {registrySelected.size}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Отчёты</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 mb-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Icon name="Users" size={16} className="text-blue-600" />
                    <span className="text-muted-foreground">Всего врачей:</span>
                    <span className="font-semibold">{doctors.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="MessageSquareWarning" size={16} className="text-orange-600" />
                    <span className="text-muted-foreground">Всего жалоб:</span>
                    <span className="font-semibold">{complaints.length}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Icon name="CheckCircle" size={16} className="text-green-600" />
                    <span className="text-muted-foreground">Решено жалоб:</span>
                    <span className="font-semibold">{complaints.filter((c: any) => c.status === 'resolved').length}</span>
                  </div>
                </div>

                <div className="flex gap-2 items-end mb-4 flex-wrap">
                  <div>
                    <label className="text-xs text-muted-foreground">С</label>
                    <Input type="date" value={reportDateFrom} onChange={(e) => setReportDateFrom(e.target.value)} className="h-8 w-40 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">По</label>
                    <Input type="date" value={reportDateTo} onChange={(e) => setReportDateTo(e.target.value)} className="h-8 w-40 text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Запланировано</label>
                    <Select value={reportFilterScheduled} onValueChange={setReportFilterScheduled}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="yes">{'> 0'}</SelectItem>
                        <SelectItem value="no">= 0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Обслужено</label>
                    <Select value={reportFilterCompleted} onValueChange={setReportFilterCompleted}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="yes">{'> 0'}</SelectItem>
                        <SelectItem value="no">= 0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Нарушений</label>
                    <Select value={reportFilterViolations} onValueChange={setReportFilterViolations}>
                      <SelectTrigger className="h-8 w-28 text-xs"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Все</SelectItem>
                        <SelectItem value="yes">{'> 0'}</SelectItem>
                        <SelectItem value="no">= 0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button size="sm" onClick={loadReport} disabled={reportLoading} className="h-8">
                    <Icon name={reportLoading ? "Loader2" : "FileText"} size={14} className={`mr-1 ${reportLoading ? 'animate-spin' : ''}`} />
                    <span className="text-xs">Сформировать отчёт</span>
                  </Button>
                  {reportData.length > 0 && (
                    <>
                      <Button size="sm" variant="outline" className="h-8" onClick={() => {
                        const filtered = reportData.filter((r: any) => {
                          if (reportFilterScheduled === 'yes' && r.scheduled === 0) return false;
                          if (reportFilterScheduled === 'no' && r.scheduled > 0) return false;
                          if (reportFilterCompleted === 'yes' && r.completed === 0) return false;
                          if (reportFilterCompleted === 'no' && r.completed > 0) return false;
                          if (reportFilterViolations === 'yes' && r.violations === 0) return false;
                          if (reportFilterViolations === 'no' && r.violations > 0) return false;
                          return true;
                        });
                        const grouped = filtered.reduce((acc: Record<string, any[]>, r: any) => {
                          const c = r.clinic || 'Не указано';
                          if (!acc[c]) acc[c] = [];
                          acc[c].push(r);
                          return acc;
                        }, {} as Record<string, any[]>);
                        const periodText = reportDateFrom || reportDateTo
                          ? `Период: ${reportDateFrom ? new Date(reportDateFrom).toLocaleDateString('ru-RU') : 'начало'} — ${reportDateTo ? new Date(reportDateTo).toLocaleDateString('ru-RU') : 'сегодня'}`
                          : 'Период: всё время';
                        const pw = window.open('', '_blank');
                        if (!pw) return;
                        let tableHtml = '';
                        Object.entries(grouped).forEach(([clinic, rows]) => {
                          tableHtml += `<tr><td colspan="8" style="background:#e8f0fe;font-weight:bold;padding:8px;">${clinic}</td></tr>`;
                          (rows as any[]).forEach((r: any) => {
                            const gray = r.scheduled === 0 ? ' style="color:#999"' : '';
                            tableHtml += `<tr${gray}><td>${r.full_name}</td><td>${r.position}</td><td>${r.phone||'—'}</td><td style="text-align:center">${r.scheduled}</td><td style="text-align:center">${r.booked||0}</td><td style="text-align:center">${r.completed}</td><td style="text-align:center">${r.cancelled}</td><td style="text-align:center;${r.violations>0?'color:red;font-weight:bold':''}">${r.violations}</td></tr>`;
                          });
                        });
                        const totS = filtered.reduce((s: number, r: any) => s + r.scheduled, 0);
                        const totB = filtered.reduce((s: number, r: any) => s + (r.booked||0), 0);
                        const totC = filtered.reduce((s: number, r: any) => s + r.completed, 0);
                        const totCa = filtered.reduce((s: number, r: any) => s + r.cancelled, 0);
                        const totV = filtered.reduce((s: number, r: any) => s + r.violations, 0);
                        tableHtml += `<tr style="font-weight:bold;background:#f0f0f0"><td colspan="3">Итого</td><td style="text-align:center">${totS}</td><td style="text-align:center">${totB}</td><td style="text-align:center">${totC}</td><td style="text-align:center">${totCa}</td><td style="text-align:center">${totV}</td></tr>`;
                        pw.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Отчёт по врачам</title><style>@page{size:landscape;margin:10mm}body{font-family:Arial,sans-serif;font-size:13px}.header{text-align:center;margin-bottom:15px}table{width:100%;border-collapse:collapse}th,td{border:1px solid #333;padding:6px;text-align:left}th{background:#f0f0f0;font-size:12px}</style></head><body><div class="header"><h2>Отчёт по врачам</h2><p>${periodText}</p></div><table><thead><tr><th>ФИО</th><th>Должность</th><th>Телефон</th><th style="text-align:center">Запланир.</th><th style="text-align:center">Записано</th><th style="text-align:center">Обслужено</th><th style="text-align:center">Отменено</th><th style="text-align:center">Нарушений</th></tr></thead><tbody>${tableHtml}</tbody></table></body></html>`);
                        pw.document.close();
                        pw.focus();
                        setTimeout(() => { pw.print(); pw.close(); }, 250);
                      }}>
                        <Icon name="Printer" size={12} className="mr-1" />
                        <span className="text-xs">Печать</span>
                      </Button>
                      <Button size="sm" variant="outline" className="h-8 bg-green-600 text-white hover:bg-green-700 border-green-600" onClick={() => {
                        const filtered = reportData.filter((r: any) => {
                          if (reportFilterScheduled === 'yes' && r.scheduled === 0) return false;
                          if (reportFilterScheduled === 'no' && r.scheduled > 0) return false;
                          if (reportFilterCompleted === 'yes' && r.completed === 0) return false;
                          if (reportFilterCompleted === 'no' && r.completed > 0) return false;
                          if (reportFilterViolations === 'yes' && r.violations === 0) return false;
                          if (reportFilterViolations === 'no' && r.violations > 0) return false;
                          return true;
                        });
                        const rows = filtered.map((r: any) => ({
                          'Больница': r.clinic || 'Не указано',
                          'ФИО': r.full_name,
                          'Должность': r.position,
                          'Телефон': r.phone || '',
                          'Запланировано': r.scheduled,
                          'Записано': r.booked || 0,
                          'Обслужено': r.completed,
                          'Отменено': r.cancelled,
                          'Нарушений': r.violations
                        }));
                        const ws = XLSX.utils.json_to_sheet(rows);
                        ws['!cols'] = [{ wch: 30 }, { wch: 30 }, { wch: 25 }, { wch: 18 }, { wch: 14 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
                        const wb = XLSX.utils.book_new();
                        XLSX.utils.book_append_sheet(wb, ws, 'Отчёт');
                        XLSX.writeFile(wb, 'отчёт_врачи.xlsx');
                      }}>
                        <Icon name="Download" size={12} className="mr-1" />
                        <span className="text-xs">Excel</span>
                      </Button>
                    </>
                  )}
                </div>

                {(() => {
                  const filtered = reportData.filter((r: any) => {
                    if (reportFilterScheduled === 'yes' && r.scheduled === 0) return false;
                    if (reportFilterScheduled === 'no' && r.scheduled > 0) return false;
                    if (reportFilterCompleted === 'yes' && r.completed === 0) return false;
                    if (reportFilterCompleted === 'no' && r.completed > 0) return false;
                    if (reportFilterViolations === 'yes' && r.violations === 0) return false;
                    if (reportFilterViolations === 'no' && r.violations > 0) return false;
                    return true;
                  });
                  const grouped = filtered.reduce((acc: Record<string, any[]>, r: any) => {
                    const c = r.clinic || 'Не указано';
                    if (!acc[c]) acc[c] = [];
                    acc[c].push(r);
                    return acc;
                  }, {} as Record<string, any[]>);

                  if (filtered.length === 0 && reportData.length === 0 && !reportLoading) {
                    return (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        Выберите период и нажмите «Сформировать отчёт»
                      </div>
                    );
                  }
                  if (filtered.length === 0 && reportData.length > 0) {
                    return (
                      <div className="text-center text-muted-foreground py-8 text-sm">
                        Нет данных по выбранным фильтрам
                      </div>
                    );
                  }

                  const totS = filtered.reduce((s: number, r: any) => s + r.scheduled, 0);
                  const totB = filtered.reduce((s: number, r: any) => s + (r.booked||0), 0);
                  const totC = filtered.reduce((s: number, r: any) => s + r.completed, 0);
                  const totCa = filtered.reduce((s: number, r: any) => s + r.cancelled, 0);
                  const totV = filtered.reduce((s: number, r: any) => s + r.violations, 0);

                  return (
                    <div className="overflow-x-auto border rounded-md" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                      <Table>
                        <TableHeader className="sticky top-0 bg-blue-100 z-10">
                          <TableRow className="text-xs">
                            <TableHead className="py-2">ФИО</TableHead>
                            <TableHead className="py-2">Должность</TableHead>
                            <TableHead className="py-2">Телефон</TableHead>
                            <TableHead className="py-2 text-center">Запланировано</TableHead>
                            <TableHead className="py-2 text-center">Записано</TableHead>
                            <TableHead className="py-2 text-center">Обслужено</TableHead>
                            <TableHead className="py-2 text-center">Отменено</TableHead>
                            <TableHead className="py-2 text-center">Нарушений</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {Object.entries(grouped).map(([clinic, rows]) => (
                            <>
                              <TableRow key={`clinic-${clinic}`} className="bg-blue-50">
                                <TableCell colSpan={8} className="py-2 font-semibold text-sm">
                                  <div className="flex items-center gap-2">
                                    <Icon name="Building2" size={14} />
                                    {clinic}
                                    <span className="text-xs text-muted-foreground font-normal">({(rows as any[]).length})</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                              {(rows as any[]).map((row: any) => (
                                <TableRow key={row.id} className={`text-xs ${row.scheduled === 0 ? 'text-gray-400' : ''}`}>
                                  <TableCell className="py-2 font-medium">{row.full_name}</TableCell>
                                  <TableCell className="py-2">{row.position}</TableCell>
                                  <TableCell className="py-2">{row.phone || '—'}</TableCell>
                                  <TableCell className="py-2 text-center">{row.scheduled}</TableCell>
                                  <TableCell className="py-2 text-center">{row.booked || 0}</TableCell>
                                  <TableCell className="py-2 text-center">{row.completed}</TableCell>
                                  <TableCell className="py-2 text-center">{row.cancelled}</TableCell>
                                  <TableCell className="py-2 text-center">
                                    <span className={row.violations > 0 ? 'text-red-600 font-semibold' : ''}>{row.violations}</span>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </>
                          ))}
                          <TableRow className="text-xs font-semibold bg-gray-50">
                            <TableCell className="py-2" colSpan={3}>Итого</TableCell>
                            <TableCell className="py-2 text-center">{totS}</TableCell>
                            <TableCell className="py-2 text-center">{totB}</TableCell>
                            <TableCell className="py-2 text-center">{totC}</TableCell>
                            <TableCell className="py-2 text-center">{totCa}</TableCell>
                            <TableCell className="py-2 text-center">{totV}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ratings">
            <RatingsStats />
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              Обработка жалобы
              {isComplaintResolved && (
                <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-medium">Решена — только просмотр</span>
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">ФИО пациента</label>
              <Input value={selectedComplaint?.name || '—'} disabled className="h-8 text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium text-muted-foreground">Email</label>
                <Input value={selectedComplaint?.email || '—'} disabled className="h-8 text-sm" />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Телефон</label>
                <Input value={selectedComplaint?.phone || '—'} disabled className="h-8 text-sm" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Текст жалобы</label>
              <Textarea value={selectedComplaint?.message || ''} disabled rows={3} className="text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Статус</label>
              <Select value={complaintStatus} onValueChange={setComplaintStatus} disabled={isComplaintResolved}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">Новая</SelectItem>
                  <SelectItem value="in_progress">На рассмотрении</SelectItem>
                  <SelectItem value="resolved">Решена</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Комментарий</label>
              <Textarea 
                value={complaintComment} 
                onChange={(e) => setComplaintComment(e.target.value)}
                rows={6}
                placeholder="Введите комментарий..."
                className="text-sm"
                disabled={isComplaintResolved}
              />
            </div>
            <div className="flex flex-col gap-2 pt-1">
              {!isComplaintResolved && (
                <div className="flex flex-wrap gap-2">
                  {selectedComplaint?.responded_at ? (
                    <Button variant="outline" disabled size="sm">
                      <Icon name="Mail" size={14} className="mr-1.5" />
                      <span className="text-xs">Почта: {new Date(selectedComplaint.responded_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).replace(',', '')}</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={sendEmailResponse}
                      disabled={!selectedComplaint?.email || !complaintComment}
                      size="sm"
                    >
                      <Icon name="Mail" size={14} className="mr-1.5" />
                      <span className="text-xs">Ответить по почте</span>
                    </Button>
                  )}
                  {selectedComplaint?.max_responded_at ? (
                    <Button variant="outline" disabled size="sm" className="border-green-300 bg-green-50">
                      <Icon name="MessageCircle" size={14} className="mr-1.5 text-green-600" />
                      <span className="text-xs text-green-700">MAX: {new Date(selectedComplaint.max_responded_at).toLocaleString('ru-RU', {
                        day: '2-digit',
                        month: '2-digit',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).replace(',', '')}</span>
                    </Button>
                  ) : (
                    <Button 
                      variant="outline" 
                      onClick={sendMaxResponse}
                      disabled={!selectedComplaint?.phone || !complaintComment}
                      size="sm"
                      className="border-green-300 hover:bg-green-50"
                    >
                      <Icon name="MessageCircle" size={14} className="mr-1.5 text-green-600" />
                      <span className="text-xs">Ответить по MAX</span>
                    </Button>
                  )}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowComplaintDialog(false)} size="sm">
                  {isComplaintResolved ? 'Закрыть' : 'Отмена'}
                </Button>
                {!isComplaintResolved && (
                  <Button onClick={updateComplaintStatus} size="sm">
                    Сохранить
                  </Button>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEmailError} onOpenChange={setShowEmailError}>
        <DialogContent className="max-w-md">
          <div className="flex flex-col items-center text-center space-y-4 py-4">
            <img 
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/28641836-4e17-49e8-97ca-84990953b5ba.jpg" 
              alt="Doctor with rifle"
              className="w-48 h-48 object-cover rounded-lg"
            />
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-red-600">Не удалось отправить сообщение</h3>
              <p className="text-sm text-muted-foreground">
                Письмо не было доставлено на адрес:
              </p>
              <p className="text-base font-medium">{emailErrorAddress}</p>
              <p className="text-xs text-muted-foreground mt-4">
                Проверьте настройки SMTP или правильность email-адреса
              </p>
            </div>
            <Button onClick={() => setShowEmailError(false)} className="w-full">
              Понятно
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Icon name={sendChannel === 'email' ? 'Mail' : 'MessageCircle'} size={18} className={sendChannel === 'email' ? 'text-blue-600' : 'text-green-600'} />
              {sendChannel === 'email' ? 'Рассылка на почту' : 'Рассылка в MAX'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="text-sm text-muted-foreground">
              Выбрано получателей: <strong>{registrySelected.size}</strong>
            </div>
            <Textarea
              placeholder="Введите текст сообщения для рассылки..."
              value={sendMessage}
              onChange={(e) => setSendMessage(e.target.value)}
              rows={6}
              className="text-sm"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)} size="sm">
                Отмена
              </Button>
              <Button onClick={handleRegistrySend} disabled={isSending || !sendMessage.trim()} size="sm" className={sendChannel === 'email' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-green-600 hover:bg-green-700'}>
                {isSending ? 'Отправка...' : `Отправить (${registrySelected.size})`}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base">Редактирование записи</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">ФИО</label>
              <Input value={editForm.full_name} onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Телефон</label>
              <Input value={editForm.phone} onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })} className="h-8 text-sm" />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Email</label>
              <Input value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} className="h-8 text-sm" />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="outline" onClick={() => setShowEditDialog(false)} size="sm">Отмена</Button>
              <Button onClick={handleRegistryUpdate} size="sm">Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showLogDialog} onOpenChange={setShowLogDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="text-base flex items-center gap-2">
              <Icon name="ScrollText" size={18} />
              Журнал действий главного врача
            </DialogTitle>
          </DialogHeader>
          <div className="overflow-y-auto" style={{ maxHeight: '60vh' }}>
            {logLoading ? (
              <div className="text-center py-8 text-muted-foreground">Загрузка...</div>
            ) : logEntries.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">Нет записей</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="text-xs">
                    <TableHead className="py-2">Дата</TableHead>
                    <TableHead className="py-2">Администратор</TableHead>
                    <TableHead className="py-2">Действие</TableHead>
                    <TableHead className="py-2">Подробности</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logEntries.map((log: any) => (
                    <TableRow key={log.id} className="text-xs">
                      <TableCell className="py-2 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString('ru-RU', {
                          day: '2-digit', month: '2-digit', year: '2-digit',
                          hour: '2-digit', minute: '2-digit'
                        }).replace(',', '')}
                      </TableCell>
                      <TableCell className="py-2">{log.admin_login || '\u2014'}</TableCell>
                      <TableCell className="py-2">
                        <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px]">
                          {log.action_type}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 max-w-xs">
                        <div className="line-clamp-2 text-[11px] text-muted-foreground" title={log.details}>
                          {(() => {
                            try {
                              const d = JSON.parse(log.details);
                              return Object.entries(d).map(([k, v]) => `${k}: ${v}`).join(', ');
                            } catch {
                              return log.details;
                            }
                          })()}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {hoveredDoctorPhoto && (
        <div
          className="fixed pointer-events-none z-50"
          style={{
            left: `${photoPosition.x}px`,
            top: `${photoPosition.y}px`,
          }}
        >
          <img
            src={hoveredDoctorPhoto}
            alt="Фото врача"
            className="w-48 h-48 object-cover shadow-2xl border-4 border-white"
          />
        </div>
      )}
    </div>
  );
};

export default MDoctor;