import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "@/components/ui/icon";

const INFOWALL_URL = "https://functions.poehali.dev/26562310-a6de-40d5-8adf-e1c8ad768c74";

interface Post { id: number; content: string; }
interface Topic { id: number; title: string; posts: Post[]; }
interface Section { id: number; title: string; description?: string; topics: Topic[]; }

const InfoWall = () => {
  const navigate = useNavigate();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<number | null>(null);
  const [activeTopic, setActiveTopic] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch(`${INFOWALL_URL}?action=get_all`)
      .then(r => r.json())
      .then(d => {
        const s = d.sections || [];
        setSections(s);
        if (s.length > 0) {
          setActiveSection(s[0].id);
          if (s[0].topics?.length > 0) setActiveTopic(s[0].topics[0].id);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const currentSection = sections.find(s => s.id === activeSection);
  const currentTopic = currentSection?.topics.find(t => t.id === activeTopic);

  const handleSectionClick = (sId: number) => {
    setActiveSection(sId);
    const sec = sections.find(s => s.id === sId);
    if (sec?.topics?.length) setActiveTopic(sec.topics[0].id);
    else setActiveTopic(null);
    setSidebarOpen(false);
  };

  const handleTopicClick = (tId: number) => {
    setActiveTopic(tId);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col print:bg-white">
      {/* Шапка */}
      <header className="bg-white border-b shadow-sm sticky top-0 z-40 print:hidden">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-1.5 rounded-lg hover:bg-muted transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Icon name="Menu" size={20} />
            </button>
            <img
              src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/adf474e3-ca46-4949-958c-72bcaef3e542.jpg"
              alt="Логотип"
              className="w-10 h-10 object-contain mix-blend-multiply rounded-full hidden sm:block"
            />
            <div>
              <p className="text-[10px] text-muted-foreground leading-none">ГБУЗ "АЦГМБ" ЛНР</p>
              <h1 className="text-sm font-bold text-primary leading-tight">Информационная стена</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors"
            >
              <Icon name="Printer" size={15} />
              <span className="hidden sm:inline">Печать</span>
            </button>
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              <Icon name="Home" size={15} />
              <span className="hidden sm:inline">На главную</span>
            </button>
          </div>
        </div>
      </header>

      {/* Мобильный оверлей */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex flex-1 container mx-auto px-4 py-4 gap-4 max-w-7xl">
        {/* Сайдбар */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-40 w-72 bg-white border-r lg:border lg:rounded-xl shadow-xl lg:shadow-sm
            transform transition-transform duration-300 lg:transform-none overflow-y-auto
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            top-0 pt-14 lg:pt-0 lg:top-auto
            print:hidden
          `}
        >
          <div className="p-3">
            {loading ? (
              <div className="py-8 flex justify-center">
                <Icon name="Loader2" size={24} className="animate-spin text-muted-foreground" />
              </div>
            ) : sections.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Информационная стена пуста</p>
            ) : (
              <nav className="space-y-1">
                {sections.map(section => (
                  <div key={section.id}>
                    {/* Заголовок раздела */}
                    <button
                      onClick={() => handleSectionClick(section.id)}
                      className={`w-full text-left flex items-center gap-2 px-3 py-2.5 rounded-lg font-semibold text-sm transition-all ${
                        activeSection === section.id
                          ? "bg-primary text-white"
                          : "hover:bg-muted text-foreground"
                      }`}
                    >
                      <Icon name="Layers" size={15} className="shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </button>
                    {/* Темы раздела */}
                    {activeSection === section.id && section.topics.length > 0 && (
                      <div className="ml-4 mt-0.5 space-y-0.5 border-l-2 border-primary/20 pl-2">
                        {section.topics.map(topic => (
                          <button
                            key={topic.id}
                            onClick={() => handleTopicClick(topic.id)}
                            className={`w-full text-left px-2 py-1.5 rounded-md text-xs transition-all ${
                              activeTopic === topic.id
                                ? "bg-primary/10 text-primary font-semibold"
                                : "hover:bg-muted text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Icon name="FileText" size={12} className="shrink-0" />
                              <span className="truncate">{topic.title}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            )}
          </div>
        </aside>

        {/* Основной контент */}
        <main className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <Icon name="Loader2" size={40} className="animate-spin text-primary mx-auto mb-3" />
                <p className="text-muted-foreground">Загрузка...</p>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Icon name="Layout" size={36} className="text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Информационная стена пуста</h2>
              <p className="text-muted-foreground text-sm max-w-sm">
                Материалы ещё не добавлены. Обратитесь к администратору.
              </p>
            </div>
          ) : !currentTopic ? (
            /* Обзор раздела */
            <div>
              <div className="bg-white rounded-xl border shadow-sm p-6 mb-4">
                <h2 className="text-2xl font-bold text-primary mb-1">{currentSection?.title}</h2>
                {currentSection?.description && (
                  <p className="text-muted-foreground">{currentSection.description}</p>
                )}
              </div>
              {currentSection && currentSection.topics.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentSection.topics.map(t => (
                    <button
                      key={t.id}
                      onClick={() => handleTopicClick(t.id)}
                      className="bg-white rounded-xl border shadow-sm p-4 text-left hover:border-primary hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all">
                          <Icon name="FileText" size={18} className="text-primary group-hover:text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-sm">{t.title}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {t.posts.length} {t.posts.length === 1 ? "запись" : t.posts.length < 5 ? "записи" : "записей"}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Контент темы */
            <div>
              {/* Хлебные крошки */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 print:hidden">
                <button onClick={() => setActiveTopic(null)} className="hover:text-primary transition-colors">
                  {currentSection?.title}
                </button>
                <Icon name="ChevronRight" size={13} />
                <span className="text-foreground font-medium">{currentTopic.title}</span>
              </div>

              {/* Заголовок */}
              <div className="bg-white rounded-xl border shadow-sm px-6 py-4 mb-4 flex items-center justify-between print:shadow-none print:border-0">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5 print:hidden">{currentSection?.title}</p>
                  <h2 className="text-xl font-bold text-primary">{currentTopic.title}</h2>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm border rounded-lg hover:bg-muted transition-colors print:hidden"
                >
                  <Icon name="Printer" size={15} />
                  Печать
                </button>
              </div>

              {/* Посты */}
              {currentTopic.posts.length === 0 ? (
                <div className="bg-white rounded-xl border shadow-sm p-10 text-center">
                  <Icon name="FileX" size={36} className="text-muted-foreground mx-auto mb-3" />
                  <p className="text-muted-foreground">В этой теме пока нет материалов</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {currentTopic.posts.map((post, idx) => (
                    <div key={post.id} className="bg-white rounded-xl border shadow-sm p-6 print:shadow-none print:border print:break-inside-avoid">
                      {currentTopic.posts.length > 1 && (
                        <div className="flex items-center gap-2 mb-3 pb-3 border-b text-xs text-muted-foreground print:hidden">
                          <span className="w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-[10px] font-bold">{idx + 1}</span>
                          Запись {idx + 1} из {currentTopic.posts.length}
                        </div>
                      )}
                      <div
                        className="prose prose-sm max-w-none leading-relaxed text-foreground
                          [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-primary [&_h2]:mt-4 [&_h2]:mb-2
                          [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1
                          [&_p]:my-1.5 [&_strong]:font-bold [&_em]:italic [&_u]:underline
                          [&_hr]:border-border [&_hr]:my-3
                          [&_img]:rounded-lg [&_img]:max-w-full [&_img]:shadow-sm [&_img]:my-2"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Навигация между темами */}
              {currentSection && currentSection.topics.length > 1 && (
                <div className="flex items-center justify-between mt-6 print:hidden">
                  {(() => {
                    const idx = currentSection.topics.findIndex(t => t.id === activeTopic);
                    const prev = idx > 0 ? currentSection.topics[idx - 1] : null;
                    const next = idx < currentSection.topics.length - 1 ? currentSection.topics[idx + 1] : null;
                    return (
                      <>
                        <div>
                          {prev && (
                            <button onClick={() => handleTopicClick(prev.id)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted text-sm transition-colors">
                              <Icon name="ChevronLeft" size={16} />
                              <span className="hidden sm:inline truncate max-w-[160px]">{prev.title}</span>
                              <span className="sm:hidden">Назад</span>
                            </button>
                          )}
                        </div>
                        <div>
                          {next && (
                            <button onClick={() => handleTopicClick(next.id)} className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-muted text-sm transition-colors">
                              <span className="hidden sm:inline truncate max-w-[160px]">{next.title}</span>
                              <span className="sm:hidden">Далее</span>
                              <Icon name="ChevronRight" size={16} />
                            </button>
                          )}
                        </div>
                      </>
                    );
                  })()}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Стили для печати */}
      <style>{`
        @media print {
          body { font-size: 12pt; }
          .print\\:hidden { display: none !important; }
          .print\\:break-inside-avoid { break-inside: avoid; }
          img { max-width: 100% !important; }
        }
      `}</style>
    </div>
  );
};

export default InfoWall;
