import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from "xlsx";

const SMS_VERIFY_URL = "https://functions.poehali.dev/7ea5c6f5-d200-4cc0-b34b-10144a995d69";
const APPOINTMENTS_URL = "https://functions.poehali.dev/b3b698ed-7035-4503-8c49-85be11de75e5";

interface Appointment {
  id: number;
  patient_name: string;
  patient_phone: string;
  appointment_date: string;
  appointment_time: string;
  description: string;
  status: string;
  created_at: string;
  created_by: string;
  doctor_name: string;
  doctor_specialization: string;
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

function getStatusLabel(status: string) {
  const map: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
    scheduled: { label: "Запланирован", variant: "default" },
    completed: { label: "Завершён", variant: "secondary" },
    cancelled: { label: "Отменён", variant: "destructive" },
  };
  return map[status] || { label: status, variant: "outline" };
}

export default function MyAppointmentsDialog() {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"phone" | "code" | "results">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const printRef = useRef<HTMLDivElement>(null);

  function resetDialog() {
    setStep("phone");
    setPhone("");
    setCode("");
    setAppointments([]);
    setPage(1);
  }

  async function handleSendCode(e: React.FormEvent) {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(SMS_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone_number: phone.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        toast({ title: "Код отправлен в MAX", description: `Проверьте мессенджер MAX на номере ${phone}`, duration: 10000 });
        setStep("code");
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось отправить код", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function handleVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(SMS_VERIFY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone_number: phone.trim(), code: code.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        await loadAppointments();
      } else {
        toast({ title: "Неверный код", description: data.error || "Проверьте код и попробуйте снова", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function loadAppointments() {
    setLoading(true);
    try {
      const encoded = encodeURIComponent(phone.trim());
      const res = await fetch(`${APPOINTMENTS_URL}?action=my-appointments&phone=${encoded}`);
      const data = await res.json();
      if (res.ok) {
        setAppointments(data.appointments || []);
        setStep("results");
      } else {
        toast({ title: "Ошибка", description: data.error || "Не удалось загрузить записи", variant: "destructive" });
      }
    } catch {
      toast({ title: "Ошибка", description: "Проблема с подключением", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  function handlePrint() {
    const printContents = printRef.current?.innerHTML;
    if (!printContents) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html>
        <head>
          <title>Мои записи на приём</title>
          <style>
            body { font-family: Arial, sans-serif; font-size: 12px; padding: 20px; }
            h2 { margin-bottom: 16px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
            th { background: #f0f0f0; font-weight: bold; }
            tr:nth-child(even) { background: #fafafa; }
            .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; }
            .badge-scheduled { background: #dbeafe; color: #1d4ed8; }
            .badge-completed { background: #dcfce7; color: #166534; }
            .badge-cancelled { background: #fee2e2; color: #991b1b; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    win.document.close();
    win.print();
  }

  function handleExcelExport() {
    const rows = appointments.map((a) => ({
      "ФИО пациента": a.patient_name,
      "Телефон": a.patient_phone,
      "Дата создания": formatDateTime(a.created_at),
      "Кем записан": a.created_by,
      "Дата приёма": formatDate(a.appointment_date),
      "Время приёма": a.appointment_time || "—",
      "ФИО врача": a.doctor_name,
      "Специализация": a.doctor_specialization,
      "Описание проблемы": a.description,
      "Статус": getStatusLabel(a.status).label,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Записи");
    ws["!cols"] = [
      { wch: 30 }, { wch: 16 }, { wch: 18 }, { wch: 18 },
      { wch: 14 }, { wch: 10 }, { wch: 30 }, { wch: 22 },
      { wch: 40 }, { wch: 14 },
    ];
    XLSX.writeFile(wb, `Мои_записи_${phone.replace(/\D/g, "")}.xlsx`);
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetDialog(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full justify-start gap-3">
          <Icon name="CalendarSearch" size={20} />
          Просмотреть свои записи
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-16px)] max-w-6xl max-h-[92vh] overflow-y-auto p-4">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Icon name="CalendarSearch" size={18} className="text-primary" />
            Мои записи на приём
          </DialogTitle>
        </DialogHeader>

        {step === "phone" && (
          <form onSubmit={handleSendCode} className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Введите ваш номер телефона. Мы отправим код подтверждения в мессенджер MAX.
            </p>
            <div className="space-y-2">
              <label className="text-sm font-medium">Номер телефона</label>
              <Input
                type="tel"
                placeholder="+7 (999) 000-00-00"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading || !phone.trim()}>
              {loading ? (
                <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Отправка...</>
              ) : (
                <><Icon name="MessageCircle" size={16} className="mr-2" />Получить код в MAX</>
              )}
            </Button>
          </form>
        )}

        {step === "code" && (
          <form onSubmit={handleVerifyCode} className="space-y-4 mt-2">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              Код подтверждения отправлен в мессенджер MAX на номер <strong>{phone}</strong>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Код подтверждения</label>
              <Input
                type="text"
                placeholder="Введите 6-значный код"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                maxLength={6}
                required
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setStep("phone")}>
                Назад
              </Button>
              <Button type="submit" className="flex-1" disabled={loading || code.length < 4}>
                {loading ? (
                  <><Icon name="Loader2" size={16} className="animate-spin mr-2" />Проверка...</>
                ) : (
                  <><Icon name="ShieldCheck" size={16} className="mr-2" />Подтвердить</>
                )}
              </Button>
            </div>
          </form>
        )}

        {step === "results" && (
          <div className="space-y-3 mt-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs text-muted-foreground flex-1 min-w-0">
                Найдено записей: <strong>{appointments.length}</strong> для номера {phone}
              </p>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={resetDialog}>
                  <Icon name="ArrowLeft" size={13} className="mr-1" />
                  Другой номер
                </Button>
                {appointments.length > 0 && (
                  <>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handlePrint}>
                      <Icon name="Printer" size={13} className="mr-1" />
                      Печать
                    </Button>
                    <Button variant="outline" size="sm" className="h-7 text-xs px-2" onClick={handleExcelExport}>
                      <Icon name="FileSpreadsheet" size={13} className="mr-1" />
                      Excel
                    </Button>
                  </>
                )}
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground">
                <Icon name="CalendarX" size={40} className="mx-auto mb-2 opacity-40" />
                <p className="text-sm">Записи не найдены для указанного номера</p>
              </div>
            ) : (() => {
              const totalPages = Math.ceil(appointments.length / pageSize);
              const paginated = appointments.slice((page - 1) * pageSize, page * pageSize);
              return (
                <>
                  <div ref={printRef}>
                    <h2 className="text-base font-semibold mb-2 print:block hidden">
                      Мои записи на приём — {phone}
                    </h2>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse" style={{ fontSize: "11px" }}>
                        <thead>
                          <tr className="bg-muted">
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">ФИО</th>
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">Дата создания</th>
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">Кем записан</th>
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">Дата приёма</th>
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">Время</th>
                            <th className="border px-2 py-1.5 text-left font-semibold">Врач</th>
                            <th className="border px-2 py-1.5 text-left font-semibold">Описание</th>
                            <th className="border px-2 py-1.5 text-left font-semibold whitespace-nowrap">Статус</th>
                          </tr>
                        </thead>
                        <tbody>
                          {paginated.map((a) => {
                            const statusInfo = getStatusLabel(a.status);
                            return (
                              <tr key={a.id} className="hover:bg-muted/40">
                                <td className="border px-2 py-1 whitespace-nowrap">{a.patient_name || "—"}</td>
                                <td className="border px-2 py-1 whitespace-nowrap text-muted-foreground">{formatDateTime(a.created_at)}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">{a.created_by || "—"}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">{formatDate(a.appointment_date)}</td>
                                <td className="border px-2 py-1 whitespace-nowrap">{a.appointment_time || "—"}</td>
                                <td className="border px-2 py-1" style={{ maxWidth: "160px" }}>
                                  <div className="font-medium leading-tight">{a.doctor_name || "—"}</div>
                                  {a.doctor_specialization && (
                                    <div className="text-muted-foreground leading-tight mt-0.5" style={{ fontSize: "10px" }}>{a.doctor_specialization}</div>
                                  )}
                                </td>
                                <td className="border px-2 py-1" style={{ maxWidth: "120px" }}>
                                  <span className="text-muted-foreground">{a.description || "—"}</span>
                                </td>
                                <td className="border px-2 py-1 whitespace-nowrap">
                                  <Badge variant={statusInfo.variant} className="text-[10px] px-1.5 py-0">{statusInfo.label}</Badge>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="flex items-center justify-between gap-2 flex-wrap pt-1 border-t">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span>Строк на странице:</span>
                      {[10, 20, 50, 100].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => { setPageSize(n); setPage(1); }}
                          className={`px-2 py-0.5 rounded border text-xs transition-colors ${pageSize === n ? "bg-primary text-white border-primary" : "border-border hover:bg-muted"}`}
                        >
                          {n}
                        </button>
                      ))}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage(1)}
                        className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-40 hover:bg-muted"
                      >
                        <Icon name="ChevronsLeft" size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={page === 1}
                        onClick={() => setPage(p => p - 1)}
                        className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-40 hover:bg-muted"
                      >
                        <Icon name="ChevronLeft" size={13} />
                      </button>
                      <span className="text-xs px-2 text-muted-foreground">
                        {page} / {totalPages}
                      </span>
                      <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage(p => p + 1)}
                        className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-40 hover:bg-muted"
                      >
                        <Icon name="ChevronRight" size={13} />
                      </button>
                      <button
                        type="button"
                        disabled={page === totalPages}
                        onClick={() => setPage(totalPages)}
                        className="h-7 w-7 flex items-center justify-center rounded border text-xs disabled:opacity-40 hover:bg-muted"
                      >
                        <Icon name="ChevronsRight" size={13} />
                      </button>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}