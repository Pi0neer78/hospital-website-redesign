import { Link } from 'react-router-dom';
import Icon from '@/components/ui/icon';

interface DocItem {
  title: string;
  url: string;
}

interface DocCategory {
  title: string;
  icon: string;
  items: DocItem[];
}

const categories: DocCategory[] = [
  {
    title: 'Учредительные документы',
    icon: 'Landmark',
    items: [
      { title: 'Устав учреждения 08.11.2023 233-ОД', url: 'https://xn--90ad1a1b.xn--p1ai/doc/ustav.pdf' },
    ],
  },
  {
    title: 'Учетная политика',
    icon: 'BookOpen',
    items: [
      {
        title: 'Единая учетная политика для централизованной бухгалтерии (2026 г.)',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/667adbf6-7c97-4f45-9c8d-ddfd84bd2c58.pdf',
      },
      {
        title: 'Приказ об утверждении единой учётной политики ГБУЗ «АЦГМБ» ЛНР и ГБУЗ «Антрацитовская городская стоматологическая поликлиника» ЛНР',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/5ab4725e-6d5a-4182-9623-76f34ea63835.pdf',
      },
      {
        title: 'Приложение № 21',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/e9350af6-8292-456e-9d4f-0a11e747ec91.pdf',
      },
      {
        title: 'Приложение № 22',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/28c059c2-0fe5-4ea5-a6c5-2fda1d0cbe96.pdf',
      },
      {
        title: 'Приложение № Протокол заседания комиссии по приёму нефинансовых активов',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/f05733be-50be-4fa2-a3ac-aa226156031e.pdf',
      },
    ],
  },
  {
    title: 'Документооборот и инвентаризация',
    icon: 'FolderKanban',
    items: [
      {
        title: 'Приложение №1 к графику документооборота. Журнал ознакомления сотрудников с графиком электронного документооборота',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/7d10a49e-95a2-4249-9dee-4a06d17dee4c.pdf',
      },
      {
        title: 'Приложение №1 к порядку инвентаризации. Акт инвентаризации резервов предстоящих расходов',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/6dbd2f34-44bb-484b-bf30-12c213f1f595.pdf',
      },
      {
        title: 'Приложение №2 к порядку инвентаризации. Акт инвентаризации доходов будущих периодов',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/b4b1d3c9-4b0f-4cd3-89ef-6a861a09700e.pdf',
      },
      {
        title: 'Приложение №3. Акт выполненных работ (оказанных услуг); Акт о выявленных дефектах оборудования; Книга учёта движения талонов на ГСМ; Признание факта хозяйственной жизни',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adbdce60-3e60-4d97-9114-a3bf87f3b4b5.pdf',
      },
      {
        title: 'Приложение №3.1. Акт ввода в эксплуатацию',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/9e690b10-6df9-45ec-b818-df08d8b433ee.pdf',
      },
      {
        title: 'Приложение №3.3. Отчёт о движении лекарственных средств',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/3dd3178e-23ca-472a-a9d1-fa0df00074bc.pdf',
      },
      {
        title: 'Приложение №3.4. Отчёт о движении медицинского расходного материала и медизделий',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/af26cf0e-09f1-4a89-8cf1-ad4710118dd3.pdf',
      },
      {
        title: 'Приложение №3.5. Отчёт о движении конвертов; Реестр отправленной корреспонденции',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/23101968-ff8e-4815-8267-49fed8612d0e.pdf',
      },
      {
        title: 'Приложение №3.6. Путевой лист (стр. 1)',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/354e0669-c792-4ee2-87df-5a53a4ccfbb8.pdf',
      },
      {
        title: 'Приложение №3.6. Путевой лист (стр. 2)',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/f6cf74f5-df15-4043-8026-229fff2899b0.pdf',
      },
      {
        title: 'Приложение №3.7. Меню-требование на выдачу продуктов питания',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/4b8ab789-1c66-432b-bf5b-2421ab044af7.pdf',
      },
      {
        title: 'Приложение №4. Порядок проведения инвентаризации активов и обязательств учреждений',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/c5053fa5-0887-431a-8cf5-1ec09948a5c3.pdf',
      },
      {
        title: 'Приложение №6. Перечень должностных лиц, имеющих право подписи (утверждения) первичных учётных документов, счетов-фактур, денежных и расчётных документов, финансовых обязательств',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/c22cc3a8-59bf-484a-a633-5ca52c8443d8.pdf',
      },
      {
        title: 'Приложение №8. Положение о приёмке, хранении, выдаче (списании) бланков строгой отчётности',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/34af617a-fc6b-4b8f-b3de-2e3a6daa8c84.pdf',
      },
      {
        title: 'Приложение №9. Перечень должностей сотрудников, ответственных за учёт, хранение и выдачу бланков строгой отчётности',
        url: 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/88ce3623-db99-4734-9059-01b6394c6f30.pdf',
      },
    ],
  },
];

