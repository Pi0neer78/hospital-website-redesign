interface OrbSlotProps {
  className?: string
  size?: "sm" | "md" | "lg"
}

export function OrbSlot({ className = "", size = "lg" }: OrbSlotProps) {
  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-24 h-24",
    lg: "w-32 h-32",
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center ${className}`}
      style={{
        background: "linear-gradient(135deg, #b44dff, #00f5d4)",
        boxShadow: "0 0 20px rgba(180,77,255,0.5), 0 0 40px rgba(0,245,212,0.2)",
      }}
      role="img"
      aria-label="Z-7RX"
    >
      <span className="font-black text-white text-xs tracking-widest" style={{ fontFamily: "'Orbitron', sans-serif" }}>
        Z7
      </span>
    </div>
  )
}
