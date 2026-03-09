import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Icon from "@/components/ui/icon";

const API_AUTH = "https://functions.poehali.dev/b51b3f73-d83d-4a55-828e-5feec95d1227";
const API_GALLERY = "https://functions.poehali.dev/098df0dc-b5e2-4946-9f53-13b7fa2baecc";

interface GalleryImage {
  id: number;
  url: string;
  section?: number;
  sort_order: number;
}



// ── Слайдер (публичный режим) ────────────────────────────────────────────
function Slideshow({ section }: { section: number }) {
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [delay, setDelay] = useState(5);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch(`${API_GALLERY}?action=images&section=${section}`)
      .then((r) => r.json())
      .then((d) => {
        setImages(d.images || []);
        setDelay(d.slide_delay || 5);
        setLoading(false);
      });
  }, [section]);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % images.length);
  }, [images.length]);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return;
    timerRef.current = setTimeout(next, delay * 1000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [current, images.length, delay, next]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-white" />
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="fixed inset-0 bg-black flex items-center justify-center">
        <p className="text-white text-xl">Раздел {section} пуст</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black select-none">
      {images.map((img, i) => (
        <div
          key={img.id}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <img
            src={img.url}
            alt=""
            className="w-full h-full object-contain"
            draggable={false}
          />
        </div>
      ))}

      {images.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
          >
            <Icon name="ChevronLeft" size={28} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-3 transition-colors z-10"
          >
            <Icon name="ChevronRight" size={28} />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${i === current ? "bg-white" : "bg-white/40"}`}
              />
            ))}
          </div>
        </>
      )}

      <div className="absolute top-4 right-4 text-white/50 text-sm z-10">
        {current + 1} / {images.length} · задержка {delay}с
      </div>
    </div>
  );
}

// ── Форма входа ─────────────────────────────────────────────────────────
function LoginForm({ onLogin }: { onLogin: (user: { id: number; full_name: string }) => void }) {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(API_AUTH, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password, type: "admin" }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.setItem("gallery_admin", JSON.stringify(data.user));
        onLogin(data.user);
      } else {
        toast({ title: "Ошибка", description: data.error || "Неверные данные", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Нет соединения", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 mb-4">
            <Icon name="Images" size={28} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Галерея</h1>
          <p className="text-muted-foreground text-sm mt-1">Войдите для управления</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-card border rounded-xl p-6 shadow-sm">
          <div className="space-y-1.5">
            <Label htmlFor="login">Логин</Label>
            <Input id="login" value={login} onChange={(e) => setLogin(e.target.value)} required autoFocus />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Вход..." : "Войти"}
          </Button>
        </form>
      </div>
    </div>
  );
}

// ── Панель управления ────────────────────────────────────────────────────
function AdminPanel({ user }: { user: { id: number; full_name: string } }) {
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState(1);
  const [images, setImages] = useState<Record<number, GalleryImage[]>>({});
  const [settings, setSettings] = useState<Record<string, number>>({});
  const [uploading, setUploading] = useState(false);
  const [delayInput, setDelayInput] = useState<Record<number, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const adminId = user.id;

  const loadAll = useCallback(async () => {
    const res = await fetch(`${API_GALLERY}?action=all_images&admin_id=${adminId}`);
    const data = await res.json();
    const grouped: Record<number, GalleryImage[]> = {};
    for (let i = 1; i <= 9; i++) grouped[i] = [];
    (data.images || []).forEach((img: GalleryImage & { section: number }) => {
      if (!grouped[img.section]) grouped[img.section] = [];
      grouped[img.section].push(img);
    });
    setImages(grouped);
    setSettings(data.settings || {});
    const delays: Record<number, string> = {};
    for (let i = 1; i <= 9; i++) {
      delays[i] = String(data.settings?.[String(i)] ?? 5);
    }
    setDelayInput(delays);
  }, [adminId]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    let uploaded = 0;
    for (const file of Array.from(files)) {
      const reader = new FileReader();
      await new Promise<void>((resolve) => {
        reader.onload = async () => {
          const base64 = (reader.result as string).split(",")[1];
          const res = await fetch(`${API_GALLERY}?action=upload`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ admin_id: adminId, section: activeSection, image_data: base64, content_type: file.type }),
          });
          if (res.ok) uploaded++;
          resolve();
        };
        reader.readAsDataURL(file);
      });
    }
    await loadAll();
    setUploading(false);
    toast({ title: `Загружено ${uploaded} из ${files.length} фото` });
  };

  const handleReorder = async (fromIdx: number, toIdx: number) => {
    const imgs = [...(images[activeSection] || [])];
    if (toIdx < 0 || toIdx >= imgs.length) return;
    const [item] = imgs.splice(fromIdx, 1);
    imgs.splice(toIdx, 0, item);
    setImages((prev) => ({ ...prev, [activeSection]: imgs }));
    await fetch(`${API_GALLERY}?action=reorder`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId, ids: imgs.map((i) => i.id) }),
    });
  };

  const handleDelete = async (id: number) => {
    const res = await fetch(`${API_GALLERY}?action=delete&id=${id}&admin_id=${adminId}`, {
      method: "DELETE",
    });
    if (res.ok) {
      await loadAll();
      toast({ title: "Фото удалено" });
    }
  };

  const handleSaveDelay = async (section: number) => {
    const val = Math.max(1, Math.min(30, parseInt(delayInput[section] || "5") || 5));
    const res = await fetch(`${API_GALLERY}?action=set_delay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admin_id: adminId, section, delay: val }),
    });
    if (res.ok) {
      setSettings((s) => ({ ...s, [String(section)]: val }));
      toast({ title: `Задержка раздела ${section} — ${val} сек` });
    }
  };

  const logout = () => {
    localStorage.removeItem("gallery_admin");
    window.location.reload();
  };

  const sectionImages = images[activeSection] || [];
  const currentDelay = settings[String(activeSection)] ?? 5;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <Icon name="Images" size={20} className="text-primary" />
          <span className="font-semibold">Галерея</span>
          <span className="text-muted-foreground text-sm hidden sm:inline">· {user.full_name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`/gallery?section=${activeSection}`, "_blank")}
          >
            <Icon name="Play" size={14} className="mr-1" />
            Просмотр
          </Button>
          <Button variant="ghost" size="sm" onClick={logout}>
            <Icon name="LogOut" size={14} />
          </Button>
        </div>
      </header>

      <div className="flex flex-col md:flex-row h-[calc(100vh-57px)]">
        {/* Sidebar — разделы */}
        <aside className="md:w-52 border-b md:border-b-0 md:border-r bg-card flex md:flex-col flex-row overflow-x-auto md:overflow-y-auto shrink-0">
          <div className="p-2 w-full">
            <p className="text-xs text-muted-foreground uppercase tracking-wide px-2 py-1 hidden md:block">Разделы</p>
            <div className="flex md:flex-col flex-row gap-1">
              {Array.from({ length: 9 }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setActiveSection(n)}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors whitespace-nowrap
                    ${activeSection === n ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  <span>Раздел {n}</span>
                  <span className={`ml-2 text-xs rounded-full px-1.5 py-0.5 ${activeSection === n ? "bg-white/20" : "bg-muted"}`}>
                    {(images[n] || []).length}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-y-auto p-4">
          {/* Настройки раздела */}
          <div className="flex flex-wrap items-end gap-3 mb-5 p-4 bg-card border rounded-xl">
            <div className="flex-1 min-w-[180px]">
              <Label className="text-sm text-muted-foreground">
                Задержка слайдов, сек (сейчас: {currentDelay}с)
              </Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  type="number"
                  min={1}
                  max={30}
                  value={delayInput[activeSection] ?? currentDelay}
                  onChange={(e) => setDelayInput((d) => ({ ...d, [activeSection]: e.target.value }))}
                  className="w-24"
                />
                <Button variant="outline" size="sm" onClick={() => handleSaveDelay(activeSection)}>
                  Сохранить
                </Button>
              </div>
            </div>
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleUpload(e.target.files)}
              />
              <Button onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                <Icon name="Upload" size={15} className="mr-1.5" />
                {uploading ? "Загрузка..." : "Добавить фото"}
              </Button>
            </div>
          </div>

          {/* Сетка картинок */}
          {sectionImages.length === 0 ? (
            <div
              className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer hover:border-primary transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Icon name="ImagePlus" size={36} className="mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">Нет фото — нажмите, чтобы добавить</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {sectionImages.map((img, idx) => (
                <div key={img.id} className="group relative aspect-square rounded-lg overflow-hidden border bg-muted">
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors" />
                  {/* Позиция */}
                  <div className="absolute top-1.5 left-1.5 bg-black/50 text-white text-xs rounded px-1.5 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {idx + 1} / {sectionImages.length}
                  </div>
                  {/* Кнопки перемещения */}
                  <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleReorder(idx, idx - 1)}
                      disabled={idx === 0}
                      className="bg-white/80 hover:bg-white disabled:opacity-30 rounded-full p-1 transition-colors"
                      title="Назад"
                    >
                      <Icon name="ChevronLeft" size={16} />
                    </button>
                    <button
                      onClick={() => handleReorder(idx, idx + 1)}
                      disabled={idx === sectionImages.length - 1}
                      className="bg-white/80 hover:bg-white disabled:opacity-30 rounded-full p-1 transition-colors"
                      title="Вперёд"
                    >
                      <Icon name="ChevronRight" size={16} />
                    </button>
                  </div>
                  {/* Кнопки в начало/конец + удалить */}
                  <div className="absolute inset-x-0 bottom-1.5 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleReorder(idx, 0)}
                      disabled={idx === 0}
                      className="bg-white/80 hover:bg-white disabled:opacity-30 rounded-full p-1 transition-colors"
                      title="В начало"
                    >
                      <Icon name="ChevronsLeft" size={14} />
                    </button>
                    <button
                      onClick={() => handleReorder(idx, sectionImages.length - 1)}
                      disabled={idx === sectionImages.length - 1}
                      className="bg-white/80 hover:bg-white disabled:opacity-30 rounded-full p-1 transition-colors"
                      title="В конец"
                    >
                      <Icon name="ChevronsRight" size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(img.id)}
                      className="bg-destructive/90 hover:bg-destructive text-white rounded-full p-1 transition-colors"
                      title="Удалить"
                    >
                      <Icon name="Trash2" size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <div
                className="aspect-square rounded-lg border-2 border-dashed flex items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="Plus" size={24} className="text-muted-foreground" />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────
export default function Gallery() {
  const [searchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");

  const [user, setUser] = useState<{ id: number; full_name: string } | null>(null);

  useEffect(() => {
    if (sectionParam) return;
    const saved = localStorage.getItem("gallery_admin");
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch { /* ignore */ }
    }
  }, [sectionParam]);

  if (sectionParam) {
    const n = parseInt(sectionParam);
    if (n >= 1 && n <= 9) return <Slideshow section={n} />;
  }

  if (!user) return <LoginForm onLogin={setUser} />;
  return <AdminPanel user={user} />;
}