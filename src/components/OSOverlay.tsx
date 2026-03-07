import { useEffect } from "react"
import { useUIStore } from "@/lib/ui-store"
import { OrbSlot } from "./OrbSlot"
import { MiniAppAbout } from "./MiniAppAbout"
import { MiniAppResume } from "./MiniAppResume"
import { MiniAppWritings } from "./MiniAppWritings"
import { MiniAppArt } from "./MiniAppArt"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

type AppType = "about" | "resume" | "writings" | "art"

const APP_COMPONENTS: Record<AppType, React.ComponentType> = {
  about: MiniAppAbout,
  resume: MiniAppResume,
  writings: MiniAppWritings,
  art: MiniAppArt,
}

const APP_ICONS: Record<AppType, string> = {
  about: "Cpu",
  resume: "FileText",
  writings: "Zap",
  art: "Sparkles",
}

const APP_LABELS: Record<AppType, string> = {
  about: "Обо мне",
  resume: "Данные",
  writings: "Мысли",
  art: "Арт",
}

const APP_COLORS: Record<AppType, string> = {
  about: "#b44dff",
  resume: "#00f5d4",
  writings: "#ff2e8f",
  art: "#b44dff",
}

export function OSOverlay() {
  const { osOpen, activeApp, closeOS, setActiveApp } = useUIStore()

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && osOpen) closeOS()
    }
    document.addEventListener("keydown", handleEscape)
    return () => document.removeEventListener("keydown", handleEscape)
  }, [osOpen, closeOS])

  if (!osOpen) return null

  const ActiveComponent = activeApp ? APP_COMPONENTS[activeApp as AppType] : null

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" style={{ background: "var(--dark-bg)" }}>
      {/* Фоновая сетка */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(180,77,255,0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(180,77,255,0.05) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />

      {/* Header */}
      <header
        className="flex items-center justify-between p-4 backdrop-blur-md relative z-10"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderBottom: "1px solid rgba(180,77,255,0.2)",
        }}
      >
        <div className="flex items-center gap-4">
          <OrbSlot size="sm" />
          <h1
            className="text-xl font-black tracking-widest"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              background: "linear-gradient(90deg, #b44dff, #00f5d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Z-7RX OS
          </h1>
        </div>

        <Button
          onClick={closeOS}
          className="w-10 h-10 p-0 rounded-lg transition-all hover:scale-110"
          style={{
            background: "rgba(255,46,143,0.15)",
            border: "1px solid rgba(255,46,143,0.4)",
            color: "#ff2e8f",
            boxShadow: "0 0 15px rgba(255,46,143,0.2)",
          }}
          aria-label="Закрыть"
        >
          <Icon name="X" size={16} />
        </Button>
      </header>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Sidebar */}
        <nav
          className="w-56 p-4 backdrop-blur-md"
          style={{
            background: "rgba(255,255,255,0.02)",
            borderRight: "1px solid rgba(180,77,255,0.15)",
          }}
        >
          <div className="space-y-2">
            {(Object.keys(APP_COMPONENTS) as AppType[]).map((key) => {
              const isActive = activeApp === key
              const color = APP_COLORS[key]

              return (
                <Button
                  key={key}
                  onClick={() => setActiveApp(key)}
                  className="w-full justify-start gap-3 h-11 rounded-xl transition-all font-semibold text-sm"
                  style={
                    isActive
                      ? {
                          background: `${color}22`,
                          border: `1px solid ${color}55`,
                          color: color,
                          boxShadow: `0 0 15px ${color}22`,
                        }
                      : {
                          background: "transparent",
                          border: "1px solid transparent",
                          color: "rgba(255,255,255,0.5)",
                        }
                  }
                >
                  <Icon name={APP_ICONS[key]} size={18} />
                  {APP_LABELS[key]}
                </Button>
              )
            })}
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 p-8 overflow-auto">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h2
                  className="text-4xl font-black mb-3 tracking-widest"
                  style={{
                    fontFamily: "'Orbitron', sans-serif",
                    background: "linear-gradient(90deg, #b44dff, #00f5d4)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  Z-7RX OS
                </h2>
                <p style={{ color: "rgba(255,255,255,0.4)" }}>Выбери раздел слева</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
