"""Управление информационной стеной больницы: разделы, темы, посты."""
import json
import os
import psycopg2
import base64
import boto3
import uuid

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Authorization',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def resp(status, body):
    return {'statusCode': status, 'headers': {**CORS, 'Content-Type': 'application/json'}, 'body': json.dumps(body, ensure_ascii=False, default=str)}

def upload_image(b64data, content_type='image/jpeg'):
    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )
    key_id = os.environ['AWS_ACCESS_KEY_ID']
    ext = content_type.split('/')[-1].replace('jpeg', 'jpg')
    filename = f"infowall/{uuid.uuid4()}.{ext}"
    data = base64.b64decode(b64data)
    s3.put_object(Bucket='files', Key=filename, Body=data, ContentType=content_type)
    return f"https://cdn.poehali.dev/projects/{key_id}/bucket/{filename}"

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    body = {}
    if event.get('body'):
        body = json.loads(event['body'])

    conn = get_conn()
    cur = conn.cursor()

    # ───── РАЗДЕЛЫ ─────
    if action == 'get_sections':
        cur.execute("SELECT id, title, description, sort_order, created_at, updated_at FROM infowall_sections ORDER BY sort_order, id")
        rows = cur.fetchall()
        sections = [{'id': r[0], 'title': r[1], 'description': r[2], 'sort_order': r[3], 'created_at': r[4], 'updated_at': r[5]} for r in rows]
        return resp(200, {'sections': sections})

    if action == 'create_section' and method == 'POST':
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        sort_order = body.get('sort_order', 0)
        if not title:
            return resp(400, {'error': 'Название обязательно'})
        cur.execute("INSERT INTO infowall_sections (title, description, sort_order) VALUES (%s, %s, %s) RETURNING id", (title, description, sort_order))
        new_id = cur.fetchone()[0]
        conn.commit()
        return resp(200, {'success': True, 'id': new_id})

    if action == 'update_section' and method == 'PUT':
        section_id = body.get('id')
        title = body.get('title', '').strip()
        description = body.get('description', '').strip()
        sort_order = body.get('sort_order', 0)
        if not section_id or not title:
            return resp(400, {'error': 'id и название обязательны'})
        cur.execute("UPDATE infowall_sections SET title=%s, description=%s, sort_order=%s, updated_at=NOW() WHERE id=%s", (title, description, sort_order, section_id))
        conn.commit()
        return resp(200, {'success': True})

    if action == 'delete_section' and method == 'POST':
        section_id = body.get('id')
        if not section_id:
            return resp(400, {'error': 'id обязателен'})
        cur.execute("UPDATE infowall_posts SET content=content WHERE topic_id IN (SELECT id FROM infowall_topics WHERE section_id=%s)", (section_id,))
        cur.execute("UPDATE infowall_topics SET updated_at=NOW() WHERE section_id=%s", (section_id,))
        cur.execute("UPDATE infowall_sections SET updated_at=NOW() WHERE id=%s", (section_id,))
        conn.commit()
        cur.execute("SELECT id FROM infowall_topics WHERE section_id=%s", (section_id,))
        topic_ids = [r[0] for r in cur.fetchall()]
        for tid in topic_ids:
            cur.execute("DELETE FROM infowall_posts WHERE topic_id=%s", (tid,))
        if topic_ids:
            cur.execute("DELETE FROM infowall_topics WHERE section_id=%s", (section_id,))
        cur.execute("DELETE FROM infowall_sections WHERE id=%s", (section_id,))
        conn.commit()
        return resp(200, {'success': True})

    # ───── ТЕМЫ ─────
    if action == 'get_topics':
        section_id = params.get('section_id')
        if section_id:
            cur.execute("SELECT id, section_id, title, sort_order, created_at, updated_at FROM infowall_topics WHERE section_id=%s ORDER BY sort_order, id", (section_id,))
        else:
            cur.execute("SELECT id, section_id, title, sort_order, created_at, updated_at FROM infowall_topics ORDER BY sort_order, id")
        rows = cur.fetchall()
        topics = [{'id': r[0], 'section_id': r[1], 'title': r[2], 'sort_order': r[3], 'created_at': r[4], 'updated_at': r[5]} for r in rows]
        return resp(200, {'topics': topics})

    if action == 'create_topic' and method == 'POST':
        section_id = body.get('section_id')
        title = body.get('title', '').strip()
        sort_order = body.get('sort_order', 0)
        if not section_id or not title:
            return resp(400, {'error': 'section_id и название обязательны'})
        cur.execute("INSERT INTO infowall_topics (section_id, title, sort_order) VALUES (%s, %s, %s) RETURNING id", (section_id, title, sort_order))
        new_id = cur.fetchone()[0]
        conn.commit()
        return resp(200, {'success': True, 'id': new_id})

    if action == 'update_topic' and method == 'PUT':
        topic_id = body.get('id')
        title = body.get('title', '').strip()
        sort_order = body.get('sort_order', 0)
        if not topic_id or not title:
            return resp(400, {'error': 'id и название обязательны'})
        cur.execute("UPDATE infowall_topics SET title=%s, sort_order=%s, updated_at=NOW() WHERE id=%s", (title, sort_order, topic_id))
        conn.commit()
        return resp(200, {'success': True})

    if action == 'delete_topic' and method == 'POST':
        topic_id = body.get('id')
        if not topic_id:
            return resp(400, {'error': 'id обязателен'})
        cur.execute("DELETE FROM infowall_posts WHERE topic_id=%s", (topic_id,))
        cur.execute("DELETE FROM infowall_topics WHERE id=%s", (topic_id,))
        conn.commit()
        return resp(200, {'success': True})

    # ───── ПОСТЫ ─────
    if action == 'get_posts':
        topic_id = params.get('topic_id')
        if not topic_id:
            return resp(400, {'error': 'topic_id обязателен'})
        cur.execute("SELECT id, topic_id, content, sort_order, created_at, updated_at FROM infowall_posts WHERE topic_id=%s ORDER BY sort_order, id", (topic_id,))
        rows = cur.fetchall()
        posts = [{'id': r[0], 'topic_id': r[1], 'content': r[2], 'sort_order': r[3], 'created_at': r[4], 'updated_at': r[5]} for r in rows]
        return resp(200, {'posts': posts})

    if action == 'create_post' and method == 'POST':
        topic_id = body.get('topic_id')
        content = body.get('content', '').strip()
        sort_order = body.get('sort_order', 0)
        if not topic_id or not content:
            return resp(400, {'error': 'topic_id и content обязательны'})
        cur.execute("INSERT INTO infowall_posts (topic_id, content, sort_order) VALUES (%s, %s, %s) RETURNING id", (topic_id, content, sort_order))
        new_id = cur.fetchone()[0]
        conn.commit()
        return resp(200, {'success': True, 'id': new_id})

    if action == 'update_post' and method == 'PUT':
        post_id = body.get('id')
        content = body.get('content', '').strip()
        if not post_id or not content:
            return resp(400, {'error': 'id и content обязательны'})
        cur.execute("UPDATE infowall_posts SET content=%s, updated_at=NOW() WHERE id=%s", (content, post_id))
        conn.commit()
        return resp(200, {'success': True})

    if action == 'delete_post' and method == 'POST':
        post_id = body.get('id')
        if not post_id:
            return resp(400, {'error': 'id обязателен'})
        cur.execute("DELETE FROM infowall_posts WHERE id=%s", (post_id,))
        conn.commit()
        return resp(200, {'success': True})

    # ───── ЗАГРУЗКА ИЗОБРАЖЕНИЙ ─────
    if action == 'upload_image' and method == 'POST':
        b64 = body.get('image_base64', '')
        content_type = body.get('content_type', 'image/jpeg')
        if not b64:
            return resp(400, {'error': 'image_base64 обязателен'})
        url = upload_image(b64, content_type)
        return resp(200, {'success': True, 'url': url})

    # ───── ПОЛНАЯ ВЫГРУЗКА ДЛЯ ПУБЛИЧНОЙ СТРАНИЦЫ ─────
    if action == 'get_all':
        cur.execute("SELECT id, title, description, sort_order FROM infowall_sections ORDER BY sort_order, id")
        sections = [{'id': r[0], 'title': r[1], 'description': r[2], 'sort_order': r[3], 'topics': []} for r in cur.fetchall()]
        if sections:
            cur.execute("SELECT id, section_id, title, sort_order FROM infowall_topics ORDER BY sort_order, id")
            topics_raw = cur.fetchall()
            cur.execute("SELECT id, topic_id, content, sort_order FROM infowall_posts ORDER BY sort_order, id")
            posts_raw = cur.fetchall()
            posts_by_topic = {}
            for p in posts_raw:
                posts_by_topic.setdefault(p[1], []).append({'id': p[0], 'content': p[2], 'sort_order': p[3]})
            topics_by_section = {}
            for t in topics_raw:
                topics_by_section.setdefault(t[1], []).append({'id': t[0], 'title': t[2], 'sort_order': t[3], 'posts': posts_by_topic.get(t[0], [])})
            for s in sections:
                s['topics'] = topics_by_section.get(s['id'], [])
        return resp(200, {'sections': sections})

    return resp(404, {'error': 'Неизвестное действие'})
