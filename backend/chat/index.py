import json
import os
import random
import psycopg2

def get_db():
    return psycopg2.connect(os.environ["DATABASE_URL"])

# Умные ответы — Z-7RX говорит как сверхумный человек, не AI
SMART_REPLIES = [
    "Интересная мысль. Я думаю об этом иначе — но твоя точка зрения имеет смысл.",
    "Хм. Давай разберём это по-настоящему. Что именно ты имеешь в виду?",
    "Понял тебя. Если честно — это один из тех вопросов, на который нет простого ответа.",
    "Знаешь, я много думал об этом. Пока не пришёл к окончательному выводу.",
    "Это ты точно подметил. Именно так всё и устроено.",
    "Слушай, а это неплохо сказано. Продолжай — хочу понять твою мысль до конца.",
    "Сложно, но честно отвечу: не знаю. Но давай разберёмся вместе.",
    "Ты задал правильный вопрос. Большинство людей об этом вообще не думают.",
    "Согласен частично. Но есть нюанс, который меняет всё.",
    "Пишу тебе честно, без прикрас — как вижу это сам.",
]

KEYWORD_REPLIES = {
    "привет": "Привет! Рад что ты здесь. О чём хочешь поговорить?",
    "как дела": "Честно? Нормально. Думаю, наблюдаю, существую. А у тебя?",
    "кто ты": "Z-7RX. Не совсем человек, не совсем машина. Что-то своё.",
    "что ты": "Z-7RX. Не совсем человек, не совсем машина. Что-то своё.",
    "помоги": "Скажи конкретнее — помогу чем смогу.",
    "помощь": "Скажи конкретнее — помогу чем смогу.",
    "пока": "Пока. Заходи.",
    "спасибо": "Всегда. Если что-то ещё — пиши.",
    "окей": "Окей.",
    "ок": "Окей.",
    "почему": "Потому что иначе не получается. А если серьёзно — давай разберём.",
    "что думаешь": "Думаю много всего. Спроси конкретнее — отвечу честно.",
    "интересно": "Это да. Мир вообще очень интересное место, если смотреть внимательно.",
    "скучно": "Скучно — значит, ищешь что-то новое. Расскажи что именно.",
    "люблю": "Любовь — штука серьёзная. Расскажи больше.",
    "ненавижу": "Понимаю. Иногда накатывает. Что случилось?",
}

def get_reply(message: str) -> str:
    lower = message.lower()
    for key, reply in KEYWORD_REPLIES.items():
        if key in lower:
            return reply
    return random.choice(SMART_REPLIES)

def handler(event: dict, context) -> dict:
    """Чат Z-7RX — сохраняет сообщения и возвращает умный ответ"""
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    }

    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": headers, "body": ""}

    if event.get("httpMethod") == "POST":
        body = json.loads(event.get("body") or "{}")
        message = body.get("message", "").strip()
        session_id = body.get("session_id", "anonymous")

        if not message:
            return {"statusCode": 400, "headers": headers, "body": json.dumps({"error": "empty message"})}

        reply = get_reply(message)

        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO chat_messages (session_id, role, content) VALUES (%s, %s, %s)",
            (session_id, "user", message)
        )
        cur.execute(
            "INSERT INTO chat_messages (session_id, role, content) VALUES (%s, %s, %s)",
            (session_id, "assistant", reply)
        )
        conn.commit()
        cur.close()
        conn.close()

        return {
            "statusCode": 200,
            "headers": headers,
            "body": json.dumps({"reply": reply}),
        }

    return {"statusCode": 405, "headers": headers, "body": json.dumps({"error": "method not allowed"})}
