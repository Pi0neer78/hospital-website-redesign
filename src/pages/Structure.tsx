import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const PhotoModal = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm" onClick={onClose}>
    <img src={src} alt={alt} className="w-80 h-80 rounded-xl object-cover object-top shadow-2xl border-4 border-white" onClick={e => e.stopPropagation()} />
  </div>
);

const DoctorName = ({ title, name }: { title?: string; name: string }) => {
  const parts = name.trim().split(' ');
  const surname = parts[0].toUpperCase();
  const firstName = parts[1] || '';
  const patronymic = parts.slice(2).join(' ');
  return (
    <span className="block">
      {title && <span className="block font-normal text-[11px] leading-tight text-muted-foreground mb-0.5">{title}</span>}
      <span className="block font-bold text-[15px] leading-tight text-primary">{surname}</span>
      {(firstName || patronymic) && (
        <span className="block font-semibold text-[13px] leading-snug text-primary">{firstName}{patronymic ? ' ' + patronymic : ''}</span>
      )}
    </span>
  );
};

const Structure = () => {
  const [photo, setPhoto] = useState<{ src: string; alt: string } | null>(null);
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/f3cad472-e990-4101-9d1b-163dee97656f.jpg)' }}>
      {photo && <PhotoModal src={photo.src} alt={photo.alt} onClose={() => setPhoto(null)} />}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg"
              alt="Логотип АЦГМБ ЛНР"
              className="w-12 h-12 object-contain mix-blend-multiply rounded-full"
            />
            <div>
              <h1 className="text-sm font-bold text-primary leading-tight">ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница</h1>
            </div>
          </div>
          <nav className="hidden lg:flex gap-4 text-sm">
            <a href="/" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Главная</a>
            <a href="/#about" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">О нас</a>
            <a href="/#doctors" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">График приема</a>
            <a href="/structure" className="text-primary transition-colors font-medium whitespace-nowrap">Структура</a>
            <a href="/#contacts" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Контакты</a>
          </nav>
        </div>
      </header>

      <section className="py-12 bg-white/90">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Структура ГБУЗ "АЦГМБ" ЛНР</h1>
            <p className="text-muted-foreground max-w-3xl mx-auto">
              ГБУЗ Антрацитовская центральная городская многопрофильная больница Луганской Народной Республики
            </p>
            <p className="text-sm text-muted-foreground mt-2">г. Антрацит, ул. Толстоусова, д.1, 294613</p>
          </div>

          <Tabs defaultValue="clinics" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 gap-2 h-auto bg-transparent p-0">
              <TabsTrigger value="clinics" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 rounded-lg shadow-sm border border-border bg-white">
                <div className="flex items-center gap-2">
                  <Icon name="Building2" size={18} />
                  <span className="text-sm font-medium">Поликлиники</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="ambulatory" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 rounded-lg shadow-sm border border-border bg-white">
                <div className="flex items-center gap-2">
                  <Icon name="Home" size={18} />
                  <span className="text-sm font-medium">Врачебные амбулатории</span>
                </div>
              </TabsTrigger>
              <TabsTrigger value="fap" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground py-3 px-4 rounded-lg shadow-sm border border-border bg-white">
                <div className="flex items-center gap-2">
                  <Icon name="Cross" size={18} />
                  <span className="text-sm font-medium">ФАПы</span>
                </div>
              </TabsTrigger>
            </TabsList>

            {/* ПОЛИКЛИНИКИ */}
            <TabsContent value="clinics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Building2" size={16} className="text-primary" />
                      Центральная городская поликлиника
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/caa8ab80-81aa-4431-9f1b-dcaa6fddfa20.jpg"
                          alt="Сулима Вера Николаевна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/caa8ab80-81aa-4431-9f1b-dcaa6fddfa20.jpg', alt: 'Сулима Вера Николаевна' })}
                        />
                        <DoctorName title="И.О. заведующего поликлиникой, врач-терапевт" name="Сулима Вера Николаевна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1, 294613</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7 857-312-60-44 (регистратура)</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Регистратура</p>
                          <p>пн-пт 07:30 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Центральная городская поликлиника</p>
                          <p>пн-пт 08:00 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Baby" size={16} className="text-primary" />
                      Детская поликлиника
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="overflow-hidden">
                      <img
                        src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/140f81c8-6e1b-4c16-a536-e2ad38d89a32.jpg"
                        alt="Комарова Елена Геннадьевна"
                        className="float-left mr-3 mb-2 w-20 h-20 rounded-full object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/140f81c8-6e1b-4c16-a536-e2ad38d89a32.jpg', alt: 'Комарова Елена Геннадьевна' })}
                      />
                      <p className="font-medium text-muted-foreground">
                        <DoctorName title="Заведующий детской поликлиникой" name="Комарова Елена Геннадьевна" />
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Петровского, 56</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7 857-312-59-59 (регистратура)</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Регистратура</p>
                          <p>пн-пт 07:30 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Поликлиника</p>
                          <p>пн-пт 08:00 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="HeartPulse" size={16} className="text-primary" />
                      Гинекологическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий – врач-акушер-гинеколог" name="Репникова Елена Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Врачи: врач-акушер-гинеколог <span className="font-bold text-[13px] text-primary">БОНДАРЕНКО</span> <span className="font-bold text-[13px] text-primary">Елена Александровна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Stethoscope" size={16} className="text-primary" />
                      Инфекционное – боксированное отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/33e4d317-6b06-4ade-9518-002cf4ffc66c.jpg"
                          alt="Шурупова Анжела Владимировна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/33e4d317-6b06-4ade-9518-002cf4ffc66c.jpg', alt: 'Шурупова Анжела Владимировна' })}
                        />
                        <DoctorName title="Заведующий, врач-инфекционист" name="Шурупова Анжела Владимировна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Врачи: врач-инфекционист, внештатный горрайонный специалист <span className="font-bold text-[13px] text-primary">КЛИМЕНКО Наталья Ивановна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Heart" size={16} className="text-primary" />
                      Кардиологическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/47090950-0856-435d-835e-3931e64a249a.jpg"
                          alt="Биляченко Сергей Митрофанович"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/47090950-0856-435d-835e-3931e64a249a.jpg', alt: 'Биляченко Сергей Митрофанович' })}
                        />
                        <DoctorName title="Заведующий, врач-кардиолог" name="Биляченко Сергей Митрофанович" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="HeartPulse" size={16} className="text-primary" />
                      Женская консультация
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/bea73a54-0846-4976-90a6-115626bbbd01.jpg"
                          alt="Гасанова Ирина Николаевна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/bea73a54-0846-4976-90a6-115626bbbd01.jpg', alt: 'Гасанова Ирина Николаевна' })}
                        />
                        <DoctorName title="Заведующий, врач-акушер-гинеколог" name="Гасанова Ирина Николаевна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач ультразвуковой диагностики – <span className="font-bold text-[13px] text-primary">КАЛЬСКОВА Ирина Сергеевна</span></p>
                        <p>врач-акушер-гинеколог <span className="font-bold text-[13px] text-primary">КОХНО Людмила Васильевна</span></p>
                        <div className="overflow-hidden mt-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/af3d116c-a52f-4cc3-8b08-6a5afa8db990.jpg"
                            alt="Зуева Любовь Александровна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/af3d116c-a52f-4cc3-8b08-6a5afa8db990.jpg', alt: 'Зуева Любовь Александровна' })}
                          />
                          <p>врач-акушер-гинеколог <span className="font-bold text-[13px] text-primary">ЗУЕВА Любовь Александровна</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Регистратура</p>
                          <p>пн-пт 07:30 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                        <div>
                          <p className="font-semibold text-foreground">Поликлиника</p>
                          <p>пн-пт 08:00 – 17:00</p>
                          <p>сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="FlaskConical" size={16} className="text-primary" />
                      Клинико-диагностическая лаборатория
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/084e60a3-b503-4523-9e9e-59959b3f5741.jpg"
                          alt="Серикова Наталья Анатольевна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/084e60a3-b503-4523-9e9e-59959b3f5741.jpg', alt: 'Серикова Наталья Анатольевна' })}
                        />
                        <DoctorName title="Заведующий, врач-лаборант" name="Серикова Наталья Анатольевна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/39ae25a0-366d-449b-85f5-858811ef645a.jpg"
                            alt="Гнездилова Светлана Валентиновна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/39ae25a0-366d-449b-85f5-858811ef645a.jpg', alt: 'Гнездилова Светлана Валентиновна' })}
                          />
                          <p>Врачи: врач клинической лабораторной диагностики клинического отдела – <span className="font-bold text-[13px] text-primary">ГНЕЗДИЛОВА Светлана Валентиновна</span></p>
                        </div>
                        <p>врач клинической лабораторной диагностики клинического отдела – <span className="font-bold text-[13px] text-primary">КАРЕНЬКОВА Светлана Юрьевна</span></p>
                        <div className="overflow-hidden mt-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/800133df-1b1a-4cd1-857d-9ccc51cc4957.jpg"
                            alt="Пчелинцева Вера Борисовна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/800133df-1b1a-4cd1-857d-9ccc51cc4957.jpg', alt: 'Пчелинцева Вера Борисовна' })}
                          />
                          <p>врач клинической лабораторной диагностики биохимического отдела – <span className="font-bold text-[13px] text-primary">ПЧЕЛИНЦЕВА Вера Борисовна</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Clock" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>пн-сб 07:30 – 15:30</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Brain" size={16} className="text-primary" />
                      Неврологическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/9618a430-98df-48ad-8fef-1d03ca35977b.jpg"
                          alt="Чернявская Марина Александровна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/9618a430-98df-48ad-8fef-1d03ca35977b.jpg', alt: 'Чернявская Марина Александровна' })}
                        />
                        <DoctorName title="Заведующий, врач-невролог, внештатный горрайонный специалист" name="Чернявская Марина Александровна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="overflow-hidden">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7bd616e0-8df1-4aca-86f3-005f0ab67112.jpg"
                          alt="Поддубная Карина Сергеевна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7bd616e0-8df1-4aca-86f3-005f0ab67112.jpg', alt: 'Поддубная Карина Сергеевна' })}
                        />
                        <p>Врачи: врач-стажер <span className="font-bold text-[13px] text-primary">ПОДДУБНАЯ Карина Сергеевна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Activity" size={16} className="text-primary" />
                      Отделение анестезиологии и с койками интенсивной терапии
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-анестезиолог-реаниматолог, внештатный горрайонный специалист" name="Чернявский Родион Игоревич" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/156396c9-9d8a-4317-8b43-2bcbdc8a8501.jpg"
                            alt="Косимцев Сергей Евгеньевич"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/156396c9-9d8a-4317-8b43-2bcbdc8a8501.jpg', alt: 'Косимцев Сергей Евгеньевич' })}
                          />
                          <p>Врачи: врач-анестезиолог-реаниматолог <span className="font-bold text-[13px] text-primary">КОСИМЦЕВ Сергей Евгеньевич</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/e152702c-06de-4b87-8517-4fe33259abc1.jpg"
                            alt="Немятых Константин Дмитриевич"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/e152702c-06de-4b87-8517-4fe33259abc1.jpg', alt: 'Немятых Константин Дмитриевич' })}
                          />
                          <p>врач-анестезиолог-реаниматолог <span className="font-bold text-[13px] text-primary">НЕМЯТЫХ Константин Дмитриевич</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Droplets" size={16} className="text-primary" />
                      Отделение заготовки и переработки крови
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-трансфузиолог" name="Ульянова Тамара Ивановна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Baby" size={16} className="text-primary" />
                      Отделение новорожденных
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-неонатолог" name="Суялкина Виктория Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/f20e1659-e3ef-483d-a122-8deb4c9063ab.jpg"
                            alt="Перевозчикова Наталья Михайловна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/f20e1659-e3ef-483d-a122-8deb4c9063ab.jpg', alt: 'Перевозчикова Наталья Михайловна' })}
                          />
                          <p>Врачи: врач-неонатолог <span className="font-bold text-[13px] text-primary">ПЕРЕВОЗЧИКОВА Наталья Михайловна</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/3ce478c4-6637-4d6b-95f8-ada106a1c44c.jpg"
                            alt="Бондарь Наталья Николаевна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/3ce478c4-6637-4d6b-95f8-ada106a1c44c.jpg', alt: 'Бондарь Наталья Николаевна' })}
                          />
                          <p>врач-неонатолог <span className="font-bold text-[13px] text-primary">БОНДАРЬ Наталья Николаевна</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Eye" size={16} className="text-primary" />
                      Офтальмо-отоларингологическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/cca9f7d9-f15b-49ec-b417-9a1d009cfae1.jpg"
                          alt="Мазуров Николай Михайлович"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/cca9f7d9-f15b-49ec-b417-9a1d009cfae1.jpg', alt: 'Мазуров Николай Михайлович' })}
                        />
                        <DoctorName title="Заведующий, врач-оториноларинголог, внештатный горрайонный специалист" name="Мазуров Николай Михайлович" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="overflow-hidden">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/b2cad708-f3df-4f62-b9ae-72362e309845.jpg"
                          alt="Колесникова Ольга Васильевна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/b2cad708-f3df-4f62-b9ae-72362e309845.jpg', alt: 'Колесникова Ольга Васильевна' })}
                        />
                        <p>Врачи: врач-офтальмолог <span className="font-bold text-[13px] text-primary">КОЛЕСНИКОВА Ольга Васильевна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Stethoscope" size={16} className="text-primary" />
                      Педиатрическое соматическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врач-педиатр
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="DoorOpen" size={16} className="text-primary" />
                      Приемное отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/a4d44c2d-a1fa-410d-9ea4-b920088bcb40.jpg"
                          alt="Панкова Элла Александровна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/a4d44c2d-a1fa-410d-9ea4-b920088bcb40.jpg', alt: 'Панкова Элла Александровна' })}
                        />
                        <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Панкова Элла Александровна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Brain" size={16} className="text-primary" />
                      Психиатрическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/ae456582-5eca-4759-b1a4-8bced30b9a60.jpg"
                          alt="Зайцева Людмила Владимировна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/ae456582-5eca-4759-b1a4-8bced30b9a60.jpg', alt: 'Зайцева Людмила Владимировна' })}
                        />
                        <DoctorName title="Заведующий, врач-психиатр" name="Зайцева Людмила Владимировна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, пер. Победы</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-40-90</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="ScanLine" size={16} className="text-primary" />
                      Рентгенологическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий, врач-рентгенолог
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="overflow-hidden">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/55bdce6a-d0cb-47f9-a148-b1e4eb66b469.jpg"
                          alt="Лазаренко Татьяна Ивановна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/55bdce6a-d0cb-47f9-a148-b1e4eb66b469.jpg', alt: 'Лазаренко Татьяна Ивановна' })}
                        />
                        <p>Врачи: врач-рентгенолог <span className="font-bold text-[13px] text-primary">ЛАЗАРЕНКО Татьяна Ивановна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="HeartPulse" size={16} className="text-primary" />
                      Родильное отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-акушер-гинеколог" name="Царенко Людмила Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d22db362-3dae-4c90-b442-8e7d58d90563.jpg"
                            alt="Дорошенко Ирина Геннадьевна"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d22db362-3dae-4c90-b442-8e7d58d90563.jpg', alt: 'Дорошенко Ирина Геннадьевна' })}
                          />
                          <p>Врачи: врач-акушер-гинеколог <span className="font-bold text-[13px] text-primary">ДОРОШЕНКО Ирина Геннадьевна</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/1a815876-afd2-47a8-9aae-cd6f10b346d9.jpg"
                            alt="Агишева Ольга Ильинична"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/1a815876-afd2-47a8-9aae-cd6f10b346d9.jpg', alt: 'Агишева Ольга Ильинична' })}
                          />
                          <p>врач-акушер-гинеколог <span className="font-bold text-[13px] text-primary">АГИШЕВА Ольга Ильинична</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Stethoscope" size={16} className="text-primary" />
                      Терапевтическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d78ac2bc-6045-4f60-864e-5afc164035ab.jpg"
                          alt="Балаба Людмила Викторовна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d78ac2bc-6045-4f60-864e-5afc164035ab.jpg', alt: 'Балаба Людмила Викторовна' })}
                        />
                        <DoctorName title="Заведующий, врач-терапевт" name="Балаба Людмила Викторовна" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="overflow-hidden">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/8f2074df-fa5e-4bb0-9282-1bf35bbe070c.jpg"
                          alt="Тимофеенко Дарья Александровна"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/8f2074df-fa5e-4bb0-9282-1bf35bbe070c.jpg', alt: 'Тимофеенко Дарья Александровна' })}
                        />
                        <p>Врачи: врач-терапевт <span className="font-bold text-[13px] text-primary">ТИМОФЕЕНКО Дарья Александровна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Bone" size={16} className="text-primary" />
                      Неотложный кабинет травматологии и ортопедии
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий, врач-травматолог-ортопед
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Bone" size={16} className="text-primary" />
                      Отделение травматологии и ортопедии
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/a15818f7-785e-4c86-b762-d33bcac6f728.jpg"
                          alt="Комаров Роман Иванович"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/a15818f7-785e-4c86-b762-d33bcac6f728.jpg', alt: 'Комаров Роман Иванович' })}
                        />
                        <DoctorName title="Заведующий, врач-травматолог-ортопед, внештатный горрайонный специалист" name="Комаров Роман Иванович" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-травматолог-ортопед <span className="font-bold text-[13px] text-primary">БРОВКИН Евгений Владимирович</span></p>
                        <p>врач-травматолог-ортопед <span className="font-bold text-[13px] text-primary">СУЯЛКИН Олег Павлович</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Zap" size={16} className="text-primary" />
                      Физиотерапевтическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий, врач-физиотерапевт
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Scissors" size={16} className="text-primary" />
                      Хирургическое отделение на 2 круглосуточных поста
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <div className="overflow-hidden mt-1">
                        <img
                          src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/4a796b05-78cd-41a9-85ba-d9909c131bfd.jpg"
                          alt="Чумак Игорь Анатольевич"
                          className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/4a796b05-78cd-41a9-85ba-d9909c131bfd.jpg', alt: 'Чумак Игорь Анатольевич' })}
                        />
                        <DoctorName title="Заведующий, врач-хирург" name="Чумак Игорь Анатольевич" />
                      </div>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={13} className="text-primary mt-0.5 shrink-0" />
                      <div className="text-sm space-y-1">
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/bae8ac64-18c3-4f53-b04b-671730f387dc.jpg"
                            alt="Гиенко Максим Вячеславович"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/bae8ac64-18c3-4f53-b04b-671730f387dc.jpg', alt: 'Гиенко Максим Вячеславович' })}
                          />
                          <p>Врачи: врач-хирург <span className="font-bold text-[13px] text-primary">ГИЕНКО Максим Вячеславович</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/c30c6bc1-5069-4c90-955a-c272e6d77fdf.jpg"
                            alt="Гончаров Андрей Борисович"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/c30c6bc1-5069-4c90-955a-c272e6d77fdf.jpg', alt: 'Гончаров Андрей Борисович' })}
                          />
                          <p>врач-хирург <span className="font-bold text-[13px] text-primary">ГОНЧАРОВ Андрей Борисович</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/6e7ac12c-d12d-49fb-9488-eb4daefa259f.jpg"
                            alt="Нестеренко Игорь Владимирович"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/6e7ac12c-d12d-49fb-9488-eb4daefa259f.jpg', alt: 'Нестеренко Игорь Владимирович' })}
                          />
                          <p>врач-хирург <span className="font-bold text-[13px] text-primary">НЕСТЕРЕНКО Игорь Владимирович</span></p>
                        </div>
                        <div className="overflow-hidden mb-1">
                          <img
                            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7b858c02-b3d5-4948-860b-78d024c4b90a.jpg"
                            alt="Чернявский Игорь Родионович"
                            className="float-left mr-3 mb-1 w-20 h-20 rounded-lg object-cover object-top border-2 border-primary shadow-md cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => setPhoto({ src: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7b858c02-b3d5-4948-860b-78d024c4b90a.jpg', alt: 'Чернявский Игорь Родионович' })}
                          />
                          <p>врач-стажер <span className="font-bold text-[13px] text-primary">ЧЕРНЯВСКИЙ Игорь Родионович</span></p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Microscope" size={16} className="text-primary" />
                      Патологоанатомическое отделение
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий, врач-патологоанатом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* ВРАЧЕБНЫЕ АМБУЛАТОРИИ */}
            <TabsContent value="ambulatory" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория №1
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Гончарова Ольга Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, ул. Говорова, 1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7-857-312-63-30 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория №2
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-дерматовенеролог" name="Гненная Виктория Михайловна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит-7, пер. Первомайский, 7</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7 857-312-41-00 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Крепенский
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Лукьяненко Олеся Владимировна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, пгт. Крепенский, ул. 40 лет Октября, 9</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7 857-319-82-70 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Щетово
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-терапевт" name="Михайленко Лариса Сергеевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, пгт. Щетово, ул. Ленина, 4а</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>+7 857-319-43-63 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Дубовский
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач-педиатр" name="Панасюк Наталья Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>г. Антрацит, пгт. Дубовский, ул. Горького, 5</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Красный Кут
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Селиверстова Анна Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Красный Кут, ул. 11-я Советская, 47</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Фащевка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Фащевка, ул. Советская, 9</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория с. Червоная Поляна
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Червоная Поляна, ул. Первомайская, 8</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория с. Нижний Нагольчик
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Нижний Нагольчик, ул. Ленина, 80</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория с. Бобриково
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Бобриково, ул. Шевченко, 3</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория с. Есауловка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Есауловка, ул. Переверзева, 11</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория п. Кошары
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Кошары, ул. Пролетарская, 22</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория пгт. Ивановка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Красникова Ирина Геннадьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Ивановка, ул. Артема, 72а</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Home" size={16} className="text-primary" />
                      Врачебная амбулатория с. Дьяково
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Ступак Инна Борисовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Дьяково, ул. Мира, 116а</p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

            {/* ФЕЛЬДШЕРСКО-АКУШЕРСКИЕ ПУНКТЫ */}
            <TabsContent value="fap" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП пгт. Малониколаевка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Демченко Ирина Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Малониколаевка, кв. Сиволапа, 6</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Рафайловка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Рафайловка, ул. Подлесная, 36</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Ребриково
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Понаморенко Оксана Евгеньевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Ребриково, ул. Школьная, 1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Картушино
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Картушино, ул. Пионерская, 4</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП п. Индустрия
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Индустрия, ул. Совхозная, 3</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП пгт. Верхний Нагольчик
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Бойко Виктория Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Верхний Нагольчик, пер. Ленина, 1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП пгт. Каменный
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Пуличева Марина Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, пгт. Каменный, ул. Шахтерская, 107</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП п. Христофоровка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Христофоровка, ул. Беляева, 15</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП п. Краснолучский
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Меркулова Наталья Ивановна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Краснолучский, ул. Советская, 20/1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП п. Колпаково
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Скоробогатова Ольга Геннадьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Колпаково, ул. Пролетарская, 33</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Мечетка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Мечетка, ул. Почтовая, 16а</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Никитовка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Никитовка, ул. Центральная, 15</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП п. Орловское
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Орловское, ул. Космонавтов, 22</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Лескино
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Кучеренко Кристина Анатольевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Лескино, ул. Октябрьская, 17</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Новокрасновка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Новокрасновка, ул. Будановой, 4</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Зеленодольское
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Аникеева Ирина Юрьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Зеленодольское, ул. Центральная</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Егоровка
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Кравцова Людмила Павловна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Егоровка, ул. Буденного, 10</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП станция п. Колпаково
                    </CardTitle>
                    <CardDescription className="text-xs">
                      <DoctorName title="Заведующий" name="Демченко Ирина Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, п. Колпаково, ул. Садовая, 1Б</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5 py-2 px-3">
                    <CardTitle className="flex items-center gap-1.5 text-base font-bold leading-tight text-primary">
                      <Icon name="Cross" size={16} className="text-primary" />
                      ФАП с. Вишневое
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-2 pb-3 px-3 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={13} className="text-primary mt-0.5 shrink-0" />
                      <p>Антрацитовский р-н, с. Вишневое, ул. Давыденко, 1</p>
                    </div>
                  </CardContent>
                </Card>

              </div>
            </TabsContent>

          </Tabs>
        </div>
      </section>
    </div>
  );
};

export default Structure;