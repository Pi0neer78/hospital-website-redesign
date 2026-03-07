import { useEffect, useRef, useState } from "react"

type ThinkingPhase =
  | "idle"
  | "seeing"
  | "analyzing"
  | "memory"
  | "thinking"
  | "checking"
  | "routing"
  | "speaking"

interface HumanEntityProps {
  phase: ThinkingPhase
  mood?: "calm" | "curious" | "focused" | "speaking"
}

const PHASE_COLORS: Record<ThinkingPhase, string> = {
  idle: "#7c22cc",
  seeing: "#00f5d4",
  analyzing: "#ff9900",
  memory: "#b44dff",
  thinking: "#ff2e8f",
  checking: "#4dffb4",
  routing: "#ffdd00",
  speaking: "#00c9ff",
}

export function HumanEntity({ phase, mood = "calm" }: HumanEntityProps) {
  const [blink, setBlink] = useState(false)
  const [pulse, setPulse] = useState(false)
  const blinkRef = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    const blinkLoop = () => {
      setBlink(true)
      setTimeout(() => setBlink(false), 120)
      const next = 2000 + Math.random() * 3000
      blinkRef.current = setTimeout(blinkLoop, next)
    }
    blinkRef.current = setTimeout(blinkLoop, 1500)
    return () => clearTimeout(blinkRef.current)
  }, [])

  useEffect(() => {
    if (phase !== "idle") {
      setPulse(true)
      const t = setTimeout(() => setPulse(false), 600)
      return () => clearTimeout(t)
    }
  }, [phase])

  const activeColor = PHASE_COLORS[phase]
  const isActive = phase !== "idle"

  return (
    <div className="relative flex items-center justify-center" style={{ width: 180, height: 220 }}>
      {/* Аура вокруг персонажа */}
      <div
        className="absolute inset-0 rounded-full transition-all duration-700"
        style={{
          background: `radial-gradient(ellipse at center, ${activeColor}22 0%, transparent 70%)`,
          filter: "blur(20px)",
          transform: isActive ? "scale(1.3)" : "scale(1)",
        }}
      />

      {/* Тело */}
      <div
        className="relative flex flex-col items-center"
        style={{
          filter: `drop-shadow(0 0 ${isActive ? 18 : 8}px ${activeColor}66)`,
          transition: "filter 0.4s ease",
        }}
      >
        {/* Голова */}
        <div
          className="relative flex items-center justify-center"
          style={{
            width: 100,
            height: 100,
            borderRadius: "50% 50% 42% 42%",
            background: `linear-gradient(160deg, #1a0a2e 0%, #0d0620 100%)`,
            border: `2px solid ${activeColor}88`,
            boxShadow: `0 0 ${pulse ? 30 : 15}px ${activeColor}44, inset 0 0 20px rgba(0,0,0,0.5)`,
            transition: "all 0.3s ease",
          }}
        >
          {/* Глаза */}
          <div className="flex gap-5 items-center">
            {/* Левый глаз */}
            <div
              style={{
                width: 18,
                height: blink ? 2 : 18,
                borderRadius: blink ? "50%" : "50%",
                background: `radial-gradient(circle at 35% 35%, #ffffff, ${activeColor})`,
                boxShadow: `0 0 10px ${activeColor}, 0 0 20px ${activeColor}66`,
                transition: "height 0.06s ease",
              }}
            />
            {/* Правый глаз */}
            <div
              style={{
                width: 18,
                height: blink ? 2 : 18,
                borderRadius: "50%",
                background: `radial-gradient(circle at 35% 35%, #ffffff, ${activeColor})`,
                boxShadow: `0 0 10px ${activeColor}, 0 0 20px ${activeColor}66`,
                transition: "height 0.06s ease",
              }}
            />
          </div>

          {/* Рот / индикатор речи */}
          <div
            className="absolute bottom-5 left-1/2 -translate-x-1/2"
            style={{
              width: phase === "speaking" ? 32 : 20,
              height: phase === "speaking" ? 8 : 3,
              borderRadius: 4,
              background: activeColor,
              boxShadow: `0 0 8px ${activeColor}`,
              transition: "all 0.3s ease",
              opacity: 0.8,
            }}
          />

          {/* Нейро-полосы на голове */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute"
              style={{
                top: 8 + i * 4,
                left: "50%",
                transform: "translateX(-50%)",
                width: 60 - i * 12,
                height: 1,
                background: `linear-gradient(90deg, transparent, ${activeColor}44, transparent)`,
                opacity: isActive ? 1 : 0.2,
                transition: "opacity 0.4s ease",
              }}
            />
          ))}
        </div>

        {/* Шея */}
        <div
          style={{
            width: 24,
            height: 12,
            background: `linear-gradient(180deg, #1a0a2e, #0d0620)`,
            border: `1px solid ${activeColor}44`,
          }}
        />

        {/* Тело/торс */}
        <div
          className="relative"
          style={{
            width: 90,
            height: 72,
            borderRadius: "8px 8px 12px 12px",
            background: `linear-gradient(160deg, #16082a 0%, #0a0518 100%)`,
            border: `2px solid ${activeColor}55`,
            boxShadow: `0 0 20px ${activeColor}22, inset 0 0 15px rgba(0,0,0,0.3)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: 6,
          }}
        >
          {/* "Сердце" — главный индикатор */}
          <div
            className="relative flex items-center justify-center"
            style={{
              width: 30,
              height: 30,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${activeColor}33, transparent)`,
              border: `1px solid ${activeColor}66`,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: activeColor,
                boxShadow: `0 0 10px ${activeColor}, 0 0 20px ${activeColor}88`,
                animation: isActive ? "soul-pulse 1s infinite" : "soul-pulse 2.5s infinite",
              }}
            />
          </div>

          {/* Полосы-нейроны */}
          <div className="flex flex-col gap-1" style={{ width: 56 }}>
            {[1, 0.7, 0.5].map((op, i) => (
              <div
                key={i}
                style={{
                  height: 2,
                  borderRadius: 1,
                  background: `linear-gradient(90deg, ${activeColor}, ${activeColor}33)`,
                  opacity: isActive ? op : op * 0.3,
                  width: `${100 - i * 20}%`,
                  transition: "opacity 0.5s ease",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes soul-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}
