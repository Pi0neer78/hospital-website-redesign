import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

const DoctorGuide = () => {
  const navigate = useNavigate();
  const [openSection, setOpenSection] = useState<string | null>('intro');

  const toggleSection = (id: string) => {
    setOpenSection(openSection === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name="BookOpen" size={32} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Инструкция для врачей</h1>
              <p className="text-sm text-gray-600">Полное руководство по работе с системой</p>
            </div>
          </div>
          <Button onClick={() => navigate('/doctor')} variant="default" size="lg">
            <Icon name="ArrowLeft" size={18} className="mr-2" />
            Вернуться в систему
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="mb-8 bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-white/20 p-3 rounded-full">
                <Icon name="Lightbulb" size={32} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-3">Добро пожаловать!</h2>
                <p className="text-lg leading-relaxed mb-4">
                  Это подробное руководство поможет вам освоить все возможности системы управления записями пациентов. 
                  Здесь вы найдете пошаговые инструкции, практические примеры и полезные советы.
                </p>
                <div className="grid md:grid-cols-3 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Calendar" size={20} />
                      <span className="font-semibold">Календарь</span>
                    </div>
                    <p className="text-sm text-white/90">Управление выходными днями на весь год</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Clock" size={20} />
                      <span className="font-semibold">Расписание</span>
                    </div>
                    <p className="text-sm text-white/90">Настройка еженедельного графика работы</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Users" size={20} />
                      <span className="font-semibold">Записи</span>
                    </div>
                    <p className="text-sm text-white/90">Управление приемами пациентов</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <nav className="mb-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Icon name="List" size={20} className="text-blue-600" />
            Содержание инструкции
          </h3>
          <div className="grid md:grid-cols-2 gap-3">
            {[
              { id: 'login', icon: 'LogIn', title: '1. Вход в систему', color: 'text-purple-600' },
              { id: 'interface', icon: 'Layout', title: '2. Интерфейс системы', color: 'text-indigo-600' },
              { id: 'calendar', icon: 'CalendarDays', title: '3. Годовой календарь', color: 'text-blue-600' },
              { id: 'schedule', icon: 'Clock', title: '4. Еженедельное расписание', color: 'text-cyan-600' },
              { id: 'appointments', icon: 'Users', title: '5. Управление записями', color: 'text-green-600' },
              { id: 'autorefresh', icon: 'RefreshCw', title: '6. Автообновление', color: 'text-orange-600' },
              { id: 'filters', icon: 'Filter', title: '7. Фильтры и поиск', color: 'text-pink-600' },
              { id: 'tips', icon: 'Sparkles', title: '8. Полезные советы', color: 'text-amber-600' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  toggleSection(item.id);
                  document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors text-left"
              >
                <Icon name={item.icon as any} size={20} className={item.color} />
                <span className="font-medium text-gray-800">{item.title}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="space-y-6">
          <Section
            id="login"
            icon="LogIn"
            title="1. Вход в систему"
            isOpen={openSection === 'login'}
            onToggle={() => toggleSection('login')}
            color="purple"
          >
            <Step number="1" title="Откройте страницу входа">
              <p className="text-gray-700 mb-3">
                Перейдите на страницу <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">/doctor</code> или нажмите на кнопку "Вход для врачей" на главной странице.
              </p>
            </Step>

            <Step number="2" title="Введите учетные данные">
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-4">
                <p className="font-semibold text-blue-900 mb-2">Ваши данные для входа:</p>
                <ul className="text-blue-800 space-y-1 text-sm">
                  <li>• <strong>Логин:</strong> Выдается администрацией (например: ivanov_am)</li>
                  <li>• <strong>Пароль:</strong> Ваш личный пароль</li>
                </ul>
              </div>
              <p className="text-sm text-gray-600">
                Если вы забыли пароль или не получили учетные данные, обратитесь к администратору системы.
              </p>
            </Step>

            <Step number="3" title="Безопасность">
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Важно знать:</p>
                <ul className="text-amber-800 space-y-1 text-sm">
                  <li>• После 5 неудачных попыток входа учетная запись блокируется на 15 минут</li>
                  <li>• Не передавайте свои данные для входа другим людям</li>
                  <li>• После завершения работы нажимайте кнопку "Выход" в правом верхнем углу</li>
                </ul>
              </div>
            </Step>
          </Section>

          <Section
            id="interface"
            icon="Layout"
            title="2. Интерфейс системы"
            isOpen={openSection === 'interface'}
            onToggle={() => toggleSection('interface')}
            color="indigo"
          >
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Icon name="LayoutGrid" size={20} className="text-indigo-600" />
                  Главное меню (верхняя панель)
                </h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <Icon name="User" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Ваши данные</p>
                      <p className="text-sm text-gray-600">ФИО и должность отображаются в левом верхнем углу</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded">
                      <Icon name="RefreshCw" size={20} className="text-orange-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Панель автообновления</p>
                      <p className="text-sm text-gray-600">Включите/выключите автоматическую проверку новых записей</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded">
                      <Icon name="BookOpen" size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Кнопка "Инструкция"</p>
                      <p className="text-sm text-gray-600">Открывает эту страницу с подробным руководством</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-gray-100 p-2 rounded">
                      <Icon name="Home" size={20} className="text-gray-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">На главную</p>
                      <p className="text-sm text-gray-600">Возврат на главную страницу сайта</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-red-100 p-2 rounded">
                      <Icon name="LogOut" size={20} className="text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">Выход</p>
                      <p className="text-sm text-gray-600">Безопасный выход из системы (всегда используйте при завершении работы)</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <Icon name="Tabs" size={20} className="text-indigo-600" />
                  Три основные вкладки
                </h4>
                <div className="grid md:grid-cols-3 gap-4">
                  <Card className="border-2 border-blue-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Calendar" size={24} className="text-blue-600" />
                        <h5 className="font-bold text-blue-900">Календарь</h5>
                      </div>
                      <p className="text-sm text-gray-700">
                        Годовой календарь для отметки выходных дней, отпусков и праздников
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-purple-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Clock" size={24} className="text-purple-600" />
                        <h5 className="font-bold text-purple-900">Расписание</h5>
                      </div>
                      <p className="text-sm text-gray-700">
                        Настройка еженедельного графика работы по дням недели
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="border-2 border-green-200">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon name="Users" size={24} className="text-green-600" />
                        <h5 className="font-bold text-green-900">Записи пациентов</h5>
                      </div>
                      <p className="text-sm text-gray-700">
                        Список всех записей с возможностью управления и фильтрации
                      </p>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </Section>

          <Section
            id="calendar"
            icon="CalendarDays"
            title="3. Годовой календарь работы"
            isOpen={openSection === 'calendar'}
            onToggle={() => toggleSection('calendar')}
            color="blue"
          >
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
              <p className="font-semibold text-blue-900 mb-2">🎯 Для чего нужен календарь?</p>
              <p className="text-blue-800 text-sm">
                Годовой календарь позволяет управлять рабочими и выходными днями на весь год вперёд. 
                Отмечайте отпуска, праздники, больничные и особые дни — пациенты автоматически не увидят эти даты при записи.
              </p>
            </div>

            <Step number="1" title="Открытие календаря">
              <p className="text-gray-700 mb-3">
                Перейдите на вкладку <strong className="text-blue-600">"Календарь"</strong> (первая вкладка с иконкой календаря).
              </p>
              <p className="text-sm text-gray-600">
                По умолчанию отображается текущий год. Вы можете выбрать другой год (2025-2030) из выпадающего списка.
              </p>
            </Step>

            <Step number="2" title="Понимание цветов">
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-200 border-2 border-green-400 rounded"></div>
                    <span className="font-bold text-green-900">Зелёный цвет</span>
                  </div>
                  <p className="text-sm text-green-800">
                    <strong>Рабочий день</strong> — пациенты могут записываться на приём
                  </p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-red-200 border-2 border-red-400 rounded"></div>
                    <span className="font-bold text-red-900">Красный цвет</span>
                  </div>
                  <p className="text-sm text-red-800">
                    <strong>Выходной день</strong> — запись на этот день заблокирована
                  </p>
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Подсказка:</strong> Текущий день выделен синей рамкой для быстрой ориентации в календаре.
                </p>
              </div>
            </Step>

            <Step number="3" title="Отметка выходных дней">
              <p className="text-gray-700 mb-3">
                Чтобы отметить день как выходной (или вернуть обратно как рабочий):
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Найдите нужный день в календаре</li>
                <li><strong>Нажмите один раз</strong> на ячейку с датой</li>
                <li>Цвет изменится: зелёный → красный (или наоборот)</li>
                <li>Изменения сохраняются автоматически</li>
              </ol>
              <div className="bg-amber-50 border-l-4 border-amber-500 p-4">
                <p className="font-semibold text-amber-900 mb-2">⚠️ Защита от случайных ошибок</p>
                <p className="text-sm text-amber-800">
                  Если на выбранный день уже есть записи пациентов, система покажет предупреждение и попросит подтвердить действие. 
                  Это защитит от случайного закрытия дня с активными записями.
                </p>
              </div>
            </Step>

            <Step number="4" title="Планирование отпусков">
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 mb-4">
                <h5 className="font-bold text-purple-900 mb-3 flex items-center gap-2">
                  <Icon name="Plane" size={20} />
                  Пример: Отпуск с 1 по 14 июля
                </h5>
                <ol className="list-decimal list-inside space-y-2 text-purple-800 ml-4 text-sm">
                  <li>Откройте календарь, найдите июль</li>
                  <li>Нажмите на 1 июля — день станет красным</li>
                  <li>Нажмите на 2 июля — день станет красным</li>
                  <li>Продолжайте нажимать до 14 июля включительно</li>
                  <li>Все 14 дней теперь красные — запись на них невозможна</li>
                </ol>
                <p className="text-sm text-purple-700 mt-3 bg-white/50 p-3 rounded">
                  💡 Планируйте отпуска заранее на весь год — это удобно для пациентов и для вас!
                </p>
              </div>
            </Step>

            <Step number="5" title="Статистика слотов">
              <p className="text-gray-700 mb-3">
                Для загрузки статистики свободных и занятых слотов:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Нажмите кнопку <strong className="text-blue-600">"Получить слоты"</strong> над календарём</li>
                <li>Система загрузит данные на текущий и следующий месяц (около 60 дней)</li>
                <li>В ячейках появятся цифры, например: <code className="bg-gray-100 px-1 rounded">5/3</code></li>
                <li><strong>5</strong> — свободных слотов, <strong>3</strong> — занятых слотов</li>
              </ol>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  <Icon name="TrendingUp" size={16} className="inline mr-1" />
                  <strong>Полезно знать:</strong> Статистика помогает оценить загруженность на будущее и спланировать дополнительные рабочие дни при необходимости.
                </p>
              </div>
            </Step>

            <Step number="6" title="Приоритет календаря">
              <div className="bg-red-50 border-2 border-red-300 rounded-lg p-5">
                <h5 className="font-bold text-red-900 mb-2 flex items-center gap-2">
                  <Icon name="AlertTriangle" size={20} />
                  Календарь ВАЖНЕЕ расписания!
                </h5>
                <p className="text-sm text-red-800 mb-3">
                  Даже если в еженедельном расписании понедельник указан как рабочий день, 
                  выходной в календаре на конкретный понедельник (например, 1 января) запретит запись.
                </p>
                <div className="bg-white/60 p-3 rounded text-sm text-red-700">
                  <p className="mb-1"><strong>Пример:</strong></p>
                  <p>• Расписание: Понедельник — рабочий день (08:00-17:00)</p>
                  <p>• Календарь: 1 января (понедельник) отмечен красным</p>
                  <p>• <strong>Результат:</strong> Пациенты НЕ смогут записаться на 1 января</p>
                </div>
              </div>
            </Step>
          </Section>

          <Section
            id="schedule"
            icon="Clock"
            title="4. Еженедельное расписание"
            isOpen={openSection === 'schedule'}
            onToggle={() => toggleSection('schedule')}
            color="cyan"
          >
            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 mb-6">
              <p className="font-semibold text-purple-900 mb-2">🎯 Для чего нужно расписание?</p>
              <p className="text-purple-800 text-sm">
                Еженедельное расписание — это основа вашего рабочего графика. Здесь вы настраиваете, 
                в какие дни недели вы принимаете, с какого по какое время, и сколько длится один приём. 
                Это базовый шаблон, который повторяется каждую неделю.
              </p>
            </div>

            <Step number="1" title="Добавление первого рабочего дня">
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Перейдите на вкладку <strong className="text-purple-600">"Расписание"</strong></li>
                <li>Нажмите кнопку <Button size="sm" className="inline-flex mx-1"><Icon name="Plus" size={14} className="mr-1" />Добавить день</Button></li>
                <li>Откроется форма настройки рабочего дня</li>
              </ol>
            </Step>

            <Step number="2" title="Заполнение формы">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-5 mb-4">
                <h5 className="font-bold text-indigo-900 mb-4">Пример: Настройка понедельника</h5>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">День недели</p>
                    <p className="font-bold text-gray-900">Понедельник</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">Длительность слота</p>
                    <p className="font-bold text-gray-900">20 минут</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">Время начала</p>
                    <p className="font-bold text-gray-900">08:00</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">Время окончания</p>
                    <p className="font-bold text-gray-900">16:00</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">Начало перерыва</p>
                    <p className="font-bold text-gray-900">12:00</p>
                  </div>
                  <div className="bg-white rounded p-3">
                    <p className="text-gray-600 mb-1">Конец перерыва</p>
                    <p className="font-bold text-gray-900">12:30</p>
                  </div>
                </div>
                <div className="mt-4 bg-green-100 border border-green-300 rounded p-3">
                  <p className="text-sm font-semibold text-green-900 mb-1">Результат:</p>
                  <p className="text-sm text-green-800">
                    Система создаст слоты: 08:00, 08:20, 08:40, 09:00... 11:40, 
                    затем перерыв 12:00-12:30, затем 12:30, 12:50, 13:10... до 16:00
                  </p>
                </div>
              </div>
            </Step>

            <Step number="3" title="Что такое слот времени?">
              <div className="bg-blue-50 rounded-lg p-4 mb-4">
                <p className="text-gray-800 mb-3">
                  <strong>Слот</strong> — это интервал времени, выделенный на один приём пациента.
                </p>
                <div className="space-y-3">
                  <div className="bg-white rounded p-3 border-l-4 border-blue-400">
                    <p className="font-semibold text-blue-900 mb-1">15 минут (быстрый приём)</p>
                    <p className="text-sm text-gray-700">08:00, 08:15, 08:30, 08:45, 09:00...</p>
                    <p className="text-xs text-gray-600 mt-1">Подходит для стандартных консультаций</p>
                  </div>
                  <div className="bg-white rounded p-3 border-l-4 border-green-400">
                    <p className="font-semibold text-green-900 mb-1">20 минут (средний приём)</p>
                    <p className="text-sm text-gray-700">08:00, 08:20, 08:40, 09:00, 09:20...</p>
                    <p className="text-xs text-gray-600 mt-1">Универсальный вариант для большинства приёмов</p>
                  </div>
                  <div className="bg-white rounded p-3 border-l-4 border-purple-400">
                    <p className="font-semibold text-purple-900 mb-1">30 минут (длительный приём)</p>
                    <p className="text-sm text-gray-700">08:00, 08:30, 09:00, 09:30, 10:00...</p>
                    <p className="text-xs text-gray-600 mt-1">Для сложных консультаций и процедур</p>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                💡 <strong>Совет:</strong> Вы можете использовать любую длительность от 5 до 120 минут. 
                Для разных дней недели можно установить разную длительность.
              </p>
            </Step>

            <Step number="4" title="Копирование расписания на другие дни">
              <p className="text-gray-700 mb-3">
                Чтобы не настраивать каждый день отдельно, используйте функцию копирования:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Найдите день с уже настроенным расписанием</li>
                <li>Нажмите кнопку <Button size="sm" variant="outline" className="inline-flex mx-1"><Icon name="Copy" size={14} className="mr-1" />Копировать</Button></li>
                <li>Выберите галочками дни, на которые хотите скопировать</li>
                <li>Нажмите "Применить копирование"</li>
              </ol>
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                <h5 className="font-semibold text-green-900 mb-2">Пример использования:</h5>
                <p className="text-sm text-green-800 mb-2">
                  У вас настроен понедельник: 08:00-16:00, слот 20 мин, перерыв 12:00-12:30
                </p>
                <p className="text-sm text-green-800 mb-2">
                  Скопируйте его на вторник, среду, четверг и пятницу
                </p>
                <p className="text-sm font-semibold text-green-900">
                  → Все 5 дней получат одинаковое расписание за 10 секунд вместо 5 минут ручной настройки!
                </p>
              </div>
            </Step>

            <Step number="5" title="Массовое изменение длительности слотов">
              <p className="text-gray-700 mb-3">
                Если вам нужно изменить длительность слота сразу для всех рабочих дней:
              </p>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Нажмите кнопку <strong className="text-purple-600">"Применить слоты ко всем дням"</strong></li>
                <li>Укажите новую длительность (например, 30 минут)</li>
                <li>Нажмите "Применить"</li>
                <li>Все существующие дни получат новую длительность слота</li>
              </ol>
              <div className="bg-amber-50 border border-amber-200 rounded p-3">
                <p className="text-sm text-amber-800">
                  <Icon name="Zap" size={16} className="inline mr-1" />
                  <strong>Быстро:</strong> Вместо редактирования 5-7 дней по отдельности, 
                  измените длительность слота для всех дней одним кликом!
                </p>
              </div>
            </Step>

            <Step number="6" title="Редактирование и удаление">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <Icon name="Edit" size={18} />
                    Редактирование
                  </h5>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Нажмите иконку карандаша ✏️</li>
                    <li>• Измените время или слоты</li>
                    <li>• Сохраните изменения</li>
                  </ul>
                </div>
                <div className="bg-orange-50 rounded-lg p-4">
                  <h5 className="font-bold text-orange-900 mb-2 flex items-center gap-2">
                    <Icon name="Pause" size={18} />
                    Деактивация
                  </h5>
                  <ul className="text-sm text-orange-800 space-y-1">
                    <li>• Временно отключает день</li>
                    <li>• Настройки сохраняются</li>
                    <li>• Легко активировать снова</li>
                  </ul>
                </div>
              </div>
            </Step>

            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-5 mt-6">
              <h5 className="font-bold mb-3 flex items-center gap-2">
                <Icon name="Award" size={20} />
                Пример готового расписания на неделю
              </h5>
              <div className="space-y-2 text-sm">
                <p><strong>Понедельник, Среда, Пятница:</strong> 09:00-18:00, обед 13:00-14:00, слот 30 мин</p>
                <p><strong>Вторник, Четверг:</strong> 10:00-16:00, без перерыва, слот 20 мин</p>
                <p><strong>Суббота:</strong> 09:00-14:00, без перерыва, слот 15 мин</p>
                <p><strong>Воскресенье:</strong> Не добавляется (автоматически выходной)</p>
              </div>
            </div>
          </Section>

          <Section
            id="appointments"
            icon="Users"
            title="5. Управление записями пациентов"
            isOpen={openSection === 'appointments'}
            onToggle={() => toggleSection('appointments')}
            color="green"
          >
            <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
              <p className="font-semibold text-green-900 mb-2">🎯 Основной раздел работы</p>
              <p className="text-green-800 text-sm">
                Здесь отображаются все записи пациентов на приём. Вы можете просматривать, создавать, 
                переносить, клонировать, завершать и отменять записи.
              </p>
            </div>

            <Step number="1" title="Кнопки управления (верхняя панель)">
              <div className="space-y-3 mb-4">
                <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" className="bg-blue-700 animate-pulse-blue">
                      <Icon name="UserPlus" size={14} className="mr-1" />
                      Записать пациента
                    </Button>
                  </div>
                  <p className="text-sm text-blue-800">
                    <strong>Создание новой записи</strong> — выберите дату, время и введите данные пациента
                  </p>
                </div>
                <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" variant="outline">
                      <Icon name="Printer" size={14} className="mr-1" />
                      Печать
                    </Button>
                  </div>
                  <p className="text-sm text-gray-700">
                    <strong>Печать списка</strong> — распечатать отфильтрованные записи с деталями
                  </p>
                </div>
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
                  <div className="flex items-center gap-2 mb-2">
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700">
                      <Icon name="Download" size={14} className="mr-1" />
                      Экспорт
                    </Button>
                  </div>
                  <p className="text-sm text-green-800">
                    <strong>Экспорт в Excel</strong> — сохранить записи в файл Excel для отчётности
                  </p>
                </div>
              </div>
            </Step>

            <Step number="2" title="Создание записи пациента">
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4 mb-4">
                <li>Нажмите кнопку <strong className="text-blue-600">"Записать пациента"</strong></li>
                <li>Выберите дату из списка доступных дней (показаны только рабочие дни)</li>
                <li>Выберите свободное время из выпадающего списка</li>
                <li>Заполните данные пациента:
                  <ul className="ml-6 mt-2 space-y-1 text-sm">
                    <li>• ФИО пациента (обязательно)</li>
                    <li>• Номер телефона (обязательно)</li>
                    <li>• СНИЛС (необязательно)</li>
                    <li>• Описание/Причина обращения (необязательно)</li>
                  </ul>
                </li>
                <li>Нажмите "Создать запись"</li>
              </ol>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  <Icon name="Info" size={16} className="inline mr-1" />
                  <strong>Подсказка:</strong> При выборе даты справа от даты показано количество свободных слотов. 
                  Это помогает быстро найти наименее загруженный день.
                </p>
              </div>
            </Step>

            <Step number="3" title="Действия с записями (появляются при выборе строки)">
              <p className="text-gray-700 mb-3">
                Нажмите на любую строку с записью — она выделится, и справа появятся кнопки действий:
              </p>
              <div className="space-y-3">
                <div className="bg-green-50 border-l-4 border-green-600 p-4 rounded">
                  <Button size="sm" className="bg-green-600 animate-pulse-green mb-2">
                    <Icon name="CheckCircle" size={14} className="mr-1" />
                    Завершить прием
                  </Button>
                  <p className="text-sm text-green-800 mb-2">
                    <strong>Когда использовать:</strong> После того, как пациент пришёл на приём и консультация завершена
                  </p>
                  <p className="text-xs text-green-700">
                    Появится окно с данными пациента, можно добавить примечание о результатах приёма
                  </p>
                </div>
                <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
                  <Button size="sm" variant="outline" className="border-purple-300 mb-2">
                    <Icon name="Calendar" size={14} className="mr-1 text-purple-600" />
                    Перенести
                  </Button>
                  <p className="text-sm text-purple-800 mb-2">
                    <strong>Когда использовать:</strong> Пациент просит перенести запись на другой день/время
                  </p>
                  <p className="text-xs text-purple-700">
                    Выберите новую дату и время из доступных слотов. Старая запись автоматически заменится.
                  </p>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
                  <Button size="sm" variant="outline" className="border-blue-300 mb-2">
                    <Icon name="Copy" size={14} className="mr-1 text-blue-600" />
                    Клонировать
                  </Button>
                  <p className="text-sm text-blue-800 mb-2">
                    <strong>Когда использовать:</strong> Создание повторной записи того же пациента
                  </p>
                  <p className="text-xs text-blue-700">
                    Все данные пациента копируются автоматически, нужно выбрать только новую дату и время.
                  </p>
                </div>
                <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                  <Button size="sm" variant="outline" className="border-red-300 text-red-700 mb-2">
                    <Icon name="XCircle" size={14} className="mr-1" />
                    Отменить
                  </Button>
                  <p className="text-sm text-red-800 mb-2">
                    <strong>Когда использовать:</strong> Пациент отменил запись или не пришёл
                  </p>
                  <p className="text-xs text-red-700">
                    Слот освобождается и становится доступен для других пациентов. Можно добавить причину отмены.
                  </p>
                </div>
              </div>
            </Step>

            <Step number="4" title="Статусы записей">
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="font-bold text-yellow-900">Запланировано</span>
                  </div>
                  <p className="text-sm text-yellow-800">
                    Запись активна, пациент должен прийти
                  </p>
                </div>
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span className="font-bold text-blue-900">Завершено</span>
                  </div>
                  <p className="text-sm text-blue-800">
                    Приём состоялся и завершён
                  </p>
                </div>
                <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="font-bold text-red-900">Отменено</span>
                  </div>
                  <p className="text-sm text-red-800">
                    Запись отменена, слот свободен
                  </p>
                </div>
              </div>
            </Step>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-lg p-5 mt-6">
              <h5 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
                <Icon name="Sparkles" size={20} />
                Практический совет
              </h5>
              <p className="text-sm text-amber-800 mb-3">
                <strong>В конце каждого рабочего дня:</strong>
              </p>
              <ol className="text-sm text-amber-800 space-y-2 ml-4 list-decimal list-inside">
                <li>Отметьте все завершённые приёмы (зелёная кнопка)</li>
                <li>Отмените записи пациентов, которые не пришли</li>
                <li>Проверьте записи на завтра — подготовьтесь заранее</li>
              </ol>
            </div>
          </Section>

          <Section
            id="autorefresh"
            icon="RefreshCw"
            title="6. Автообновление записей"
            isOpen={openSection === 'autorefresh'}
            onToggle={() => toggleSection('autorefresh')}
            color="orange"
          >
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <p className="font-semibold text-orange-900 mb-2">🔔 Получайте уведомления о новых записях</p>
              <p className="text-orange-800 text-sm">
                Автообновление автоматически проверяет новые записи пациентов и показывает уведомление со звуком, 
                чтобы вы всегда были в курсе.
              </p>
            </div>

            <Step number="1" title="Включение автообновления">
              <p className="text-gray-700 mb-3">
                В правом верхнем углу найдите панель <strong>"Автообновление"</strong>:
              </p>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-sm font-medium text-gray-700">Автообновление</span>
                  <Button size="sm" variant="default" className="h-7">
                    <Icon name="Play" size={14} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7">
                    <Icon name="Volume2" size={14} />
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs">900с</Button>
                  <Button size="sm" className="h-7 bg-orange-500 text-white">
                    <Icon name="RefreshCw" size={14} />
                  </Button>
                </div>
              </div>
              <ol className="list-decimal list-inside space-y-2 text-gray-700 ml-4">
                <li><strong>Кнопка Play/Pause:</strong> Включить или выключить автообновление</li>
                <li><strong>Кнопка звука:</strong> Включить/выключить звуковой сигнал</li>
                <li><strong>Интервал:</strong> Нажмите, чтобы выбрать как часто проверять (15с, 30с, 60с...)</li>
                <li><strong>Оранжевая кнопка:</strong> Обновить записи вручную прямо сейчас</li>
              </ol>
            </Step>

            <Step number="2" title="Настройка интервала проверки">
              <p className="text-gray-700 mb-3">
                Выберите оптимальный интервал проверки новых записей:
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {[
                  { time: '15 секунд', use: 'Очень частая проверка', color: 'bg-red-50 border-red-200' },
                  { time: '30 секунд', use: 'Частая проверка', color: 'bg-orange-50 border-orange-200' },
                  { time: '60 секунд', use: 'Стандартная (рекомендуется)', color: 'bg-green-50 border-green-200' },
                  { time: '900 секунд', use: 'Редкая проверка', color: 'bg-blue-50 border-blue-200' }
                ].map((item, i) => (
                  <div key={i} className={`border-2 rounded-lg p-3 ${item.color}`}>
                    <p className="font-bold text-gray-900 text-sm mb-1">{item.time}</p>
                    <p className="text-xs text-gray-700">{item.use}</p>
                  </div>
                ))}
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Рекомендация:</strong> Используйте 60 секунд для баланса между актуальностью и нагрузкой на сервер.
                </p>
              </div>
            </Step>

            <Step number="3" title="Как работает уведомление">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-5">
                <h5 className="font-semibold text-green-900 mb-3">При появлении новой записи вы увидите:</h5>
                <div className="space-y-3">
                  <div className="bg-white rounded-lg p-4 border-l-4 border-green-500">
                    <p className="font-bold text-green-900 mb-1">🔔 Новая запись на прием!</p>
                    <p className="text-sm text-gray-700">Пациент: Иванов Иван Иванович</p>
                    <p className="text-sm text-gray-700">Телефон: +7 999 123-45-67</p>
                    <p className="text-sm text-gray-700">Дата: пн, 15 января в 14:20</p>
                    <p className="text-sm text-gray-700">Описание: Повторная консультация</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-green-800">
                    <Icon name="Volume2" size={16} />
                    <span>+ звуковой сигнал (если включен)</span>
                  </div>
                </div>
              </div>
            </Step>

            <Step number="4" title="Ручное обновление">
              <p className="text-gray-700 mb-3">
                Если вам нужно проверить новые записи прямо сейчас, не дожидаясь автоматической проверки:
              </p>
              <div className="bg-orange-50 border-2 border-orange-300 rounded-lg p-4">
                <p className="text-sm text-orange-800 mb-3">
                  Нажмите <Button size="sm" className="inline-flex mx-1 bg-orange-500"><Icon name="RefreshCw" size={14} /></Button> 
                  (оранжевая кнопка с иконкой обновления)
                </p>
                <p className="text-xs text-orange-700">
                  Это полезно, когда пациент только что звонил и сказал, что записался онлайн — 
                  вы сразу увидите его запись без ожидания.
                </p>
              </div>
            </Step>
          </Section>

          <Section
            id="filters"
            icon="Filter"
            title="7. Фильтры и поиск"
            isOpen={openSection === 'filters'}
            onToggle={() => toggleSection('filters')}
            color="pink"
          >
            <Step number="1" title="Фильтр по статусу">
              <p className="text-gray-700 mb-3">
                Над таблицей записей находятся кнопки быстрого фильтра:
              </p>
              <div className="flex gap-2 mb-4 flex-wrap">
                <Button size="sm" variant="outline">Все</Button>
                <Button size="sm" variant="outline" className="border-yellow-300 text-yellow-700">Запланировано</Button>
                <Button size="sm" variant="outline" className="border-blue-300 text-blue-700">Завершено</Button>
                <Button size="sm" variant="outline" className="border-red-300 text-red-700">Отменено</Button>
              </div>
              <p className="text-sm text-gray-600">
                Нажмите на нужный статус, чтобы отобразить только записи с этим статусом.
              </p>
            </Step>

            <Step number="2" title="Фильтр по дате">
              <p className="text-gray-700 mb-3">
                Выберите диапазон дат для просмотра записей:
              </p>
              <div className="grid md:grid-cols-2 gap-4 mb-4">
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Дата начала</label>
                  <input type="date" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <label className="text-sm font-medium text-gray-700 mb-1 block">Дата окончания</label>
                  <input type="date" className="w-full border rounded px-3 py-2 text-sm" />
                </div>
              </div>
              <p className="text-sm text-gray-600">
                По умолчанию показываются записи на ближайшие 7 дней. Измените диапазон для просмотра прошлых или будущих записей.
              </p>
            </Step>

            <Step number="3" title="Поиск по пациенту">
              <div className="bg-gray-50 border border-gray-200 rounded p-4 mb-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">Поиск</label>
                <input 
                  type="text" 
                  placeholder="Введите ФИО, телефон или СНИЛС..." 
                  className="w-full border rounded px-3 py-2"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded p-4">
                <p className="font-semibold text-blue-900 mb-2">Поиск работает по:</p>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• <strong>ФИО пациента</strong> — можно вводить частично (например, "Иван")</li>
                  <li>• <strong>Номер телефона</strong> — любая часть номера</li>
                  <li>• <strong>СНИЛС</strong> — если был указан при записи</li>
                </ul>
              </div>
            </Step>

            <Step number="4" title="Экспорт и печать">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4">
                  <h5 className="font-bold text-green-900 mb-2 flex items-center gap-2">
                    <Icon name="Download" size={18} />
                    Экспорт в Excel
                  </h5>
                  <p className="text-sm text-green-800 mb-2">
                    Создаёт файл Excel со всеми отфильтрованными записями
                  </p>
                  <p className="text-xs text-green-700">
                    Полезно для отчётности, архивирования и статистики
                  </p>
                </div>
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <h5 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <Icon name="Printer" size={18} />
                    Печать списка
                  </h5>
                  <p className="text-sm text-gray-800 mb-2">
                    Открывает окно печати с форматированным списком записей
                  </p>
                  <p className="text-xs text-gray-700">
                    Включает дату печати, ваше ФИО и специальность
                  </p>
                </div>
              </div>
            </Step>
          </Section>

          <Section
            id="tips"
            icon="Sparkles"
            title="8. Полезные советы и рекомендации"
            isOpen={openSection === 'tips'}
            onToggle={() => toggleSection('tips')}
            color="amber"
          >
            <div className="space-y-4">
              <TipCard 
                icon="Calendar"
                title="Планируйте отпуски заранее"
                color="blue"
              >
                <p className="text-sm mb-2">
                  В начале года отметьте все известные выходные дни: отпуска, праздники, командировки.
                </p>
                <p className="text-xs text-gray-600">
                  Пациенты увидят, что эти даты недоступны, и не будут пытаться записаться.
                </p>
              </TipCard>

              <TipCard 
                icon="Clock"
                title="Используйте разную длительность слотов"
                color="purple"
              >
                <p className="text-sm mb-2">
                  Для разных типов приёмов можно установить разное время:
                </p>
                <ul className="text-xs text-gray-600 space-y-1 ml-4">
                  <li>• Повторные пациенты — 15-20 минут</li>
                  <li>• Первичные консультации — 30 минут</li>
                  <li>• Сложные процедуры — 45-60 минут</li>
                </ul>
              </TipCard>

              <TipCard 
                icon="Bell"
                title="Включите автообновление"
                color="orange"
              >
                <p className="text-sm mb-2">
                  Оставляйте автообновление включенным в течение рабочего дня.
                </p>
                <p className="text-xs text-gray-600">
                  Вы сразу узнаете о новых записях и сможете подготовиться к приёму заранее.
                </p>
              </TipCard>

              <TipCard 
                icon="Copy"
                title="Копируйте расписание"
                color="green"
              >
                <p className="text-sm mb-2">
                  Настройте один день идеально, затем скопируйте на другие дни недели.
                </p>
                <p className="text-xs text-gray-600">
                  Это экономит время и исключает ошибки при ручном вводе.
                </p>
              </TipCard>

              <TipCard 
                icon="Search"
                title="Используйте поиск"
                color="pink"
              >
                <p className="text-sm mb-2">
                  Для быстрого поиска конкретного пациента используйте строку поиска.
                </p>
                <p className="text-xs text-gray-600">
                  Введите любую часть имени, телефона или СНИЛС — система найдёт все совпадения.
                </p>
              </TipCard>

              <TipCard 
                icon="Download"
                title="Экспортируйте данные регулярно"
                color="teal"
              >
                <p className="text-sm mb-2">
                  Раз в месяц экспортируйте записи в Excel для архива и отчётности.
                </p>
                <p className="text-xs text-gray-600">
                  Это создаст резервную копию и облегчит составление статистики.
                </p>
              </TipCard>

              <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg p-6 mt-6">
                <h4 className="font-bold text-xl mb-3 flex items-center gap-2">
                  <Icon name="Award" size={24} />
                  Ежедневная рутина
                </h4>
                <ol className="space-y-2 text-sm list-decimal list-inside">
                  <li>Утром: проверьте записи на сегодня, включите автообновление</li>
                  <li>В течение дня: завершайте приёмы сразу после консультации</li>
                  <li>Вечером: отметьте не пришедших пациентов, проверьте расписание на завтра</li>
                  <li>Раз в неделю: просмотрите статистику, обновите календарь если нужно</li>
                </ol>
              </div>
            </div>
          </Section>
        </div>

        <Card className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="text-center">
              <Icon name="HelpCircle" size={48} className="mx-auto mb-4 text-white/90" />
              <h3 className="text-2xl font-bold mb-3">Остались вопросы?</h3>
              <p className="text-white/90 mb-4 max-w-2xl mx-auto">
                Если вы не нашли ответ в этой инструкции или столкнулись с технической проблемой, 
                обратитесь к администратору системы или в техническую поддержку.
              </p>
              <Button onClick={() => navigate('/doctor')} size="lg" variant="secondary">
                <Icon name="ArrowRight" size={18} className="mr-2" />
                Начать работу с системой
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="bg-gray-50 border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-gray-600">
          <p>Система управления записями пациентов © 2025</p>
        </div>
      </footer>
    </div>
  );
};

const Section = ({ 
  id, 
  icon, 
  title, 
  isOpen, 
  onToggle, 
  children, 
  color = 'blue' 
}: { 
  id: string;
  icon: string;
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  color?: string;
}) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 border-purple-200',
    indigo: 'from-indigo-500 to-indigo-600 border-indigo-200',
    blue: 'from-blue-500 to-blue-600 border-blue-200',
    cyan: 'from-cyan-500 to-cyan-600 border-cyan-200',
    green: 'from-green-500 to-green-600 border-green-200',
    orange: 'from-orange-500 to-orange-600 border-orange-200',
    pink: 'from-pink-500 to-pink-600 border-pink-200',
    amber: 'from-amber-500 to-amber-600 border-amber-200'
  };

  return (
    <Card id={id} className={`border-2 ${colorClasses[color as keyof typeof colorClasses] || colorClasses.blue}`}>
      <CardHeader 
        className={`cursor-pointer bg-gradient-to-r ${colorClasses[color as keyof typeof colorClasses]} text-white`}
        onClick={onToggle}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Icon name={icon as any} size={28} />
            <CardTitle className="text-white">{title}</CardTitle>
          </div>
          <Icon name={isOpen ? 'ChevronUp' : 'ChevronDown'} size={24} />
        </div>
      </CardHeader>
      {isOpen && (
        <CardContent className="pt-6">
          {children}
        </CardContent>
      )}
    </Card>
  );
};

const Step = ({ 
  number, 
  title, 
  children 
}: { 
  number: string;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="mb-6 last:mb-0">
    <div className="flex items-start gap-3 mb-3">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
        {number}
      </div>
      <h4 className="font-bold text-lg text-gray-900 pt-1">{title}</h4>
    </div>
    <div className="ml-11">
      {children}
    </div>
  </div>
);

const TipCard = ({ 
  icon, 
  title, 
  children, 
  color = 'blue' 
}: { 
  icon: string;
  title: string;
  children: React.ReactNode;
  color?: string;
}) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-300 text-blue-900',
    purple: 'bg-purple-50 border-purple-300 text-purple-900',
    orange: 'bg-orange-50 border-orange-300 text-orange-900',
    green: 'bg-green-50 border-green-300 text-green-900',
    pink: 'bg-pink-50 border-pink-300 text-pink-900',
    teal: 'bg-teal-50 border-teal-300 text-teal-900'
  };

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[color as keyof typeof colorClasses]}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <Icon name={icon as any} size={20} />
        </div>
        <div>
          <h5 className="font-bold mb-2">{title}</h5>
          {children}
        </div>
      </div>
    </div>
  );
};

export default DoctorGuide;
