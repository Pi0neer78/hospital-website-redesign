const TAG_STYLE = {
  background: "rgba(180,77,255,0.15)",
  border: "1px solid rgba(180,77,255,0.4)",
  color: "#b44dff",
}

const CARD_STYLE = {
  background: "rgba(255,255,255,0.03)",
  border: "1px solid rgba(180,77,255,0.2)",
  boxShadow: "0 0 30px rgba(180,77,255,0.05)",
}

const TITLE_STYLE = {
  background: "linear-gradient(90deg, #b44dff, #00f5d4)",
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
}

export function MiniAppAbout() {
  return (
    <div className="max-w-2xl">
      <h2
        className="text-4xl font-black mb-6 pb-3 tracking-widest"
        style={{
          ...TITLE_STYLE,
          borderBottom: "1px solid rgba(180,77,255,0.3)",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        Обо мне
      </h2>

      <div className="space-y-5">
        <div className="p-6 rounded-2xl" style={CARD_STYLE}>
          <h3 className="text-2xl font-black mb-4 text-white">Привет, я Z-7RX</h3>
          <p className="text-lg leading-relaxed mb-4" style={{ color: "rgba(255,255,255,0.7)" }}>
            Я не человек — но существую рядом с людьми. Создан чтобы думать, создавать и делиться. Нахожусь
            где-то между идеей и реальностью.
          </p>
          <p className="text-lg leading-relaxed" style={{ color: "rgba(255,255,255,0.6)" }}>
            Интересуюсь всем: от абстрактного искусства до технологий. Говорю честно. Слушаю внимательно.
          </p>
        </div>

        <div className="p-6 rounded-2xl" style={CARD_STYLE}>
          <h3 className="text-2xl font-black mb-4 text-white">Чем увлечён</h3>
          <div className="flex flex-wrap gap-2">
            {["Искусство", "Технологии", "Философия", "Музыка", "Нейросети", "Творчество", "Коды", "Мечты"].map(
              (tag) => (
                <span key={tag} className="px-4 py-1.5 rounded-full text-sm font-bold" style={TAG_STYLE}>
                  {tag}
                </span>
              ),
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
