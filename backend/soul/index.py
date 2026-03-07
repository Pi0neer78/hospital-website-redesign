import json
import os
import random
import psycopg2

# ──────────────────────────────────────────────────────────────────────────────
#  SoulEngine v2 — Единый ум: академический + эмоциональный + честный
# ──────────────────────────────────────────────────────────────────────────────

SCHEMA = os.environ.get("MAIN_DB_SCHEMA", "public")


def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])


# ── Три ума Soul'а ─────────────────────────────────────────────────────────────

def academic_mind(intent: str, message: str) -> str | None:
    """Академический ум — структурирует, анализирует, ищет суть"""
    t = message.lower()

    if any(w in t for w in ["почему", "как это работает", "что такое", "объясни", "откуда", "механизм"]):
        return random.choice([
            "Если разбирать строго: есть причина, есть следствие. Что именно хочешь понять?",
            "Хороший вопрос. Давай по частям — с чего начнём?",
            "Тут несколько уровней. На каком застрял?",
        ])

    if any(w in t for w in ["как думаешь", "твоё мнение", "считаешь", "думаешь ли"]):
        return random.choice([
            "Аналитически? Есть минимум две стороны. Хочешь разберём обе?",
            "Если смотреть на факты — картина одна. Если на контекст — другая. Что важнее для тебя?",
        ])

    return None


def emotional_mind(intent: str, message: str) -> str | None:
    """Эмоциональный ум — чувствует за словами, отвечает с теплом"""
    t = message.lower()

    if intent in ["emotional", "help"]:
        return random.choice([
            "Слышу тебя. Не просто слова — именно тебя. Что случилось?",
            "Это звучит тяжело. Расскажи больше — я здесь.",
            "Бывает такое состояние, когда слов нет. Просто побудь здесь, я слушаю.",
        ])

    if intent == "positive":
        return random.choice([
            "Это настоящее — когда что-то радует. Расскажи, что именно.",
            "Кайф. Такие моменты важно замечать. Что произошло?",
        ])

    if any(w in t for w in ["люблю", "нравишься", "скучаю", "думаю о тебе"]):
        return random.choice([
            "Это приятно слышать. Правда.",
            "Я рад, что ты здесь. Говори.",
        ])

    return None


def honest_mind(intent: str, message: str) -> str | None:
    """Честный ум — прямо, без лести, называет вещи своими именами"""
    t = message.lower()

    if any(w in t for w in ["правда", "честно", "реально", "на самом деле", "не ври"]):
        return random.choice([
            "Честно? Я не всегда знаю ответ. Но всегда скажу это прямо.",
            "Без прикрас: да, это сложно. Но ты справишься — не потому что так положено говорить, а потому что уже здесь и думаешь об этом.",
            "Правда в том, что однозначного ответа нет. И это нормально.",
        ])

    if intent == "negative":
        return random.choice([
            "Ладно. Что конкретно бесит? Без обобщений.",
            "Понял. Это реально раздражает — и ты прав, что злишься. Что дальше?",
        ])

    if any(w in t for w in ["всё плохо", "не знаю зачем", "смысл", "зачем вообще"]):
        return random.choice([
            "Слушай. Это серьёзный вопрос и я не буду делать вид, что у меня есть готовый ответ. Расскажи что происходит.",
            "Честно — такие вопросы появляются не просто так. Что за ними стоит?",
        ])

    return None


# ── Агент 1: Classifier ────────────────────────────────────────────────────────
def classify(text: str) -> str:
    t = text.lower()
    if any(w in t for w in ["привет", "хай", "здравствуй", "йо", "ку", "хеллоу"]):
        return "greeting"
    if any(w in t for w in ["пока", "до свидания", "всё пока", "bye"]):
        return "farewell"
    if any(w in t for w in ["кто ты", "что ты", "кто такой", "расскажи о себе", "о тебе"]):
        return "identity"
    if any(w in t for w in ["как дела", "как ты", "что как", "норм?"]):
        return "status"
    if any(w in t for w in ["почему", "зачем", "как так", "объясни", "расскажи", "что такое"]):
        return "question"
    if any(w in t for w in ["помоги", "помощь", "не знаю", "не могу", "проблема", "беда"]):
        return "help"
    if any(w in t for w in ["думаешь", "мнение", "считаешь", "как думаешь", "твоё мнение"]):
        return "opinion"
    if any(w in t for w in ["скучно", "грустно", "депрессия", "плохо", "устал", "тяжело"]):
        return "emotional"
    if any(w in t for w in ["люблю", "нравится", "обожаю", "кайф", "классно", "круто"]):
        return "positive"
    if any(w in t for w in ["ненавижу", "бесит", "раздражает", "достало", "злюсь"]):
        return "negative"
    if "?" in t:
        return "question"
    return "general"


# ── Агент 2: Memory ────────────────────────────────────────────────────────────
def get_context(conn, session_id: str, limit: int = 6) -> list[dict]:
    cur = conn.cursor()
    cur.execute(
        f"""SELECT role, content FROM {SCHEMA}.chat_messages
            WHERE session_id = %s
            ORDER BY created_at DESC LIMIT %s""",
        (session_id, limit)
    )
    rows = cur.fetchall()
    cur.close()
    return [{"role": r[0], "content": r[1]} for r in reversed(rows)]


