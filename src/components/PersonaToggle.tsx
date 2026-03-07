import { useUIStore } from "@/lib/ui-store"
import { Button } from "@/components/ui/button"

export function PersonaToggle() {
  const { persona, setPersona } = useUIStore()

  return (
    <Button
      onClick={() => setPersona(persona === "assistant" ? "alex" : "assistant")}
      className="font-bold px-4 py-2 rounded-lg transition-all text-sm"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(180,77,255,0.3)",
        color: "#b44dff",
        boxShadow: "0 0 10px rgba(180,77,255,0.15)",
      }}
    >
      {persona === "assistant" ? "Z-7RX" : "Режим"}
    </Button>
  )
}
