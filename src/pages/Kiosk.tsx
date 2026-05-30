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
  defaultNumMode = false,
}: {
  onKey: (k: string) => void;
  onBackspace: () => void;
  onClose: () => void;
  defaultNumMode?: boolean;
}) {
  const [caps, setCaps] = useState(false);
  const [numMode, setNumMode] = useState(defaultNumMode);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t-4 border-blue-600 p-4 z-50 select-none">
      {!numMode ? (
        <>
          <div className="flex justify-center gap-1.5 mb-1.5">
            {NUM_ROW.map((k) => (
              <button key={k} onClick={() => onKey(k)}
                className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-xl font-bold hover:bg-blue-600 active:scale-95 transition-transform min-w-[48px]">
                {k}
              </button>
            ))}
            <button onClick={() => onKey("-")}
              className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-xl font-bold hover:bg-blue-600 active:scale-95 min-w-[48px]">-</button>
          </div>
          {RU_ROWS.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1.5 mb-1.5">
              {ri === 2 && (
                <button onClick={() => setCaps(!caps)}
                  className={`rounded-lg px-4 py-2.5 text-base font-bold transition-all min-w-[72px] ${caps ? "bg-blue-600 text-white" : "bg-gray-600 text-white"}`}>
                  ⇧
                </button>
              )}
              {row.map((k) => (
                <button key={k} onClick={() => onKey(caps ? k.toUpperCase() : k)}
                  className="bg-gray-700 text-white rounded-lg px-4 py-2.5 text-xl hover:bg-blue-600 active:scale-95 transition-transform min-w-[48px]">
                  {caps ? k.toUpperCase() : k}
                </button>
              ))}
              {ri === 2 && (
                <button onClick={onBackspace}
                  className="bg-red-700 text-white rounded-lg px-4 py-2.5 text-base font-bold hover:bg-red-500 active:scale-95 min-w-[72px]">
                  ⌫
                </button>
              )}
            </div>
          ))}
        </>
      ) : (
        <div className="flex justify-center gap-2.5 mb-2.5 flex-wrap">
          {["0","1","2","3","4","5","6","7","8","9","+","-","(",")"," "].map((k) => (
            <button key={k} onClick={() => onKey(k)}
              className="bg-gray-700 text-white rounded-lg px-5 py-3.5 text-2xl font-bold hover:bg-blue-600 active:scale-95 transition-transform min-w-[60px]">
              {k === " " ? "␣" : k}
            </button>
          ))}
          <button onClick={onBackspace}
            className="bg-red-700 text-white rounded-lg px-5 py-3.5 text-2xl font-bold hover:bg-red-500 active:scale-95 min-w-[72px]">
            ⌫
          </button>
        </div>
      )}
      <div className="flex justify-center gap-2.5 mt-1.5">
        <button onClick={() => setNumMode(!numMode)}
          className="bg-gray-600 text-white rounded-lg px-5 py-2.5 text-base font-semibold hover:bg-gray-500">
          {numMode ? "🔤 Буквы" : "🔢 Цифры"}
        </button>
        <button onClick={() => onKey(" ")}
          className="bg-gray-700 text-white rounded-lg px-20 py-2.5 text-base hover:bg-blue-600">
          ПРОБЕЛ
        </button>
        <button onClick={onClose}
          className="bg-green-700 text-white rounded-lg px-5 py-2.5 text-base font-semibold hover:bg-green-600">
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
  const [doctorPage, setDoctorPage] = useState(0);
  const DOCTORS_PER_PAGE = 6;
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
    if (step === "ticket" || step === "cancel-ticket") {
      setCountdown(30);
      countdownRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            clearInterval(countdownRef.current!);
            setStep("home");
            setTicket(null);
            setCancelResult(null);
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
    new Audio("https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/3cdb7e37-0f30-4595-9e4f-8cfdaef9b1e6.mp3").play().catch(() => {});
  }

  function handleDateSelect(date: string) {
    const info = bulkSlots[date];
    if (!info || info.available_slots?.length === 0) return;
    setSelectedDate(date);
    loadTimeSlots(selectedDoctor.id, date);
    setStep("slots");
    new Audio("https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/323ab30f-3bf8-4d3f-8587-301a013ac614.mp3").play().catch(() => {});
  }

  function handleTimeSelect(time: string) {
    setSelectedTime(time);
    setStep("form");
    new Audio("https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d4939085-cff0-4fdb-935f-b04954217dcc.mp3").play().catch(() => {});
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
      setFocusedCancel(false);
      setStep("cancel-ticket");
    } else {
      setCancelError(data.error || "Ошибка");
    }
  }

  function printTicket() {
    window.print();
  }

  function printCancelTicket() {
    window.print();
  }

  const headerBg = "bg-slate-800";

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const dateStr = now.toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  const dayStr = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const timeStr = now.toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'Arial', sans-serif", backgroundImage: "url('https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/c7868ef0-6b83-40fe-a940-7c2e5e256e4f.jpg')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}>
      {/* HEADER */}
      <div className={`${headerBg} text-white px-6 py-4 shadow-lg relative flex items-center`}>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <div className="text-4xl font-black tracking-widest uppercase mb-1">
            ЭЛЕКТРОННАЯ ОЧЕРЕДЬ
          </div>
          <div className="text-2xl font-semibold opacity-90">{clinicName}</div>
        </div>
        <div className="ml-auto text-right shrink-0 bg-slate-700 rounded-2xl px-5 py-3 min-w-[180px] relative z-10">
          <div className="text-3xl font-black tabular-nums">{timeStr}</div>
          <div className="text-lg font-semibold opacity-90 capitalize">{dayStr}</div>
          <div className="text-base opacity-80">{dateStr}</div>
        </div>
      </div>

      {/* HOME */}
      {step === "home" && (
        <div className="flex-1 flex flex-col items-center justify-center gap-6 p-8">
          <KioskButton icon="BookOpen" label="ИНСТРУКЦИЯ" color="blue" onClick={() => setStep("instruction")} />
          <KioskButton
            icon="CalendarPlus"
            label="ЗАПИСАТЬСЯ НА ПРИЁМ"
            color="green"
            onClick={() => { loadDoctors(); setDoctorPage(0); setStep("doctors"); new Audio("https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/8824efbd-2513-4c45-ad08-c1c513d0a3ed.mp3").play().catch(() => {}); }}
          />
          <KioskButton icon="CalendarX" label="ОТМЕНИТЬ ЗАПИСЬ" color="red" onClick={() => { resetAll(); setStep("cancel"); }} />
        </div>
      )}

      {/* INSTRUCTION */}
      {step === "instruction" && (
        <div className="flex-1 bg-gradient-to-b from-blue-50 to-white overflow-y-auto">
          {/* Hero */}
          <div className="bg-blue-700 text-white text-center py-8 px-6">
            <div className="text-5xl mb-3">📋</div>
            <h2 className="text-4xl font-black mb-2">Как записаться на приём?</h2>
            <p className="text-xl opacity-85">Следуйте простым шагам — это займёт не более 2 минут</p>
          </div>

          {/* Steps */}
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

            {/* Step 1 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">1</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Нажмите «ЗАПИСАТЬСЯ НА ПРИЁМ»</div>
                  <div className="text-lg text-gray-600">На главном экране нажмите большую зелёную кнопку. Откроется список врачей вашей поликлиники.</div>
                </div>
                <div className="shrink-0 w-28 h-28 rounded-2xl bg-green-100 flex items-center justify-center text-6xl">🏥</div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">2</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Выберите врача</div>
                  <div className="text-lg text-gray-600">Карточки врачей показывают фото, специализацию и стаж. Нажмите на нужного врача.</div>
                  <div className="mt-3 bg-blue-50 rounded-xl p-3 border-l-4 border-blue-400">
                    <div className="text-base font-semibold text-blue-800">💡 Совет: если не знаете к кому обратиться — выберите терапевта</div>
                  </div>
                </div>
                <img src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/7319fb24-6fae-4673-a82f-817cc897cf2f.jpg"
                  alt="Список врачей" className="shrink-0 w-36 h-28 rounded-2xl object-cover shadow" />
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">3</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Выберите удобную дату</div>
                  <div className="text-lg text-gray-600">Показаны ближайшие 14 дней. На каждой ячейке — сколько мест свободно.</div>
                  <div className="mt-3 flex gap-3">
                    <div className="bg-green-100 border-2 border-green-400 rounded-xl px-4 py-2 text-center">
                      <div className="text-2xl font-black text-green-700">5</div>
                      <div className="text-sm text-green-600">свободно</div>
                    </div>
                    <div className="bg-gray-100 border-2 border-gray-300 rounded-xl px-4 py-2 text-center">
                      <div className="text-sm text-gray-400 mt-1">нет мест</div>
                    </div>
                  </div>
                </div>
                <img src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/4ddc982a-6b8a-4128-b2a2-b113c4ef8828.jpg"
                  alt="Выбор даты" className="shrink-0 w-36 h-28 rounded-2xl object-cover shadow" />
              </div>
            </div>

            {/* Step 4 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">4</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Выберите время приёма</div>
                  <div className="text-lg text-gray-600">Нажмите на свободный временной слот. Занятые и перерывы недоступны для выбора.</div>
                  <div className="mt-3 flex gap-3 flex-wrap">
                    <div className="bg-white border-2 border-green-400 rounded-xl px-4 py-2 text-xl font-bold text-gray-800">09:00</div>
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-2 text-xl font-bold text-red-300 line-through">10:30</div>
                    <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl px-4 py-2 text-base font-bold text-yellow-500">перерыв</div>
                  </div>
                </div>
                <div className="shrink-0 w-28 h-28 rounded-2xl bg-blue-50 flex items-center justify-center text-6xl">🕐</div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">5</div>
              </div>
              <div className="flex-1 p-5">
                <div className="text-2xl font-bold text-gray-900 mb-1">Введите ваши данные</div>
                <div className="text-lg text-gray-600 mb-3">На экране появится виртуальная клавиатура. Заполните поля:</div>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "👤", label: "ФИО", note: "обязательно", color: "bg-red-50 border-red-300" },
                    { icon: "📱", label: "Телефон", note: "обязательно", color: "bg-red-50 border-red-300" },
                    { icon: "🪪", label: "СНИЛС", note: "желательно", color: "bg-yellow-50 border-yellow-300" },
                    { icon: "💳", label: "Полис ОМС", note: "желательно", color: "bg-yellow-50 border-yellow-300" },
                  ].map(({ icon, label, note, color }) => (
                    <div key={label} className={`${color} border-2 rounded-xl px-4 py-2 flex items-center gap-3`}>
                      <span className="text-2xl">{icon}</span>
                      <div>
                        <div className="font-bold text-gray-800">{label}</div>
                        <div className="text-sm text-gray-500">{note}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 6 */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-blue-100 flex">
              <div className="bg-blue-600 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">6</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Нажмите «ВЫПОЛНИТЬ ЗАПИСЬ»</div>
                  <div className="text-lg text-gray-600">Запись будет сохранена. Распечатайте талон — в нём указаны все данные и код для отмены.</div>
                </div>
                <div className="shrink-0 w-28 h-28 rounded-2xl bg-green-100 flex items-center justify-center text-6xl">✅</div>
              </div>
            </div>

            {/* Step 7 — ticket */}
            <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-orange-200 flex">
              <div className="bg-orange-500 text-white flex flex-col items-center justify-center px-6 py-4 min-w-[90px]">
                <div className="text-5xl font-black">7</div>
              </div>
              <div className="flex-1 p-5 flex items-center gap-5">
                <div className="flex-1">
                  <div className="text-2xl font-bold text-gray-900 mb-1">Сохраните талон и код</div>
                  <div className="text-lg text-gray-600 mb-3">На талоне напечатан уникальный 10-значный код. Сохраните его — он нужен для отмены записи.</div>
                  <div className="bg-orange-50 border-2 border-orange-400 rounded-2xl p-3 inline-block">
                    <div className="text-sm text-gray-500 mb-1">Пример кода:</div>
                    <div className="text-3xl font-black tracking-widest text-red-700 font-mono">3847291056</div>
                  </div>
                </div>
                <img src="https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/files/544a075b-04c2-45a7-a142-d352ed4acf80.jpg"
                  alt="Талон" className="shrink-0 w-36 h-28 rounded-2xl object-cover shadow" />
              </div>
            </div>

            {/* Cancel section */}
            <div className="bg-red-50 rounded-3xl border-2 border-red-300 p-6">
              <div className="text-2xl font-bold text-red-800 mb-3 flex items-center gap-3">
                <span className="text-3xl">❌</span> Как отменить запись?
              </div>
              <div className="text-lg text-red-700 space-y-2">
                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0 mt-0.5">1</span>
                  <span>На главном экране нажмите <strong>«ОТМЕНИТЬ ЗАПИСЬ»</strong></span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0 mt-0.5">2</span>
                  <span>Введите 10-значный код с вашего талона</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center font-bold shrink-0 mt-0.5">3</span>
                  <span>Нажмите <strong>«ОТМЕНИТЬ ЗАПИСЬ»</strong> — готово</span>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-yellow-50 rounded-3xl border-2 border-yellow-300 p-5 flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div>
                <div className="text-xl font-bold text-yellow-800 mb-1">Важно знать</div>
                <ul className="text-lg text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Запись возможна на ближайшие 14 дней</li>
                  <li>Приходите за 10 минут до назначенного времени</li>
                  <li>При себе иметь паспорт и полис ОМС</li>
                  <li>Запись активна до начала приёма</li>
                </ul>
              </div>
            </div>

          </div>

          <div className="flex justify-center pb-8">
            <button onClick={() => setStep("home")}
              className="bg-blue-700 text-white text-2xl font-bold px-14 py-5 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all shadow-lg">
              ← ВЕРНУТЬСЯ НА ГЛАВНУЮ
            </button>
          </div>
        </div>
      )}

      {/* DOCTORS */}
      {step === "doctors" && (
        <div className="flex-1 flex flex-col p-6">
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
            <div className="flex gap-4 flex-1">
              {/* Кнопка ВВЕРХ */}
              <button
                onClick={() => setDoctorPage((p) => Math.max(0, p - 1))}
                disabled={doctorPage === 0}
                className="flex-none flex items-center justify-center w-20 rounded-2xl bg-slate-700 text-white text-5xl disabled:opacity-20 hover:bg-slate-600 active:scale-95 transition-all shadow-lg">
                ▲
              </button>

              {/* Список врачей */}
              <div className="flex-1 grid grid-cols-3 gap-5 content-start">
                {doctors.slice(doctorPage * DOCTORS_PER_PAGE, (doctorPage + 1) * DOCTORS_PER_PAGE).map((doc) => (
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

              {/* Кнопка ВНИЗ */}
              <button
                onClick={() => setDoctorPage((p) => Math.min(Math.ceil(doctors.length / DOCTORS_PER_PAGE) - 1, p + 1))}
                disabled={doctorPage >= Math.ceil(doctors.length / DOCTORS_PER_PAGE) - 1}
                className="flex-none flex items-center justify-center w-20 rounded-2xl bg-slate-700 text-white text-5xl disabled:opacity-20 hover:bg-slate-600 active:scale-95 transition-all shadow-lg">
                ▼
              </button>
            </div>
          )}
          {/* Счётчик страниц */}
          {doctors.length > DOCTORS_PER_PAGE && (
            <div className="text-center mt-4 text-gray-500 text-lg">
              Страница {doctorPage + 1} из {Math.ceil(doctors.length / DOCTORS_PER_PAGE)}
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
                  defaultNumMode={true}
                  onKey={(k) => { if (/\d/.test(k) && cancelCode.length < 10) setCancelCode((c) => c + k); }}
                  onBackspace={() => setCancelCode((c) => c.slice(0, -1))}
                  onClose={() => setFocusedCancel(false)}
                />
              )}
            </div>
        </div>
      )}

      {/* CANCEL TICKET */}
      {step === "cancel-ticket" && cancelResult && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="bg-white border-4 border-gray-800 rounded-2xl p-6 max-w-md w-full shadow-2xl" id="cancel-ticket">
            <div className="text-center border-b-2 border-dashed border-gray-400 pb-4 mb-4">
              <div className="text-sm font-bold text-gray-500 uppercase tracking-widest">Талон об отмене записи</div>
              <div className="text-xl font-black text-gray-900 mt-1">{clinicName}</div>
            </div>
            <div className="space-y-2 text-base">
              <TicketRow label="Врач" value={cancelResult.doctor_name} />
              <TicketRow label="Пациент" value={cancelResult.patient_name} />
              <TicketRow label="Дата" value={formatDateShort(cancelResult.appointment_date)} />
              <TicketRow label="Время" value={cancelResult.appointment_time} />
              <div className="border-t-2 border-dashed border-gray-400 my-3" />
              <div className="text-center">
                <div className="text-2xl font-black text-green-700">✓ ЗАПИСЬ ОТМЕНЕНА</div>
              </div>
              <div className="text-center text-xs text-gray-400 mt-3 border-t border-dashed pt-2">
                Выдан: {new Date().toLocaleString("ru-RU")}
              </div>
            </div>
          </div>
          <button onClick={printCancelTicket}
            className="mt-4 bg-blue-700 text-white text-xl font-bold px-8 py-3 rounded-2xl hover:bg-blue-600 active:scale-95 transition-all print:hidden">
            🖨 РАСПЕЧАТАТЬ ТАЛОН
          </button>
          <div className="mt-6 text-center print:hidden">
            <div className="text-xl text-gray-600 mb-2">Возврат на главную через:</div>
            <div className="text-6xl font-black text-red-600">{countdown}</div>
            <div className="text-gray-500">секунд</div>
            <button onClick={() => { clearInterval(countdownRef.current!); setStep("home"); setCancelResult(null); resetAll(); }}
              className="mt-4 bg-gray-700 text-white text-lg font-bold px-8 py-3 rounded-2xl hover:bg-gray-600 active:scale-95 transition-all">
              НА ГЛАВНУЮ
            </button>
          </div>
        </div>
      )}

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #ticket, #ticket *, #cancel-ticket, #cancel-ticket * { visibility: visible !important; }
          #ticket, #cancel-ticket {
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
      className={`${colors[color]} text-white text-4xl font-black px-12 py-8 rounded-3xl border-b-8 active:border-b-2 active:translate-y-1 transition-all shadow-xl w-full max-w-2xl flex items-center justify-start gap-8 uppercase tracking-wide`}>
      <span className="shrink-0"><Icon name={icon as any} size={48} /></span>
      <span className="flex-1 text-center">{label}</span>
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