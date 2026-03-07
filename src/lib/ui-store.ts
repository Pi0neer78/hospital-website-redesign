import { create } from "zustand"

type Persona = "assistant" | "alex"
type AppType = "about" | "resume" | "writings" | "art" | null

interface UIState {
  persona: Persona
  osOpen: boolean
  activeApp: AppType
  setPersona: (persona: Persona) => void
  openOS: (app?: AppType) => void
  closeOS: () => void
  setActiveApp: (app: AppType) => void
}

export const useUIStore = create<UIState>((set) => ({
  persona: "assistant",
  osOpen: false,
  activeApp: null,
  setPersona: (persona) => set({ persona }),
  openOS: (app = null) => set({ osOpen: true, activeApp: app }),
  closeOS: () => set({ osOpen: false, activeApp: null }),
  setActiveApp: (app) => set({ activeApp: app }),
}))
