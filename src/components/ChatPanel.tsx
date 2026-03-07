import type React from "react"
import { useState, useRef } from "react"
import { useUIStore } from "@/lib/ui-store"
import { useChatStore, PIPELINE } from "@/lib/chat-store"
import { Button } from "@/components/ui/button"

const SOUL_URL = "https://functions.poehali.dev/6412bdf6-fe80-4852-947b-0b5adc815e99"

const QUICK_CHIPS = ["Кто ты?", "Как дела?", "Думаешь обо мне?"]

function getSessionId() {
  let id = localStorage.getItem("soul_session")
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now()
    localStorage.setItem("soul_session", id)
  }
  return id
}

const ACTION_COMMANDS: Record<string, string> = {
  "открой арт": "art",
  "покажи арт": "art",
  "открой резюме": "resume",
  "открой обо мне": "about",
  "покажи обо мне": "about",
  "открой статьи": "writings",
  "открой мысли": "writings",
}

type AppType = "about" | "resume" | "writings" | "art"

export function ChatPanel() {
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean }>>([])
  const [inputValue, setInputValue] = useState("")
  const [loading, setLoading] = useState(false)
  const { openOS } = useUIStore()
  const { runPipeline, activeStep } = useChatStore()
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const sessionId = useRef(getSessionId())

  const scrollToBottom = () => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50)
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg = text.trim()

    setMessages((prev) => [...prev, { text: userMsg, isUser: true }])
    setLoading(true)
    scrollToBottom()

    const lowerMsg = userMsg.toLowerCase()
    const actionKey = Object.keys(ACTION_COMMANDS).find((k) => lowerMsg.includes(k))
    if (actionKey) {
      const app = ACTION_COMMANDS[actionKey] as AppType
      setMessages((prev) => [...prev, { text: "Открываю...", isUser: false }])
      setLoading(false)
      scrollToBottom()
      setTimeout(() => openOS(app), 600)
      return
    }

    runPipeline(async () => {
      try {
        const res = await fetch(SOUL_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg, session_id: sessionId.current }),
        })
        const raw = await res.json()
        const data = typeof raw === "string" ? JSON.parse(raw) : raw
        const reply = data.reply || "..."
        setMessages((prev) => [...prev, { text: reply, isUser: false }])
        scrollToBottom()
      } catch {
        setMessages((prev) => [...prev, { text: "Что-то пошло не так.", isUser: false }])
      } finally {
        setLoading(false)
      }
    })
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(inputValue)
    setInputValue("")
  }

  const step = activeStep !== null ? PIPELINE[activeStep] : null

  return (
    <div className="w-full">
      {/* Pipeline-индикатор мышления */}
      <div
        className="mb-3 transition-all duration-500"
        style={{
          height: loading ? 44 : 0,
          opacity: loading ? 1 : 0,
          overflow: "hidden",
        }}
      >
        <div
          className="px-4 h-11 flex items-center gap-3"
          style={{
            background: "rgba(0,0,0,0.4)",
            border: "1px solid rgba(180,77,255,0.2)",
            borderRadius: 16,
          }}
        >
          {/* Точки-агенты */}
          <div className="flex gap-1.5 shrink-0">
            {PIPELINE.map((p, i) => (
              <div
                key={p.phase}
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: i === activeStep ? "#b44dff" : i < (activeStep ?? -1) ? "#00f5d4" : "rgba(255,255,255,0.15)",
                  boxShadow: i === activeStep ? "0 0 8px #b44dff" : "none",
                  transition: "all 0.3s ease",
                }}
              />
            ))}
          </div>
          {/* Лейбл фазы */}
          <span className="text-xs font-bold tracking-wide" style={{ color: "#b44dff" }}>
            {step ? `${step.emoji} ${step.label}` : "..."}
          </span>
          {/* Прыгающие точки */}
          <div className="ml-auto flex gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                style={{
                  width: 4,
                  height: 4,
                  borderRadius: "50%",
                  background: "#b44dff",
                  animation: "dot-bounce 0.8s ease-in-out infinite",
                  animationDelay: `${i * 0.15}s`,
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* История сообщений */}
      <div className="mb-3 space-y-2.5 overflow-y-auto scroll-smooth pr-1" style={{ maxHeight: 200 }}>
        {messages.length === 0 && (
          <p className="text-center text-xs py-4" style={{ color: "rgba(255,255,255,0.2)" }}>
            Напиши что-нибудь — я здесь
          </p>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.isUser ? "justify-end" : "justify-start"}`}>
            <div
              className="max-w-[82%] px-4 py-2.5 text-sm font-medium leading-relaxed"
              style={
                msg.isUser
                  ? {
                      background: "linear-gradient(135deg, rgba(180,77,255,0.85), rgba(124,34,204,0.9))",
                      border: "1px solid rgba(180,77,255,0.45)",
                      borderRadius: "18px 18px 4px 18px",
                      color: "#fff",
                      boxShadow: "0 0 16px rgba(180,77,255,0.2)",
                    }
                  : {
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(0,245,212,0.18)",
                      borderRadius: "18px 18px 18px 4px",
                      color: "rgba(255,255,255,0.88)",
                      boxShadow: "0 0 10px rgba(0,245,212,0.06)",
                    }
              }
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Поле ввода */}
      <form onSubmit={handleSubmit} className="mb-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Скажи что-нибудь..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-2xl text-white text-sm font-medium focus:outline-none disabled:opacity-40 transition-all"
            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(180,77,255,0.25)" }}
            onFocus={(e) => {
              e.target.style.border = "1px solid rgba(0,245,212,0.55)"
              e.target.style.background = "rgba(255,255,255,0.07)"
            }}
            onBlur={(e) => {
              e.target.style.border = "1px solid rgba(180,77,255,0.25)"
              e.target.style.background = "rgba(255,255,255,0.05)"
            }}
          />
          <button
            type="submit"
            disabled={loading || !inputValue.trim()}
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg disabled:opacity-30 transition-all"
            style={{
              background: "linear-gradient(135deg, #b44dff, #7c22cc)",
              boxShadow: "0 0 20px rgba(180,77,255,0.3)",
            }}
          >
            ↑
          </button>
        </div>
      </form>

      {/* Быстрые чипы */}
      <div className="flex flex-wrap gap-2 justify-center">
        {QUICK_CHIPS.map((chip) => (
          <Button
            key={chip}
            onClick={() => { sendMessage(chip) }}
            disabled={loading}
            className="text-xs px-4 py-2 h-auto rounded-full font-semibold disabled:opacity-30 transition-all"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(0,245,212,0.22)",
              color: "rgba(0,245,212,0.85)",
            }}
          >
            {chip}
          </Button>
        ))}
      </div>

      <style>{`
        @keyframes dot-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
