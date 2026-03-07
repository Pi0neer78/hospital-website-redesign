import { create } from "zustand"

export type ThinkingPhase =
  | "idle"
  | "seeing"
  | "analyzing"
  | "memory"
  | "thinking"
  | "checking"
  | "routing"
  | "speaking"

export interface PhaseStep {
  phase: ThinkingPhase
  label: string
  emoji: string
  duration: number
}

export const PIPELINE: PhaseStep[] = [
  { phase: "seeing",   label: "Вижу запрос",         emoji: "👁",  duration: 600  },
  { phase: "analyzing",label: "Анализирую",           emoji: "🔍", duration: 700  },
  { phase: "memory",   label: "Обращаюсь к памяти",  emoji: "🧠", duration: 600  },
  { phase: "thinking", label: "Думаю...",             emoji: "⚡", duration: 900  },
  { phase: "checking", label: "Проверяю себя",        emoji: "✅", duration: 500  },
  { phase: "routing",  label: "Маршрутизирую",        emoji: "🔀", duration: 400  },
  { phase: "speaking", label: "Отвечаю",              emoji: "💬", duration: 300  },
]

interface ChatStore {
  phase: ThinkingPhase
  activeStep: number | null
  setPhase: (p: ThinkingPhase) => void
  runPipeline: (onDone: () => void) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  phase: "idle",
  activeStep: null,

  setPhase: (phase) => set({ phase }),

  runPipeline: (onDone) => {
    let delay = 0
    PIPELINE.forEach((step, i) => {
      setTimeout(() => {
        set({ phase: step.phase, activeStep: i })
      }, delay)
      delay += step.duration
    })
    setTimeout(() => {
      onDone()
    }, delay)
    setTimeout(() => {
      set({ phase: "idle", activeStep: null })
    }, delay + 1200)
  },
}))
