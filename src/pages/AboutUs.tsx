import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const stats = [
  { value: '114', label: 'врачей', icon: 'Stethoscope', image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/dff9bd65-1816-4521-a27a-8cf8fb8ffb3e.png' },
  { value: '548', label: 'средних медработников', icon: 'Users', image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/fe32ec8d-beab-4acd-9617-4ccb6cc8c3bf.png' },
  { value: '78%', label: 'врачей с квалификационной категорией', icon: 'Award', image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/223f9acd-85ae-4f09-ad40-4854305f425b.png' },
  { value: '88 500', label: 'человек обслуживаемого населения', icon: 'MapPin', image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/01af3145-687f-43b3-b104-2c1e080eab3d.png' },
];

const departments = [
  { name: 'Терапевтическое', icon: 'Heart' },
  { name: 'Кардиологическое', icon: 'Activity' },
  { name: 'Инфекционное (взрослые и дети)', icon: 'Shield' },
  { name: 'Хирургическое', icon: 'Scissors' },
  { name: 'Травматологическое', icon: 'Bone' },
  { name: 'Для беременных и рожениц', icon: 'Baby' },
  { name: 'Гинекологическое', icon: 'CircleUser' },
  { name: 'Неврологическое', icon: 'Brain' },
  { name: 'Психиатрическое', icon: 'Smile' },
  { name: 'Наркологическое', icon: 'Pill' },
  { name: 'Офтальмологическое', icon: 'Eye' },
  { name: 'Отоларингологическое', icon: 'Ear' },
  { name: 'Педиатрическое', icon: 'BookHeart' },
  { name: 'Анестезиологии и интенсивной терапии', icon: 'Syringe' },
];

const dayStationDepts = [
  'Терапевтический',
  'Неврологический',
  'Дерматовенерологический',
  'Гинекологический',
  'Педиатрический',
];

const equipment = [
  {
    icon: 'Truck',
    name: 'Передвижной ФАП',
    desc: 'Оказание первичной и специализированной медицинской помощи жителям отдалённых населённых пунктов.',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/cd3ee83a-7cb4-42d3-aa73-b48225e4c212.jpg',
  },
  {
    icon: 'Scan',
    name: 'Флюорографический комплекс',
    desc: 'Обследование населения на патологию органов грудной клетки для раннего выявления заболеваний в рамках профилактических осмотров и диспансеризации.',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/6a92bdd9-2b7e-4ad0-b97e-9c36963d3e0a.jpg',
  },
  {
    icon: 'Zap',
    name: 'УНИЭКСПЕРТ 2 ПЛЮС',
    desc: 'Современный цифровой рентгеновский аппарат для высококачественной диагностики.',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/3de3449c-3f3e-4440-8a0e-16f7fc29e5f6.jpg',
  },
  {
    icon: 'Move',
    name: 'УНИКОМПАКТ П',
    desc: 'Аппарат рентген-диагностический передвижной — мобильность там, где это необходимо.',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/249abe9e-14a6-419e-a519-a267d8842ec1.jpg',
  },
  {
    icon: 'RefreshCw',
    name: 'РЕНЕКС (С-дуга)',
    desc: 'Рентгеновский аппарат для интервенционных процедур. Подвижная С-образная конструкция позволяет свободно позиционировать аппарат вокруг пациента без изменения его положения — незаменим при сложных хирургических вмешательствах.',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/9408f27c-c908-4c17-89cc-d790bca53c64.png',
  },
  {
    icon: 'Layers',
    name: 'Компьютерная томография (КТ)',
    desc: 'Открытие кабинета КТ запланировано на первую половину 2026 года. КТ — метод лучевой диагностики, позволяющий получать послойные изображения органов и тканей для точного выявления патологий.',
    badge: 'Скоро',
    image: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/00fc0ba5-9051-46eb-a2a1-2d98b6181530.png',
  },
];

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="https://cdn.poehali.dev/files/d1c15da6-7ffe-46bb-b5db-3d114b408cec.jpg"
                alt="Логотип АЦГМБ ЛНР"
                className="w-12 h-12 object-contain mix-blend-multiply"
              />
              <div>
                <h1 className="text-sm font-bold text-primary leading-tight">
                  ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница
                </h1>
              </div>
            </Link>
            <nav className="hidden lg:flex gap-4 text-sm ml-auto">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Главная</Link>
              <Link to="/about" className="text-primary font-semibold border-b-2 border-primary pb-0.5">О нас</Link>
              <a href="/#doctors" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">График приема</a>
              <Link to="/structure" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Структура</Link>
              <a href="/#contacts" className="text-foreground hover:text-primary transition-colors font-medium">Контакты</a>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 py-16 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img 
            src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/9c845097-846f-4d17-b494-9a37725f7596.jpg"
            alt="АЦГМБ"
            className="w-full max-w-4xl opacity-20 rounded-3xl object-cover"
            style={{
              maskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)',
              WebkitMaskImage: 'radial-gradient(ellipse at center, black 20%, transparent 70%)'
            }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">О нас</h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            ГБУЗ «АЦГМБ» ЛНР — многопрофильная больница, объединяющая опытных врачей и профессиональных медицинских работников, искренне преданных своему делу.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col items-center text-center p-6 rounded-2xl bg-primary/5 border border-primary/10 hover:shadow-md transition-shadow">
                {(s as any).image ? (
                  <img 
                    src={(s as any).image} 
                    alt={s.label}
                    className="w-48 h-24 rounded-2xl object-cover border-2 border-primary/20 mb-3"
                  />
                ) : (
                  <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-3">
                    <Icon name={s.icon as any} size={28} className="text-primary" />
                  </div>
                )}
                <span className="text-3xl font-bold text-primary">{s.value}</span>
                <span className="text-sm text-muted-foreground mt-1">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* О коллективе */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="HeartHandshake" size={22} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Наш коллектив</h3>
          </div>
          <div className="space-y-4 text-base text-foreground/80 leading-relaxed">
            <p>
              Квалифицированные категории по своим специальностям имеют <strong>78% врачей</strong> и <strong>70% средних медицинских работников</strong>.
            </p>
            <p>
              В здравоохранении Антрацитовского муниципального округа работают медицинские работники, неравнодушные к чужим проблемам, любящие своих пациентов и свою работу. В коллективе сформирована хорошая доброжелательная атмосфера.
            </p>
            <p>
              Больница предоставляет услуги пациентам по системе <strong>обязательного медицинского страхования (ОМС)</strong>.
            </p>
          </div>
        </div>
      </section>

      {/* Амбулаторная помощь */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Building2" size={22} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Амбулаторно-поликлиническая помощь</h3>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="MapPin" size={20} className="text-primary" />
                  Подразделения
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-foreground/80 space-y-2 leading-relaxed">
                <p>2 поликлиники, в т.ч. 1 детская</p>
                <p>14 врачебных амбулаторий</p>
                <p>20 фельдшерско-акушерских пунктов</p>
                <p className="mt-3 text-primary font-medium">Плановая мощность: 1 141 посещение в смену</p>
              </CardContent>
            </Card>
            <Card className="border-primary/10">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Icon name="Sun" size={20} className="text-primary" />
                  Дневные стационары
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {dayStationDepts.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-sm text-foreground/80">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                      {d}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Стационарная помощь */}
      <section className="py-14 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="BedDouble" size={22} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Стационарная помощь (круглосуточно)</h3>
          </div>
          
          <div className="flex justify-center gap-6 mb-8">
            {[
              'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/bdcdd983-d7cc-43aa-8055-44f0e07dba0b.png',
              'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/837c67aa-aae0-4265-93f5-ac2ce83d75fd.png',
              'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/1d4cad76-57bc-44c4-abfe-d287027c9141.png'
            ].map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Стационар ${idx + 1}`}
                className="w-64 h-48 object-cover rounded-2xl border-2 border-primary/20"
              />
            ))}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 mb-8">
            {departments.map((d) => (
              <div key={d.name} className="flex flex-col items-center text-center p-4 rounded-xl bg-white border border-border hover:border-primary/30 hover:shadow-sm transition-all">
                <Icon name={d.icon as any} size={24} className="text-primary mb-2" />
                <span className="text-xs text-foreground/80 leading-snug">{d.name}</span>
              </div>
            ))}
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
              <img 
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7ceff4d7-cfb9-47bd-9d37-ac685373f34e.png"
                alt="Хирургия"
                className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-primary/20"
              />
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Scissors" size={18} className="text-primary" />
                <span className="font-semibold text-sm">Хирургия</span>
              </div>
              <p className="text-sm text-foreground/80">Современная эндолапароскопическая техника сокращает восстановительный период и позволяет выписать пациента уже через <strong>7 суток</strong>.</p>
            </div>
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
              <img 
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/e9ffb5eb-5d28-42f7-99d1-b1e8702775de.png"
                alt="Терапия"
                className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-primary/20"
              />
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Heart" size={18} className="text-primary" />
                <span className="font-semibold text-sm">Терапия</span>
              </div>
              <p className="text-sm text-foreground/80">Квалифицированная помощь при заболеваниях лёгких, ЖКТ и эндокринной системы.</p>
            </div>
            <div className="p-5 rounded-xl bg-primary/5 border border-primary/10">
              <img 
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/79d8052b-8e3d-4909-aafd-4462d5edd119.png"
                alt="Неврология"
                className="w-full h-48 object-cover rounded-xl mb-4 border-2 border-primary/20"
              />
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Brain" size={18} className="text-primary" />
                <span className="font-semibold text-sm">Неврология</span>
              </div>
              <p className="text-sm text-foreground/80">Медицинская помощь при широком спектре неврологических заболеваний.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Оборудование */}
      <section className="py-14 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="Cpu" size={22} className="text-primary" />
            </div>
            <h3 className="text-2xl font-bold text-foreground">Современное оборудование</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipment.map((eq) => (
              <Card key={eq.name} className="border-border hover:shadow-md transition-shadow relative">
                {eq.badge && (
                  <span className="absolute top-4 right-4 bg-primary text-white text-xs px-2 py-0.5 rounded-full font-medium">
                    {eq.badge}
                  </span>
                )}
                <CardHeader className="pb-2">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
                    <Icon name={eq.icon as any} size={24} className="text-primary" />
                  </div>
                  <CardTitle className="text-base">{eq.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  {(eq as any).image && (
                    <div className="mb-4 -mx-6 -mt-2">
                      <img 
                        src={(eq as any).image} 
                        alt={eq.name}
                        className="w-full h-48 object-contain bg-gradient-to-br from-primary/5 to-accent/5"
                      />
                    </div>
                  )}
                  <p className="text-sm text-muted-foreground leading-relaxed">{eq.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Телемедицина */}
      <section className="py-14 bg-gradient-to-br from-primary/10 via-background to-accent/10">
        <div className="container mx-auto px-4 max-w-3xl text-center">
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-5">
            <Icon name="Monitor" size={28} className="text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-foreground mb-4">Цифровые технологии</h3>
          <p className="text-foreground/80 leading-relaxed">
            Развитие телекоммуникационных систем управления: <strong>видеоконференц-связь</strong>, телемедицинские коммуникации с российскими медицинскими коллегами, <strong>запись на приём к врачу через Интернет</strong>.
          </p>
          <div className="mt-6">
            <Link
              to="/?openAppointment=true"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
            >
              <Icon name="CalendarCheck" size={18} />
              Записаться на приём онлайн
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-8">
        <div className="container mx-auto px-4 text-center text-white/90">
          <p className="text-sm">© 2024 ГБУЗ «Антрацитовская центральная городская многопрофильная больница» ЛНР</p>
          <p className="text-xs mt-2 text-white/70">Все права защищены</p>
          <div className="flex gap-4 justify-center mt-3">
            <a href="/doctor" className="text-xs text-white/70 hover:text-white transition-colors inline-flex items-center gap-1">
              <Icon name="UserCog" size={14} />
              Вход для врача
            </a>
            <a href="/registrar" className="text-xs text-white/70 hover:text-white transition-colors inline-flex items-center gap-1">
              <Icon name="ClipboardList" size={14} />
              Вход для регистратора
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;