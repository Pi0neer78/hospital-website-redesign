/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Icon from "@/components/ui/icon";

const URLS = {
  doctors: "https://functions.poehali.dev/68f877b2-aeda-437a-ad67-925a3414d688",
  schedules: "https://functions.poehali.dev/6f53f66d-3e47-4e57-93dd-52d63c16d38f",
  appointments: "https://functions.poehali.dev/b3b698ed-7035-4503-8c49-85be11de75e5",
  kiosk: "https://functions.poehali.dev/b50cadb6-0890-4347-9f5e-608d8f243f9d",
};

const CLINICS: Record<string, string> = {
  "1": "Центральная городская поликлиника",
  "2": "Детская городская поликлиника",
};

type KioskStep =
  | "home"
  | "instruction"
  | "doctors"
  | "dates"
  | "slots"
  | "form"
  | "ticket"
  | "cancel";

const RU_ROWS = [
  ["й","ц","у","к","е","н","г","ш","щ","з","х","ъ"],
  ["ф","ы","в","а","п","р","о","л","д","ж","э"],
  ["я","ч","с","м","и","т","ь","б","ю","."],
];
const NUM_ROW = ["1","2","3","4","5","6","7","8","9","0"];
const SPEC_ROW = ["-","(",")","+"," "];

function VirtualKeyboard({
  onKey,
  onBackspace,
  onClose,
}: {
  onKey: (k: string) => void;
  onBackspace: () => void;
  onClose: () => void;
}) {
  const [caps, setCaps] = useState(false);
  const [numMode, setNumMode] = useState(false);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-blue-600 p-3 z-50 select-none">
      {!numMode ? (
        <>
          <div className="flex justify-center gap-1 mb-1">
            {NUM_ROW.map((k) => (
              <button key={k} onClick={() => onKey(k)}
                className="bg-gray-700 text-white rounded px-3 py-2 text-lg font-bold hover:bg-blue-600 active:scale-95 transition-transform min-w-[40px]">
                {k}
              </button>
            ))}
            <button onClick={() => onKey("-")}
              className="bg-gray-700 text-white rounded px-3 py-2 text-lg font-bold hover:bg-blue-600 active:scale-95 min-w-[40px]">-</button>
          </div>
          {RU_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1 mb-1">
              {ri === 2 && (
                <button onClick={() => setCaps(!caps)}
                  className={`rounded px-3 py-2 text-sm font-bold transition-all min-w-[60px] ${caps ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                  ⇧
                </button>
              )}
              {row.map((k) => (
                <button key={k} onClick={() => onKey(caps ? k.toUpperCase() : k)}
                  className="bg-gray-700 text-white rounded px-3 py-2 text-lg hover:bg-blue-600 active:scale-95 transition-transform min-w-[40px]">
                  {caps ? k.toUpperCase() : k}
                </button>
              ))}
              {ri === 2 && (
                <button onClick={onBackspace}
                  className="bg-red-700 text-white rounded px-3 py-2 text-sm font-bold hover:bg-red-500 active:scale-95 min-w-[60px]">
                  ⌫
                </button>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="flex justify-center gap-2 mb-2 flex-wrap">
          {["0","1","2","3","4","5","6","7","8","9","+","-","(",")"," "].map((k) => (
            <button key={k} onClick={() => onKey(k)}
              className="bg-gray-700 text-white rounded px-4 py-3 text-xl font-bold hover:bg-blue-600 active:scale-95 transition-transform min-w-[50px]">
              {k === " " ? "␣" : k}
            </button>
          ))}
          <button onClick={onBackspace}
            className="bg-red-700 text-white rounded px-4 py-3 text-xl font-bold hover:bg-red-500 active:scale-95 min-w-[60px]">
            ⌫
          </button>
        </div>
      )}
      <div className="flex justify-center gap-2 mt-1">
        <button onClick={() => setNumMode(!numMode)}
          className="bg-gray-600 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-gray-500">
          {numMode ? "🔤 Буквы" : "🔢 Цифры"}
        </button>
        <button onClick={() => onKey(" ")}
          className="bg-gray-700 text-white rounded px-16 py-2 text-sm hover:bg-blue-600">
          ПРОБЕЛ
        </button>
        <button onClick={onClose}
          className="bg-green-700 text-white rounded px-4 py-2 text-sm font-semibold hover:bg-green-600">
          ✓ Готово
        </button>
      </div>
    </div>
  );
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "numeric", month: "long", weekday: "short" });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function getDatesRange(days = 14): string[] {
  const res: string[] = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(now.getDate() + i);
    res.push(d.toISOString().slice(0, 10));
  }
  return res;
}

export default function Kiosk() {
  const [searchParams] = useSearchParams();
  const kioskId = searchParams.get("id") || "1";
  const clinicName = CLINICS[kioskId] || CLINICS["2"];

  const [step, setStep] = useState<KioskStep>("home");
  const [doctors, setDoctors] = useState<any[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null);
  const [bulkSlots, setBulkSlots] = useState<Record<string, any>>({});
  const [selectedDate, setSelectedDate] = useState("");
  const [timeSlots, setTimeSlots] = useState<any[]>([]);
  const [selectedTime, setSelectedTime] = useState("");
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingTimes, setLoadingTimes] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    patient_name: "",
    patient_phone: "",
    patient_snils: "",
    patient_oms: "",
    description: "",
  });
  const [focusedField, setFocusedField] = useState<keyof typeof form | null>(null);
  const [showKeyboard, setShowKeyboard] = useState(false);

  const [ticket, setTicket] = useState<any>(null);
  const [countdown, setCountdown] = useState(30);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [cancelCode, setCancelCode] = useState("");
  const [cancelResult, setCancelResult] = useState<any>(null);
  const [cancelError, setCancelError] = useState("");
  const [focusedCancel, setFocusedCancel] = useState(false);

  const dates = getDatesRange(14);

  useEffect(() => {
    if (step === "ticket") {
      setCountdown(30);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current!);
            setStep("home");
            setTicket(null);
            resetAll();
            return 0;
          }
          return c - 1;
        });
      }, 1000);
      return () => clearInterval(countdownRef.current!);
    }
  }, [step]);

  function resetAll() {
    setSelectedDoctor(null);
    setSelectedDate("");
    setSelectedTime("");
    setBulkSlots({});
    setTimeSlots([]);
    setForm({ patient_name: "", patient_phone: "", patient_snils: "", patient_oms: "", description: "" });
    setFocusedField(null);
    setShowKeyboard(false);
    setCancelCode("");
    setCancelResult(null);
    setCancelError("");
  }

  async function loadDoctors() {
    setLoadingDoctors(true);
    try {
      const r = await fetch(URLS.doctors);
      const data = await r.json();
      const all: any[] = data.doctors || [];
      setDoctors(all.filter((d: any) => d.is_active && d.clinic === clinicName));
    } finally {
      setLoadingDoctors(false);
    }
  }

  async function loadBulkSlots(doctorId: number) {
    setLoadingSlots(true);
    try {
      const start = dates[0];
      const end = dates[dates.length - 1];
      const r = await fetch(
        `${URLS.appointments}?action=available-slots-bulk&doctor_id=${doctorId}&start_date=${start}&end_date=${end}`
      );
      const data = await r.json();
      setBulkSlots(data.slots_by_date || {});
    } finally {
      setLoadingSlots(false);
    }
  }

  async function loadTimeSlots(doctorId: number, date: string) {
    setLoadingTimes(true);
    try {
      const r = await fetch(
        `${URLS.appointments}?action=available-slots&doctor_id=${doctorId}&date=${date}`
      );
      const data = await r.json();
      if (data.all_slots && data.all_slots.length > 0) {
        setTimeSlots(data.all_slots);
      } else if (data.available_slots) {
        setTimeSlots(data.available_slots.map((t: string) => ({ time: t, status: "available", available: true })));
      } else {
        setTimeSlots([]);
      }
    } finally {
      setLoadingTimes(false);
    }
  }

  function handleDoctorSelect(doc: any) {
    setSelectedDoctor(doc);
    loadBulkSlots(doc.id);
    setStep("dates");
  }

  function handleDateSelect(date: string) {
    const info = bulkSlots[date];
    if (!info || info.available_slots?.length === 0) return;
    setSelectedDate(date);
    loadTimeSlots(selectedDoctor.id, date);
    setStep("slots");
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep("form");
  }

  function handleKey(k: string) {
    if (!focusedField) return;
    setForm((f) => ({ ...f, [focusedField]: f[focusedField] + k }));
  }

  function handleBackspace() {
    if (!focusedField) return;
    setForm((f) => ({ ...f, [focusedField]: f[focusedField].slice(0, -1) }));
  }

  function handleFieldFocus(field: keyof typeof form) {
    setFocusedField(field);
    setShowKeyboard(true);
  }

  async function handleSubmit() {
    if (!form.patient_name.trim() || !form.patient_phone.trim()) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${URLS.kiosk}?action=create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctor_id: selectedDoctor.id,
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          patient_snils: form.patient_snils,
          patient_oms: form.patient_oms,
          appointment_date: selectedDate,
          appointment_time: selectedTime,
          description: form.description,
        }),
      });
      const data = await r.json();
      if (data.success) {
        setTicket({
          ...data,
          doctor: selectedDoctor,
          date: selectedDate,
          time: selectedTime,
          patient_name: form.patient_name,
          patient_phone: form.patient_phone,
          patient_snils: form.patient_snils,
          patient_oms: form.patient_oms,
          description: form.description,
        });
        setStep("ticket");
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCancel() {
    if (cancelCode.length !== 10) {
      setCancelError("Введите 10-значный код");
      return;
    }
    const r = await fetch(`${URLS.kiosk}?action=cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: cancelCode }),
    });
    const data = await r.json();
    if (data.success) {
      setCancelResult(data);
      setCancelError("");
    } else {
      setCancelError(data.error || "Ошибка");
    }
  }

  function printTicket() {
    window.print();
  }

  const headerBg = "bg-red-700";

  return (
    <div className="min-h-screen bg-white flex flex-col" style={{ fontFamily: "'Arial', sans-serif" }}>
      {/* HEADER */}
      <div className={`${headerBg} text-white text-center py-6 px-4 shadow-lg`}>
        <div className="text-4xl font-black tracking-widest uppercase mb-1">
          ЭЛЕКТРОННАЯ ОЧЕРЕДЬ
        </div>
        <div className="text-2xl font-semibold opacity-90">{clinicName}</div>
      </div>

      {/* HOME */}
      {step === "home" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <KioskButton icon="BookOpen" label="ИНСТРУКЦИЯ" color="blue" onClick={() => setStep("instruction")} />
          <KioskButton
            icon="CalendarPlus"
            label="ЗАПИСАТЬСЯ НА ПРИЁМ"
            color="green"
            onClick={() => { loadDoctors(); setStep("doctors"); }}
          />
          <KioskButton icon="CalendarX" label="ОТМЕНИТЬ ЗАПИСЬ" color="red" onClick={() => { resetAll(); setStep("cancel"); }} />
        </div>
      )}

      {/* INSTRUCTION */}
      {step === "instruction" && (
        <div className="flex-1 flex flex-col items-center p-8 max-w-3xl mx-auto w-full">
          <h2 className="text-3xl font-bold text-gray-800 mb-6">Инструкция по записи</h2>
          <div className="space-y-4 text-xl text-gray-700 w-full">
            {[
              "1. Нажмите «ЗАПИСАТЬСЯ НА ПРИЁМ»",
              "2. Выберите врача из списка",
              "3. Выберите удобную дату (ближайшие 14 дней)",
              "4. Выберите свободное время приёма",
              "5. Введите ваши данные: ФИО, телефон, СНИЛС, ОМС",
              "6. Нажмите «Выполнить запись»",
              "7. Получите талон и сохраните 10-значный код",
              "8. Код используется для отмены записи",
            ].map((t) => (
              <div key={t} className="bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500">{t}</div>
            ))}
          </div>
          <button onClick={() => setStep("home")}
            className="mt-8 bg-gray-700 text-white text-2xl font-bold px-10 py-4 rounded-2xl hover:bg-gray-600 active:scale-95 transition-all">
            ← НАЗАД
          </button>
        </div>
      )}

      {/* DOCTORS */}
      {step === "doctors" && (
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-800">Выберите врача</h2>
            <button onClick={() => setStep("home")}
              className="bg-gray-200 text-gray-700 text-xl font-bold px-6 py-3 rounded-xl hover:bg-gray-300">
              ← НАЗАД
            </button>
          </div>
          {loadingDoctors ? (
            <div className="flex justify-center items-center h-48 text-2xl text-gray-500">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-3 gap-5">
              {doctors.map((doc) => (
                <button key={doc.id}
                  onClick={() => handleDoctorSelect(doc)}
                  className="bg-white border-2 border-gray-200 rounded-2xl p-4 hover:border-blue-500 hover:shadow-xl active:scale-95 transition-all text-left flex flex-col items-center gap-3">
                  <img
                    src={doc.photo_url || "https://placehold.co/120x120?text=Фото"}
                    alt={doc.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
                  />
                  <div className="text-center">
                    <div className="font-bold text-gray-900 text-lg leading-tight">{doc.full_name}</div>
                    <div className="text-blue-600 font-semibold mt-1">{doc.position}</div>
                    {doc.specialization && <div className="text-gray-500 text-sm mt-1">{doc.specialization}</div>}
                    {doc.work_experience > 0 && <div className="text-gray-400 text-sm">Стаж: {doc.work_experience} лет</div>}
                    {doc.office_number && <div className="text-gray-500 text-sm">Каб. {doc.office_number}</div>}
                  </div>
                </button>
              ))}
              {doctors.length === 0 && (
                <div className="col-span-3 text-center text-2xl text-gray-500 py-16">
                  Нет доступных врачей
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* DATES */}
      {step === "dates" && selectedDoctor && (
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Выберите дату</h2>
              <div className="text-xl text-blue-600 font-semibold">{selectedDoctor.full_name}</div>
            </div>
            <button onClick={() => setStep("doctors")}
              className="bg-gray-200 text-gray-700 text-xl font-bold px-6 py-3 rounded-xl hover:bg-gray-300">
              ← НАЗАД
            </button>
          </div>
          {loadingSlots ? (
            <div className="flex justify-center items-center h-48 text-2xl text-gray-500">Загрузка слотов...</div>
          ) : (
            <div className="grid grid-cols-7 gap-3">
              {dates.map((date) => {
                const info = bulkSlots[date];
                const available = info?.available_slots?.length || 0;
                const booked = info?.booked_slots || 0;
                const total = available + booked;
                const disabled = available === 0;
                return (
                  <button
                    key={date}
                    disabled={disabled}
                    onClick={() => handleDateSelect(date)}
                    className={`rounded-2xl p-3 border-2 flex flex-col items-center transition-all
                      ${disabled
                        ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                        : "bg-white border-green-400 hover:bg-green-50 hover:shadow-lg active:scale-95 cursor-pointer"
                      }`}>
                    <div className="text-sm font-semibold text-gray-500">{formatDate(date)}</div>
                    {total > 0 ? (
                      <>
                        <div className={`text-2xl font-black mt-1 ${disabled ? "text-gray-400" : "text-green-600"}`}>
                          {available}
                        </div>
                        <div className="text-xs text-gray-500">из {total}</div>
                        <div className="text-xs mt-1">{disabled ? "нет мест" : "свободно"}</div>
                      </>
                    ) : (
                      <div className="text-sm text-gray-400 mt-2">нет приёма</div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TIME SLOTS */}
      {step === "slots" && selectedDoctor && selectedDate && (
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Выберите время</h2>
              <div className="text-xl text-blue-600">{selectedDoctor.full_name} · {formatDateShort(selectedDate)}</div>
            </div>
            <button onClick={() => setStep("dates")}
              className="bg-gray-200 text-gray-700 text-xl font-bold px-6 py-3 rounded-xl hover:bg-gray-300">
              ← НАЗАД
            </button>
          </div>
          {loadingTimes ? (
            <div className="flex justify-center items-center h-48 text-2xl text-gray-500">Загрузка...</div>
          ) : (
            <div className="grid grid-cols-6 gap-3">
              {timeSlots.map((slot) => {
                const avail = slot.available !== false && slot.status !== "booked" && slot.status !== "break";
                return (
                  <button
                    key={slot.time}
                    disabled={!avail}
                    onClick={() => avail && handleTimeSelect(slot.time)}
                    className={`rounded-2xl py-4 text-2xl font-bold border-2 transition-all
                      ${!avail
                        ? slot.status === "break"
                          ? "bg-yellow-50 border-yellow-200 text-yellow-400 cursor-not-allowed"
                          : "bg-red-50 border-red-200 text-red-300 cursor-not-allowed"
                        : "bg-white border-green-400 hover:bg-green-500 hover:text-white hover:shadow-lg active:scale-95"
                      }`}>
                    {slot.time}
                    {slot.status === "break" && <div className="text-xs font-normal">перерыв</div>}
                    {slot.status === "booked" && <div className="text-xs font-normal">занято</div>}
                  </button>
                );
              })}
              {timeSlots.length === 0 && (
                <div className="col-span-6 text-center text-2xl text-gray-500 py-16">Нет доступных слотов</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* FORM */}
      {step === "form" && (
        <div className={`flex-1 p-6 ${showKeyboard ? "pb-72" : ""}`}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Введите данные</h2>
              <div className="text-lg text-blue-600">{selectedDoctor?.full_name} · {formatDateShort(selectedDate)} · {selectedTime}</div>
            </div>
            <button onClick={() => setStep("slots")}
              className="bg-gray-200 text-gray-700 text-xl font-bold px-6 py-3 rounded-xl hover:bg-gray-300">
              ← НАЗАД
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4 max-w-3xl">
            {([
              { field: "patient_name", label: "ФИО *", placeholder: "Иванов Иван Иванович" },
              { field: "patient_phone", label: "Телефон *", placeholder: "+7 (___) ___-__-__" },
              { field: "patient_snils", label: "СНИЛС", placeholder: "000-000-000 00" },
              { field: "patient_oms", label: "Полис ОМС", placeholder: "16 цифр" },
            ] as { field: keyof typeof form; label: string; placeholder: string }[]).map(({ field, label, placeholder }) => (
              <div key={field}>
                <label className="block text-lg font-semibold text-gray-700 mb-1">{label}</label>
                <input
                  readOnly
                  value={form[field]}
                  onFocus={() => handleFieldFocus(field)}
                  onClick={() => handleFieldFocus(field)}
                  placeholder={placeholder}
                  className={`w-full border-2 rounded-xl px-4 py-3 text-xl cursor-pointer focus:outline-none transition-colors
                    ${focusedField === field ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
                />
              </div>
            ))}
            <div className="col-span-2">
              <label className="block text-lg font-semibold text-gray-700 mb-1">Описание жалобы</label>
              <textarea
                readOnly
                value={form.description}
                onClick={() => handleFieldFocus("description")}
                onFocus={() => handleFieldFocus("description")}
                placeholder="Опишите причину обращения"
                rows={3}
                className={`w-full border-2 rounded-xl px-4 py-3 text-xl cursor-pointer focus:outline-none resize-none transition-colors
                  ${focusedField === "description" ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"}`}
              />
            </div>
          </div>
          <div className="flex gap-4 mt-6">
            <button
              disabled={!form.patient_name.trim() || !form.patient_phone.trim() || submitting}
              onClick={handleSubmit}
              className="bg-green-600 disabled:bg-gray-300 text-white text-2xl font-bold px-10 py-4 rounded-2xl hover:bg-green-500 active:scale-95 transition-all">
              {submitting ? "Записываю..." : "✓ ВЫПОЛНИТЬ ЗАПИСЬ"}
            </button>
            <button onClick={() => { setStep("home"); resetAll(); }}
              className="bg-gray-200 text-gray-700 text-2xl font-bold px-10 py-4 rounded-2xl hover:bg-gray-300 active:scale-95 transition-all">
              ✗ ОТМЕНА
            </button>
          </div>
          {showKeyboard && (
            <VirtualKeyboard
              onKey={handleKey}
              onBackspace={handleBackspace}
              onClose={() => setShowKeyboard(false)}
            />
          )}
        </div>
      )}

      {/* TICKET */}
      {step === "ticket" && ticket && (
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <div className="bg-white border-4 border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl ticket-print" id="ticket">
            <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Талон на приём</div>
              <div className="text-xl font-black text-gray-900 mt-1">{clinicName}</div>
            </div>
            <div className="space-y-2 text-base">
              <TicketRow label="Врач" value={ticket.doctor.full_name} />
              <TicketRow label="Специализация" value={ticket.doctor.position} />
              {ticket.doctor.office_number && <TicketRow label="Кабинет" value={`№ ${ticket.doctor.office_number}`} />}
              <TicketRow label="Дата" value={formatDateShort(ticket.date)} />
              <TicketRow label="Время" value={ticket.time} />
              <div className="border-t border-dashed border-gray-300 my-2" />
              <TicketRow label="Пациент" value={ticket.patient_name} />
              <TicketRow label="Телефон" value={ticket.patient_phone} />
              {ticket.patient_snils && <TicketRow label="СНИЛС" value={ticket.patient_snils} />}
              {ticket.patient_oms && <TicketRow label="ОМС" value={ticket.patient_oms} />}
              {ticket.description && <TicketRow label="Жалоба" value={ticket.description} />}
              <div className="border-t-2 border-dashed border-gray-400 my-3" />
              <div className="text-center">
                <div className="text-sm text-gray-500 mb-1">Код для отмены записи:</div>
                <div className="text-4xl font-black tracking-[0.3em] text-red-700 font-mono">{ticket.code}</div>
                <div className="text-xs text-gray-400 mt-1">Сохраните этот код!</div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-3 border-t border-dashed pt-2">
                Выдан: {new Date().toLocaleString("ru-RU")}
              </div>
            </div>
          </div>

          <button onClick={printTicket}
            className="mt-4 bg-blue-700 text-white text-xl font-bold px-8 py-3 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all print:hidden">
            🖨 РАСПЕЧАТАТЬ ТАЛОН
          </button>

          <div className="mt-6 text-center print:hidden">
            <div className="text-xl text-gray-600 mb-2">Возврат на главную через:</div>
            <div className="text-6xl font-black text-red-600">{countdown}</div>
            <div className="text-gray-500">секунд</div>
            <button onClick={() => { clearInterval(countdownRef.current!); setStep("home"); resetAll(); }}
              className="mt-4 bg-gray-700 text-white text-lg font-bold px-8 py-3 rounded-2xl hover:bg-gray-600 active:scale-95 transition-all">
              НА ГЛАВНУЮ
            </button>
          </div>
        </div>
      )}

      {/* CANCEL */}
      {step === "cancel" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-8">Отмена записи</h2>
          {!cancelResult ? (
            <div className={`w-full max-w-md ${focusedCancel ? "pb-72" : ""}`}>
              <label className="block text-xl font-semibold text-gray-700 mb-2">Введите 10-значный код с талона:</label>
              <input
                readOnly
                value={cancelCode}
                onClick={() => setFocusedCancel(true)}
                onFocus={() => setFocusedCancel(true)}
                placeholder="0000000000"
                className={`w-full border-2 rounded-xl px-4 py-4 text-4xl font-mono text-center tracking-widest focus:outline-none transition-colors
                  ${focusedCancel ? "border-blue-500 bg-blue-50" : "border-gray-300"}`}
              />
              {cancelError && <div className="text-red-600 text-lg mt-2 text-center">{cancelError}</div>}
              <div className="flex gap-4 mt-6">
                <button onClick={handleCancel}
                  className="flex-1 bg-red-600 text-white text-2xl font-bold py-4 rounded-2xl hover:bg-red-500 active:scale-95 transition-all">
                  ОТМЕНИТЬ ЗАПИСЬ
                </button>
                <button onClick={() => { setStep("home"); resetAll(); }}
                  className="bg-gray-200 text-gray-700 text-2xl font-bold px-6 py-4 rounded-2xl hover:bg-gray-300">
                  ← НАЗАД
                </button>
              </div>
              {focusedCancel && (
                <VirtualKeyboard
                  onKey={(k) => { if (/\d/.test(k) && cancelCode.length < 10) setCancelCode((c) => c + k); }}
                  onBackspace={() => setCancelCode((c) => c.slice(0, -1))}
                  onClose={() => setFocusedCancel(false)}
                />
              )}
            </div>
          ) : (
            <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-8 max-w-md w-full text-center">
              <div className="text-5xl mb-4">✅</div>
              <div className="text-2xl font-bold text-green-700 mb-4">Запись успешно отменена</div>
              <TicketRow label="Врач" value={cancelResult.doctor_name} />
              <TicketRow label="Пациент" value={cancelResult.patient_name} />
              <TicketRow label="Дата" value={formatDateShort(cancelResult.appointment_date)} />
              <TicketRow label="Время" value={cancelResult.appointment_time} />
              <button onClick={() => { setStep("home"); resetAll(); }}
                className="mt-6 bg-gray-700 text-white text-xl font-bold px-8 py-3 rounded-2xl hover:bg-gray-600 active:scale-95">
                НА ГЛАВНУЮ
              </button>
            </div>
          )}
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket, #ticket * { visibility: visible !important; }
          #ticket {
            position: fixed !important;
            top: 0; left: 0;
            width: 80mm !important;
            border: none !important;
            box-shadow: none !important;
            font-size: 12pt !important;
          }
        }
      `}</style>
    </div>
  );
}

function KioskButton({ icon, label, color, onClick }: { icon: string; label: string; color: "blue" | "green" | "red"; onClick: () => void }) {
  const colors = {
    blue: "bg-blue-600 hover:bg-blue-500 border-blue-700",
    green: "bg-green-600 hover:bg-green-500 border-green-700",
    red: "bg-red-600 hover:bg-red-500 border-red-700",
  };
  return (
    <button
      onClick={onClick}
      className={`${colors[color]} text-white text-4xl font-black px-16 py-8 rounded-3xl border-b-8 active:border-b-2 active:translate-y-1 transition-all shadow-xl w-full max-w-2xl flex items-center justify-center gap-6 uppercase tracking-wide`}>
      <Icon name={icon as any} size={48} />
      {label}
    </button>
  );
}

function TicketRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2 text-sm">
      <span className="text-gray-500 shrink-0">{label}:</span>
      <span className="font-semibold text-gray-900 text-right">{value}</span>
    </div>
  );
}