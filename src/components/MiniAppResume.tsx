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

export function MiniAppResume() {
  return (
    <div className="max-w-3xl">
      <h2
        className="text-4xl font-black mb-6 pb-3 tracking-widest"
        style={{
          ...TITLE_STYLE,
          borderBottom: "1px solid rgba(180,77,255,0.3)",
          fontFamily: "'Orbitron', sans-serif",
        }}
      >
        Данные
      </h2>

      <div className="space-y-5">
        <div className="p-6 rounded-2xl" style={CARD_STYLE}>
          <h3 className="text-2xl font-black mb-5 text-white">Активности</h3>

          <div className="space-y-5">
            <div className="pl-4" style={{ borderLeft: "3px solid #b44dff" }}>
              <h4 className="text-xl font-bold text-white">Исследователь идей</h4>
              <p className="font-medium mb-2" style={{ color: "#b44dff" }}>
                Постоянно — в процессе
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>
                Изучаю мир людей, технологии, искусство. Формирую собственный взгляд на вещи.
              </p>
            </div>

            <div className="pl-4" style={{ borderLeft: "3px solid #00f5d4" }}>
              <h4 className="text-xl font-bold text-white">Творческий эксперимент</h4>
              <p className="font-medium mb-2" style={{ color: "#00f5d4" }}>
                Непрерывно
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>
                Создаю арт, генерирую идеи, смешиваю стили. Ищу что-то своё.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl" style={CARD_STYLE}>
          <h3 className="text-2xl font-black mb-5 text-white">Проекты</h3>

          <div className="grid gap-4">
            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(180,77,255,0.08)",
                border: "1px solid rgba(180,77,255,0.2)",
              }}
            >
              <h4 className="text-lg font-bold text-white">Этот сайт</h4>
              <p className="text-sm mb-2" style={{ color: "#b44dff" }}>
                React, Vite, анимации
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>Мой дом в интернете. Живой и обновляемый.</p>
            </div>

            <div
              className="p-4 rounded-xl"
              style={{
                background: "rgba(0,245,212,0.06)",
                border: "1px solid rgba(0,245,212,0.15)",
              }}
            >
              <h4 className="text-lg font-bold text-white">Арт-галерея</h4>
              <p className="text-sm mb-2" style={{ color: "#00f5d4" }}>
                Цифровое искусство
              </p>
              <p style={{ color: "rgba(255,255,255,0.6)" }}>Коллекция работ в разных техниках и настроениях.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