const DocLink = ({ title, url }: DocItem) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-center gap-5 p-5 rounded-2xl border border-border bg-white shadow-sm hover:shadow-md hover:border-red-300 transition-all duration-200"
  >
    <div className="flex-shrink-0 w-14 h-14 bg-red-50 rounded-xl flex items-center justify-center group-hover:bg-red-100 transition-colors">
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-9 h-9">
        <rect width="40" height="40" rx="8" fill="#E53935" />
        <path d="M10 8h14l6 6v18H10V8z" fill="white" />
        <path d="M24 8v6h6" stroke="#E53935" strokeWidth="1.5" fill="none" />
        <text x="20" y="28" textAnchor="middle" fill="#E53935" fontSize="7" fontWeight="bold" fontFamily="Arial">PDF</text>
      </svg>
    </div>
    <div className="flex-1 min-w-0">
      <p className="font-semibold text-foreground group-hover:text-primary transition-colors text-base leading-snug">
        {title}
      </p>
      <p className="text-sm text-muted-foreground mt-0.5">Формат: PDF · Открыть в новой вкладке</p>
    </div>
    <div className="flex-shrink-0 text-muted-foreground group-hover:text-primary transition-colors">
      <Icon name="ExternalLink" size={18} />
    </div>
  </a>
);

const Docs = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-white/80 backdrop-blur-sm border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <img
                src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg"
                alt="Логотип АЦГМБ ЛНР"
                className="w-12 h-12 object-contain mix-blend-multiply rounded-full"
              />
              <div>
                <h1 className="text-sm font-bold text-primary leading-tight">
                  ГБУЗ Антрацитовская центральная<br />городская многопрофильная больница
                </h1>
              </div>
            </Link>
            <nav className="hidden lg:flex gap-4 text-sm ml-auto">
              <Link to="/" className="text-foreground hover:text-primary transition-colors font-medium">Главная</Link>
              <Link to="/about" className="text-foreground hover:text-primary transition-colors font-medium">О нас</Link>
              <a href="/#doctors" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">График приема граждан</a>
              <Link to="/structure" className="text-foreground hover:text-primary transition-colors font-medium whitespace-nowrap">Структура</Link>
              <a href="/#contacts" className="text-foreground hover:text-primary transition-colors font-medium">Контакты</a>
              <Link to="/docs" className="text-primary font-semibold border-b-2 border-primary pb-0.5 whitespace-nowrap">Документы</Link>
            </nav>
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-br from-primary/10 via-background to-accent/10 overflow-hidden">
        <div className="container mx-auto px-4 flex items-stretch min-h-[200px]">
          <div className="flex-shrink-0 w-48 sm:w-64 relative -ml-4 sm:ml-0">
            <img
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/542dd71b-9199-4233-9db3-622da8e46a02.jpg"
              alt="Документы"
              className="h-full w-full object-cover object-center mix-blend-multiply"
            />
          </div>
          <div className="flex flex-col justify-center py-12 pl-8">
            <h1 className="text-3xl sm:text-4xl font-bold mb-3">Документы</h1>
            <p className="text-muted-foreground text-base max-w-xl">
              Официальные документы ГБУЗ «Антрацитовская центральная городская многопрофильная больница»
            </p>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl space-y-10">
          {categories.map((category) => (
            <div key={category.title}>
              <div className="flex items-center gap-2 mb-4">
                <Icon name={category.icon} size={20} className="text-primary" />
                <h2 className="text-xl font-bold text-foreground">{category.title}</h2>
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <DocLink key={item.url} title={item.title} url={item.url} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Docs;