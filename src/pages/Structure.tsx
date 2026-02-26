import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';

const DoctorName = ({ title, name }: { title?: string; name: string }) => {
  const parts = name.trim().split(' ');
  const surname = parts[0].toUpperCase();
  const rest = parts.slice(1).join(' ');
  return (
    <span>
      {title && <span className="font-normal text-base">{title}<br /></span>}
      <span className="font-bold text-[1.1rem]">{surname} {rest}</span>
    </span>
  );
};

const Structure = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 bg-cover bg-center bg-fixed" style={{ backgroundImage: 'url(https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/f3cad472-e990-4101-9d1b-163dee97656f.jpg)' }}>
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
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Building2" size={24} className="text-primary" />
                      Центральная городская поликлиника
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="И.О. заведующего поликлиникой, врач-терапевт" name="Сулима Вера Николаевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">г. Антрацит, ул. Толстоусова, д.1, 294613</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">+7 857-312-60-44 (регистратура)</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-2 mt-2">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Регистратура</p>
                          <p className="text-sm">пн-пт 07:30 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Центральная городская поликлиника</p>
                          <p className="text-sm">пн-пт 08:00 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Baby" size={24} className="text-primary" />
                      Детская поликлиника
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="overflow-hidden">
                      <img
                        src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/140f81c8-6e1b-4c16-a536-e2ad38d89a32.jpg"
                        alt="Комарова Елена Геннадьевна"
                        className="float-left mr-4 mb-2 w-40 h-40 rounded-full object-cover object-top border-2 border-primary shadow-md"
                      />
                      <p className="font-medium text-muted-foreground">
                        <DoctorName title="Заведующий детской поликлиникой" name="Комарова Елена Геннадьевна" />
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Петровского, 56</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7 857-312-59-59 (регистратура)</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Регистратура</p>
                          <p className="text-sm">пн-пт 07:30 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Поликлиника</p>
                          <p className="text-sm">пн-пт 08:00 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="HeartPulse" size={24} className="text-primary" />
                      Гинекологическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий – врач-акушер-гинеколог" name="Репникова Елена Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-акушер-гинеколог <span className="font-bold text-[1.1rem]">БОНДАРЕНКО</span> <span className="font-bold text-[1.1rem]">Елена Александровна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Stethoscope" size={24} className="text-primary" />
                      Инфекционное – боксированное отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-инфекционист" name="Шурупова Анжела Владимировна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-инфекционист, внештатный горрайонный специалист <span className="font-bold text-[1.1rem]">КЛИМЕНКО Наталья Ивановна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Heart" size={24} className="text-primary" />
                      Кардиологическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-кардиолог" name="Биляченко Сергей Митрофанович" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="HeartPulse" size={24} className="text-primary" />
                      Женская консультация
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-акушер-гинеколог" name="Гасанова Ирина Николаевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач ультразвуковой диагностики – <span className="font-bold text-[1.1rem]">КАЛЬСКОВА Ирина Сергеевна</span></p>
                        <p>врач-акушер-гинеколог <span className="font-bold text-[1.1rem]">КОХНО Людмила Васильевна</span></p>
                        <p>врач-акушер-гинеколог <span className="font-bold text-[1.1rem]">ЗУЕВА Любовь Александровна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                    <div className="grid md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Регистратура</p>
                          <p className="text-sm">пн-пт 07:30 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                        <div>
                          <p className="font-semibold text-sm">Поликлиника</p>
                          <p className="text-sm">пн-пт 08:00 – 17:00</p>
                          <p className="text-sm">сб, вс 08:00 – 14:00</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="FlaskConical" size={24} className="text-primary" />
                      Клинико-диагностическая лаборатория
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-лаборант" name="Серикова Наталья Анатольевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач клинической лабораторной диагностики клинического отдела – <span className="font-bold text-[1.1rem]">ГНЕЗДИЛОВА Светлана Валентиновна</span></p>
                        <p>врач клинической лабораторной диагностики клинического отдела – <span className="font-bold text-[1.1rem]">КАРЕНЬКОВА Светлана Юрьевна</span></p>
                        <p>врач клинической лабораторной диагностики биохимического отдела – <span className="font-bold text-[1.1rem]">АЧЕЛИНЦЕВА Вера Борисовна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Clock" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">пн-сб 07:30 – 15:30</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Brain" size={24} className="text-primary" />
                      Неврологическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-невролог, внештатный горрайонный специалист" name="Чернявская Марина Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-стажер <span className="font-bold text-[1.1rem]">ПОДДУБНАЯ Карина Сергеевна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Activity" size={24} className="text-primary" />
                      Отделение анестезиологии и с койками интенсивной терапии
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-анестезиолог-реаниматолог, внештатный горрайонный специалист" name="Чернявский Родион Игоревич" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-анестезиолог-реаниматолог <span className="font-bold text-[1.1rem]">КОСИМЦЕВ Сергей Евгеньевич</span></p>
                        <p>врач-анестезиолог-реаниматолог <span className="font-bold text-[1.1rem]">НЕМЯТЫХ Константин Дмитриевич</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Droplets" size={24} className="text-primary" />
                      Отделение заготовки и переработки крови
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-трансфузиолог" name="Ульянова Тамара Ивановна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Baby" size={24} className="text-primary" />
                      Отделение новорожденных
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-неонатолог" name="Суялкина Виктория Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-неонатолог <span className="font-bold text-[1.1rem]">ПЕРЕВОЗЧИКОВА Наталья Михайловна</span></p>
                        <p>врач-неонатолог <span className="font-bold text-[1.1rem]">БОНДАРЬ Наталья Николаевна</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Eye" size={24} className="text-primary" />
                      Офтальмо-отоларингологическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-оториноларинголог, внештатный горрайонный специалист" name="Мазуров Николай Михайлович" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-офтальмолог <span className="font-bold text-[1.1rem]">КОЛЕСНИКОВА Ольга Васильевна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Stethoscope" size={24} className="text-primary" />
                      Педиатрическое соматическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врач-педиатр
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="DoorOpen" size={24} className="text-primary" />
                      Приемное отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Панкова Элла Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Brain" size={24} className="text-primary" />
                      Психиатрическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-психиатр" name="Зайцева Людмила Владимировна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, пер. Победы</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-40-90</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="ScanLine" size={24} className="text-primary" />
                      Рентгенологическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий, врач-рентгенолог
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-рентгенолог <span className="font-bold text-[1.1rem]">ЛАЗАРЕНКО Татьяна Ивановна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="HeartPulse" size={24} className="text-primary" />
                      Родильное отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-акушер-гинеколог" name="Царенко Людмила Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-акушер-гинеколог <span className="font-bold text-[1.1rem]">ДОРОШЕНКО Ирина Геннадьевна</span></p>
                        <p>врач-акушер-гинеколог <span className="font-bold text-[1.1rem]">АГИШЕВА Ольга Ильинична</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Stethoscope" size={24} className="text-primary" />
                      Терапевтическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-терапевт" name="Балаба Людмила Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <p className="text-sm">Врачи: врач-терапевт <span className="font-bold text-[1.1rem]">ТИМОФЕЕНКО Дарья Александровна</span></p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Bone" size={24} className="text-primary" />
                      Неотложный кабинет травматологии и ортопедии
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий, врач-травматолог-ортопед
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Bone" size={24} className="text-primary" />
                      Отделение травматологии и ортопедии
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-травматолог-ортопед, внештатный горрайонный специалист" name="Комаров Роман Иванович" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-травматолог-ортопед <span className="font-bold text-[1.1rem]">БРОВКИН Евгений Владимирович</span></p>
                        <p>врач-травматолог-ортопед <span className="font-bold text-[1.1rem]">СУЯЛКИН Олег Павлович</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Zap" size={24} className="text-primary" />
                      Физиотерапевтическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий, врач-физиотерапевт
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Scissors" size={24} className="text-primary" />
                      Хирургическое отделение на 2 круглосуточных поста
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-хирург" name="Чумак Игорь Анатольевич" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="Users" size={16} className="text-primary mt-0.5" />
                      <div className="text-sm space-y-1">
                        <p>Врачи: врач-хирург <span className="font-bold text-[1.1rem]">ГИЕНКО Максим Вячеславович</span></p>
                        <p>врач-хирург <span className="font-bold text-[1.1rem]">ГОНЧАРОВ Андрей Борисович</span></p>
                        <p>врач-хирург <span className="font-bold text-[1.1rem]">НЕСТЕРЕНКО Игорь Владимирович</span></p>
                        <p>врач-стажер <span className="font-bold text-[1.1rem]">ЧЕРНЯВСКИЙ Игорь Родионович</span></p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-60-57</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Microscope" size={24} className="text-primary" />
                      Патологоанатомическое отделение
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий, врач-патологоанатом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Толстоусова, д.1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
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
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория №1
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Гончарова Ольга Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, ул. Говорова, 1</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7-857-312-63-30 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория №2
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-дерматовенеролог" name="Гненная Виктория Михайловна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит-7, пер. Первомайский, 7</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7 857-312-41-00 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Крепенский
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Лукьяненко Олеся Владимировна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, пгт. Крепенский, ул. 40 лет Октября, 9</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7 857-319-82-70 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Щетово
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-терапевт" name="Михайленко Лариса Сергеевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, пгт. Щетово, ул. Ленина, 4а</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Icon name="Phone" size={16} className="text-primary mt-0.5" />
                      <p>+7 857-319-43-63 (регистратура)</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Дубовский
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач-педиатр" name="Панасюк Наталья Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>г. Антрацит, пгт. Дубовский, ул. Горького, 5</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Красный Кут
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Селиверстова Анна Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Красный Кут, ул. 11-я Советская, 47</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Фащевка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Фащевка, ул. Советская, 9</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория с. Червоная Поляна
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Червоная Поляна, ул. Первомайская, 8</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория с. Нижний Нагольчик
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Нижний Нагольчик, ул. Ленина, 80</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория с. Бобриково
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Бобриково, ул. Шевченко, 3</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория с. Есауловка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Есауловка, ул. Переверзева, 11</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория п. Кошары
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий врачебной амбулаторией
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Кошары, ул. Пролетарская, 22</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория пгт. Ивановка
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий, врач общей практики (семейный врач)" name="Красникова Ирина Геннадьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Ивановка, ул. Артема, 72а</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Home" size={24} className="text-primary" />
                      Врачебная амбулатория с. Дьяково
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Ступак Инна Борисовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
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
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП пгт. Малониколаевка
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Демченко Ирина Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Малониколаевка, кв. Сиволапа, 6</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Рафайловка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Рафайловка, ул. Подлесная, 36</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Ребриково
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Понаморенко Оксана Евгеньевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Ребриково, ул. Школьная, 1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Картушино
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Картушино, ул. Пионерская, 4</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП п. Индустрия
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Индустрия, ул. Совхозная, 3</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП пгт. Верхний Нагольчик
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Бойко Виктория Викторовна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Верхний Нагольчик, пер. Ленина, 1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП пгт. Каменный
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Пуличева Марина Александровна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, пгт. Каменный, ул. Шахтерская, 107</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП п. Христофоровка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Христофоровка, ул. Беляева, 15</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП п. Краснолучский
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Меркулова Наталья Ивановна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Краснолучский, ул. Советская, 20/1</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП п. Колпаково
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Скоробогатова Ольга Геннадьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Колпаково, ул. Пролетарская, 33</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Мечетка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Мечетка, ул. Почтовая, 16а</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Никитовка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Никитовка, ул. Центральная, 15</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП п. Орловское
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Орловское, ул. Космонавтов, 22</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Лескино
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Кучеренко Кристина Анатольевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Лескино, ул. Октябрьская, 17</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Новокрасновка
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Новокрасновка, ул. Будановой, 4</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Зеленодольское
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Аникеева Ирина Юрьевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Зеленодольское, ул. Центральная</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Егоровка
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Кравцова Людмила Павловна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, с. Егоровка, ул. Буденного, 10</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП станция п. Колпаково
                    </CardTitle>
                    <CardDescription className="text-base">
                      <DoctorName title="Заведующий" name="Демченко Ирина Васильевна" />
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
                      <p>Антрацитовский р-н, п. Колпаково, ул. Садовая, 1Б</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="bg-primary/5">
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Cross" size={24} className="text-primary" />
                      ФАП с. Вишневое
                    </CardTitle>
                    <CardDescription className="text-base">
                      Заведующий фельдшерско-акушерским пунктом
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-2">
                    <div className="flex items-start gap-2">
                      <Icon name="MapPin" size={16} className="text-primary mt-0.5" />
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