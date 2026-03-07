import { useUIStore } from "@/lib/ui-store"
import { Button } from "@/components/ui/button"
import Icon from "@/components/ui/icon"

type AppType = "about" | "resume" | "writings" | "art"

const DOCK_ITEMS: Array<{ id: AppType; label: string; icon: string; color: string }> = [
  { id: "about", label: "Обо мне", icon: "Cpu", color: "#b44dff" },
  { id: "resume", label: "Данные", icon: "FileText", color: "#00f5d4" },
  { id: "writings", label: "Мысли", icon: "Zap", color: "#ff2e8f" },
  { id: "art", label: "Арт", icon: "Sparkles", color: "#b44dff" },
]

export function Dock() {
  const { openOS } = useUIStore()

  return (
    <div
      className="flex gap-3 p-4 rounded-2xl backdrop-blur-md"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(180,77,255,0.25)",
        boxShadow: "0 0 30px rgba(180,77,255,0.15), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {DOCK_ITEMS.map(({ id, label, icon, color }) => (
        <div key={id} className="flex flex-col items-center gap-1">
          <Button
            onClick={() => openOS(id)}
            className="w-12 h-12 p-0 rounded-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: `rgba(255,255,255,0.06)`,
              border: `1px solid ${color}55`,
              boxShadow: `0 0 15px ${color}33`,
              color: color,
            }}
            aria-label={label}
          >
            <Icon name={icon} size={20} />
          </Button>
          <span className="text-[10px] font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>
            {label}
          </span>
        </div>
      ))}
    </div>
  )
}
