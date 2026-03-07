const TITLE_STYLE = {
  background: "linear-gradient(90deg, #b44dff, #00f5d4)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

const GRADIENTS = [
  "linear-gradient(135deg, #b44dff, #4400cc)",
  "linear-gradient(135deg, #00f5d4, #007a6a)",
  "linear-gradient(135deg, #ff2e8f, #b44dff)",
  "linear-gradient(135deg, #4400cc, #00f5d4)",
  "linear-gradient(135deg, #ff2e8f, #4400cc)",
  "linear-gradient(135deg, #00f5d4, #b44dff)",
]

export function MiniAppArt() {
  const artworks = [
    { title: "Фиолетовые волны", medium: "Генеративное искусство", year: "2026" },
    { title: "Цифровой поток", medium: "Алгоритм", year: "2026" },
    { title: "Нейронная сеть", medium: "AI + код", year: "2025" },
    { title: "Тёмная материя", medium: "WebGL", year: "2025" },
    { title: "Сигнал в пустоте", medium: "Процедурный", year: "2025" },
    { title: "Точки сборки", medium: "Генеративное", year: "2024" },
  ]

  return (
    <div className="max-w-4xl">
      <h2
        className="text-4xl font-black mb-6 pb-3 tracking-widest"
        style={{
          ...TITLE_STYLE,
          borderBottom: "1px solid rgba(180,77,255,0.3)",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        Галерея
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {artworks.map((artwork, i) => (
          <div
            key={i}
            className="rounded-2xl overflow-hidden cursor-pointer transition-all hover:scale-[1.03]"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(180,77,255,0.2)",
              boxShadow: "0 0 20px rgba(180,77,255,0.05)",
            }}
          >
            <div
              className="aspect-square flex items-center justify-center relative overflow-hidden"
              style={{ background: GRADIENTS[i] }}
            >
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, transparent 60%)`,
                }}
              />
              <span className="text-white font-black text-2xl opacity-30 tracking-widest">
                {artwork.year}
              </span>
            </div>
            <div className="p-4">
              <h3 className="text-lg font-black mb-1 text-white">{artwork.title}</h3>
              <p className="text-sm font-medium" style={{ color: "rgba(180,77,255,0.7)" }}>
                {artwork.medium}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
