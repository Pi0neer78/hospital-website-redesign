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
      if (data.success) {
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

  console.log('Doctors state (before grouping):', doctors);

  const groupedDoctors = doctors.reduce((acc: Record<string, any[]>, doctor: any) => {
    const clinic = doctor.clinic || 'Не указано';
    if (!acc[clinic]) {
      acc[clinic] = [];
    }
    acc[clinic].push(doctor);
    return acc;
  }, {} as Record<string, any[]>);
  
  console.log('Grouped doctors:', groupedDoctors);
  console.log('Doctors state:', doctors);

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
  
  console.log('Filtered grouped doctors:', filteredGroupedDoctors);

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
              <CardHeader>
                <CardTitle>Жалобы пациентов</CardTitle>
                <CardDescription>Управление поступившими жалобами</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 flex gap-4">
                  <div>
                    <label className="text-sm font-medium">От</label>
                    <Input
                      type="date"
                      value={dateFrom}
                      onChange={(e) => setDateFrom(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">До</label>
                    <Input
                      type="date"
                      value={dateTo}
                      onChange={(e) => setDateTo(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button onClick={loadComplaints}>
                      <Icon name="Search" className="mr-2" size={16} />
                      Применить
                    </Button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ФИО</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Телефон</TableHead>
                        <TableHead>Текст жалобы</TableHead>
                        <TableHead>Комментарий</TableHead>
                        <TableHead>Дата и время</TableHead>
                        <TableHead>Статус</TableHead>
                        <TableHead>Действия</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {complaints.map((complaint: any) => (
                        <TableRow key={complaint.id}>
                          <TableCell>{complaint.name || '—'}</TableCell>
                          <TableCell>{complaint.email || '—'}</TableCell>
                          <TableCell>{complaint.phone || '—'}</TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-2">{complaint.message}</div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="line-clamp-2">{complaint.comment || '—'}</div>
                          </TableCell>
                          <TableCell>
                            <div>{new Date(complaint.created_at).toLocaleDateString('ru-RU')}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(complaint.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            {complaint.resolved_at && (
                              <div className="text-xs text-green-600 mt-1">
                                Решена: {new Date(complaint.resolved_at).toLocaleDateString('ru-RU')} {new Date(complaint.resolved_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                              complaint.status === 'resolved' ? 'bg-green-100 text-green-800' :
                              complaint.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {complaint.status === 'resolved' ? 'Решена' :
                               complaint.status === 'in_progress' ? 'На рассмотрении' : 'Новая'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleComplaintAction(complaint)}
                            >
                              <Icon name="Edit" size={14} className="mr-1" />
                              Изменить
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      {complaints.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground">
                            Нет данных
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
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
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Обработка жалобы</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ФИО пациента</label>
              <Input value={selectedComplaint?.name || '—'} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={selectedComplaint?.email || '—'} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Телефон</label>
              <Input value={selectedComplaint?.phone || '—'} disabled />
            </div>
            <div>
              <label className="text-sm font-medium">Текст жалобы</label>
              <Textarea value={selectedComplaint?.message || ''} disabled rows={4} />
            </div>
            <div>
              <label className="text-sm font-medium">Статус</label>
              <Select value={complaintStatus} onValueChange={setComplaintStatus}>
                <SelectTrigger>
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
              <label className="text-sm font-medium">Комментарий</label>
              <Textarea 
                value={complaintComment} 
                onChange={(e) => setComplaintComment(e.target.value)}
                rows={3}
                placeholder="Введите комментарий..."
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowComplaintDialog(false)}>
                Отмена
              </Button>
              <Button onClick={updateComplaintStatus}>
                Сохранить
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MDoctor;