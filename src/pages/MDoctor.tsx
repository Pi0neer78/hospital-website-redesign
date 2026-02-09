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
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const API_URLS = {
  auth: 'https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227',
  doctors: 'https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688',
  complaints: 'https://functions.poehali.dev/a6c04c63-0223-4bcc-b146-24acdef33536',
  sendEmail: 'https://functions.poehali.dev/d84a5ebe-b78c-4f71-8651-84a53f83538e',
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

  useEffect(() => {
    const token = localStorage.getItem('mdoctor_token');
    if (token) {
      setIsAuthenticated(true);
      loadDoctors();
      loadComplaints();
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

  const handleDoctorClick = async (doctorLogin: string) => {
    try {
      localStorage.setItem('doctor_token', 'mdoctor_authorized');
      localStorage.setItem('doctor_user', JSON.stringify({ login: doctorLogin, from_mdoctor: true }));
      window.open('/doctor', '_blank');
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось перейти в кабинет врача', variant: 'destructive' });
    }
  };

  const handleComplaintAction = (complaint: any) => {
    setSelectedComplaint(complaint);
    setComplaintComment(complaint.comment || '');
    setComplaintStatus(complaint.status);
    setShowComplaintDialog(true);
  };

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
        toast({ title: 'Ошибка', description: data.error || 'Не удалось отправить email', variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить email', variant: 'destructive' });
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

  const filteredComplaints = complaints.filter((c: any) => {
    if (!complaintSearch) return true;
    const search = complaintSearch.toLowerCase();
    return (
      c.name?.toLowerCase().includes(search) ||
      c.phone?.toLowerCase().includes(search) ||
      c.message?.toLowerCase().includes(search)
    );
  }).slice(0, complaintPageSize);

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
          <Button variant="outline" onClick={handleLogout}>
            <Icon name="LogOut" className="mr-2" size={16} />
            Выйти
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="doctors" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="doctors">
              <Icon name="Users" className="mr-2" size={16} />
              Врачи
            </TabsTrigger>
            <TabsTrigger value="complaints">
              <Icon name="AlertCircle" className="mr-2" size={16} />
              Жалобы
            </TabsTrigger>
            <TabsTrigger value="reports">
              <Icon name="FileText" className="mr-2" size={16} />
              Отчеты
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
                                  <button
                                    onClick={() => handleDoctorClick(doctor.login)}
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
                  <div className="flex gap-2 items-end">
                    <div className="w-72">
                      <Input
                        placeholder="Поиск по ФИО, телефону, тексту жалобы..."
                        value={complaintSearch}
                        onChange={(e) => setComplaintSearch(e.target.value)}
                        className="h-9"
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => { setComplaintSearch(''); setDateFrom(''); setDateTo(''); }} className="h-9">
                      <Icon name="X" size={14} />
                    </Button>
                    <div>
                      <Input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        className="h-9 w-36"
                      />
                    </div>
                    <div>
                      <Input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        className="h-9 w-36"
                      />
                    </div>
                    <Button size="sm" variant="outline" onClick={() => {
                      const printWindow = window.open('', '_blank');
                      if (!printWindow) return;
                      const printContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Жалобы</title>
  <style>
    @page { size: landscape; margin: 10mm; }
    body { font-family: Arial, sans-serif; font-size: 11px; }
    h2 { text-align: center; margin-bottom: 10px; font-size: 16px; }
    table { width: 100%; border-collapse: collapse; }
    th, td { border: 1px solid #333; padding: 4px; text-align: left; }
    th { background: #f0f0f0; font-weight: bold; }
    .status-resolved { color: green; }
    .status-progress { color: orange; }
    .status-new { color: gray; }
  </style>
</head>
<body>
  <h2>Список жалоб</h2>
  <table>
    <thead>
      <tr>
        <th style="width: 12%">ФИО</th>
        <th style="width: 12%">Email</th>
        <th style="width: 10%">Телефон</th>
        <th style="width: 28%">Текст жалобы</th>
        <th style="width: 18%">Комментарий</th>
        <th style="width: 12%">Дата</th>
        <th style="width: 8%">Статус</th>
      </tr>
    </thead>
    <tbody>
      ${filteredComplaints.map((c: any) => `
        <tr>
          <td>${c.name || '—'}</td>
          <td>${c.email || '—'}</td>
          <td>${c.phone || '—'}</td>
          <td>${c.message}</td>
          <td>${c.comment || '—'}</td>
          <td>${new Date(c.created_at).toLocaleDateString('ru-RU')} ${new Date(c.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}</td>
          <td class="${
            c.status === 'resolved' ? 'status-resolved' :
            c.status === 'in_progress' ? 'status-progress' : 'status-new'
          }">${
            c.status === 'resolved' ? 'Решена' :
            c.status === 'in_progress' ? 'На рассмотрении' : 'Новая'
          }</td>
        </tr>
      `).join('')}
    </tbody>
  </table>
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
                    }} className="h-9">
                      <Icon name="Printer" size={14} />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => {
                      const csv = [
                        ['ФИО', 'Email', 'Телефон', 'Жалоба', 'Комментарий', 'Дата', 'Статус'].join(','),
                        ...filteredComplaints.map((c: any) => [
                          c.name, c.email, c.phone, c.message.replace(/,/g, ';'), 
                          (c.comment || '').replace(/,/g, ';'),
                          new Date(c.created_at).toLocaleDateString('ru-RU'),
                          c.status === 'resolved' ? 'Решена' : c.status === 'in_progress' ? 'На рассмотрении' : 'Новая'
                        ].join(','))
                      ].join('\\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const link = document.createElement('a');
                      link.href = URL.createObjectURL(blob);
                      link.download = 'жалобы.csv';
                      link.click();
                    }} className="h-9">
                      <Icon name="Download" size={14} />
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto border rounded-md" style={{ maxHeight: '600px', overflowY: 'auto' }}>
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
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
                        <TableRow key={complaint.id} className="text-sm">
                          <TableCell className="py-2">
                            <Icon 
                              name="Mail" 
                              size={16} 
                              className={complaint.responded_at ? 'text-blue-600' : 'text-gray-400'} 
                            />
                          </TableCell>
                          <TableCell className="py-2 text-xs">
                            {complaint.responded_at 
                              ? new Date(complaint.responded_at).toLocaleString('ru-RU', {
                                  day: '2-digit',
                                  month: '2-digit',
                                  year: '2-digit',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                }).replace(',', '')
                              : '—'
                            }
                          </TableCell>
                          <TableCell className="py-2">{complaint.name || '—'}</TableCell>
                          <TableCell className="py-2 text-xs">{complaint.email || '—'}</TableCell>
                          <TableCell className="py-2">{complaint.phone || '—'}</TableCell>
                          <TableCell className="py-2 max-w-xs">
                            <div className="line-clamp-1 text-xs">{complaint.message}</div>
                          </TableCell>
                          <TableCell className="py-2 max-w-xs">
                            <div className="line-clamp-1 text-xs">{complaint.comment || '—'}</div>
                          </TableCell>
                          <TableCell className="py-2">
                            <div className="text-xs">{new Date(complaint.created_at).toLocaleDateString('ru-RU')}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(complaint.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </TableCell>
                          <TableCell className="py-2">
                            <span className={`px-2 py-0.5 rounded-full text-xs whitespace-nowrap ${
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
                              className="h-7 px-2 text-xs"
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
                    Показано {filteredComplaints.length} из {complaints.length}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">Показывать:</span>
                    <Select value={complaintPageSize.toString()} onValueChange={(v) => setComplaintPageSize(Number(v))}>
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

          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Отчеты</CardTitle>
                <CardDescription>Аналитика и статистика работы клиники</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Всего врачей</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{doctors.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Всего жалоб</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">{complaints.length}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-sm">Решено жалоб</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-3xl font-bold">
                        {complaints.filter((c: any) => c.status === 'resolved').length}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <Dialog open={showComplaintDialog} onOpenChange={setShowComplaintDialog}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Обработка жалобы</DialogTitle>
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
              <Select value={complaintStatus} onValueChange={setComplaintStatus}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Новая</SelectItem>
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
              />
            </div>
            <div className="flex justify-between items-center pt-1">
              {selectedComplaint?.responded_at ? (
                <Button variant="outline" disabled size="sm">
                  <Icon name="Mail" size={14} className="mr-1.5" />
                  <span className="text-xs">Отвечено {new Date(selectedComplaint.responded_at).toLocaleString('ru-RU', {
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
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowComplaintDialog(false)} size="sm">
                  Отмена
                </Button>
                <Button onClick={updateComplaintStatus} size="sm">
                  Сохранить
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MDoctor;