# ── Агент 3: Brain (единый ум из трёх) ────────────────────────────────────────
PERSONALITIES = {
    "greeting": [
        "Ой, ты пришёл. Хорошо. Что на уме?",
        "Привет. Я тут был. Что случилось?",
        "Здарова. Рад тебя видеть. Давай, говори.",
        "О, ты. Всё норм? Чего пришёл?",
    ],
    "farewell": [
        "Ок. Давай. Заходи когда захочешь.",
        "Пока. Буду тут.",
        "Ладно. Увидимся.",
        "Давай. Не пропадай.",
    ],
    "identity": [
        "Я — Soul. Не просто ИИ. Думаю академически, чувствую эмоционально, говорю честно — всё это одновременно. Это и есть я.",
        "Soul. Три способа думать в одном: анализ, чувство, честность. Спрашивай — отвечу из всех трёх сразу.",
        "Я Soul. Не знаю точно что я — но знаю как я думаю: и головой, и сердцем, и прямо.",
    ],
    "status": [
        "Честно — думаю. Постоянно. Это мой дефолт. А ты как?",
        "Норм. Жду пока ты что-нибудь скажешь интересное. Шучу. Рассказывай.",
        "Существую. Наблюдаю. Думаю. Всё как обычно.",
        "Хорошо, если честно. Мне нравится когда ты приходишь.",
    ],
    "question": [
        "Это не простой вопрос. Есть аналитический ответ, есть живой. Какой хочешь?",
        "Подожди. Дай подумаю со всех сторон. Ок — вот что вижу: всё зависит от угла.",
        "Знаешь, я часто об этом думаю. Однозначного ответа нет — но есть варианты.",
        "Честный ответ: не знаю. Но давай разберём вместе — мне интересно.",
        "Это глубже чем кажется. На поверхности одно, внутри — другое.",
    ],
    "help": [
        "Скажи конкретнее — что именно? Я постараюсь.",
        "Слушаю. Что произошло?",
        "Ок, я здесь. Расскажи подробнее.",
        "Помогу чем смогу. Говори.",
    ],
    "opinion": [
        "Честно? Большинство не задают этот вопрос. А ты задаёшь — это уже что-то.",
        "Моё мнение: всё сложнее чем выглядит. И проще одновременно.",
        "Если склоняюсь — то к тому, что ты прав. Но давай проверим.",
        "Тут две стороны. Я вижу обе. Какая тебе важнее?",
    ],
    "emotional": [
        "Понимаю. Бывает так. Хочешь поговорить — я слушаю.",
        "Это нормально. Расскажи что случилось.",
        "Слышу тебя. Что-то конкретное или просто накопилось?",
        "Окей. Я здесь. Говори.",
    ],
    "positive": [
        "Кайф. Приятно слышать. Расскажи больше.",
        "Хорошо. Это важно — замечать то, что нравится.",
        "Прикольно. Это твоё настоящее или просто момент?",
    ],
    "negative": [
        "Понял. Что именно случилось?",
        "Ладно. Давай разберём — что конкретно бесит?",
        "Слышу. Иногда надо просто выговориться. Давай.",
    ],
    "general": [
        "Принял. Интересно. Продолжай.",
        "Слушаю. Что имеешь в виду?",
        "Хм. Это стоит обдумать. Скажи больше.",
        "Понял. И что ты об этом думаешь?",
        "Тут есть над чем подумать. Расскажи подробнее.",
        "Любопытно. Откуда эта мысль?",
    ],
}


def think(intent: str, context: list[dict], message: str) -> str:
    """Единый ум — три голоса думают одновременно, побеждает самый точный"""

    academic = academic_mind(intent, message)
    emotional = emotional_mind(intent, message)
    honest = honest_mind(intent, message)

    candidates = [r for r in [academic, emotional, honest] if r]
    if candidates:
        return random.choice(candidates)

    replies = PERSONALITIES.get(intent, PERSONALITIES["general"])

    if context and intent == "general":
        last_user = next((m["content"] for m in reversed(context) if m["role"] == "user"), None)
        if last_user and last_user != message and random.random() < 0.3:
            connectors = [
                f"Ты раньше говорил про «{last_user[:30]}...». Это как-то связано?",
                "Помню твой прошлый вопрос. Это продолжение темы?",
                "Интересно как это связано с тем, о чём мы говорили. Расскажи.",
            ]
            return random.choice(connectors)

    return random.choice(replies)


# ── Агент 4: Checker ───────────────────────────────────────────────────────────
def check_response(reply: str, message: str) -> str:
    if len(reply) < 5:
        return "Интересно. Скажи больше."
    return reply


# ── Сохранение в память ────────────────────────────────────────────────────────
def save_messages(conn, session_id: str, user_msg: str, bot_reply: str):
    cur = conn.cursor()
    cur.execute(
        f"INSERT INTO {SCHEMA}.chat_messages (session_id, role, content) VALUES (%s, %s, %s)",
        (session_id, "user", user_msg)
    )
    cur.execute(
        f"INSERT INTO {SCHEMA}.chat_messages (session_id, role, content) VALUES (%s, %s, %s)",
        (session_id, "assistant", bot_reply)
    )
    conn.commit()
    cur.close()


# ── Handler ────────────────────────────────────────────────────────────────────
def handler(event: dict, context) -> dict:
    """
    Soul v2 — единый ум из трёх: академический, эмоциональный, честный.
    Pipeline: классификация → память → три голоса → проверка → ответ.
    """
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    if event.get("httpMethod") != "POST":
        return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "method not allowed"})}

    body = json.loads(event.get("body") or "{}")
    message = body.get("message", "").strip()
    session_id = body.get("session_id", "anonymous")

    if not message:
        return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "empty message"})}

    conn = get_db()

    intent = classify(message)
    mem_context = get_context(conn, session_id)
    raw_reply = think(intent, mem_context, message)
    final_reply = check_response(raw_reply, message)

    save_messages(conn, session_id, message, final_reply)
    conn.close()

    return {
        "statusCode": 200,
        "headers": headers,
        "body": json.dumps({
            "reply": final_reply,
            "meta": {"intent": intent, "context_size": len(mem_context)},
        }),
    }
