"""Галерея: управление разделами, изображениями (S3) и настройками задержки."""
import json
import os
import uuid
import base64
import psycopg2
import boto3

CORS_HEADERS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Id',
}

def get_db():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_s3():
    return boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

def ok(data):
    return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': json.dumps(data, ensure_ascii=False)}

def err(msg, code=400):
    return {'statusCode': code, 'headers': CORS_HEADERS, 'body': json.dumps({'error': msg}, ensure_ascii=False)}

def verify_admin(headers, params, body):
    admin_id = (
        headers.get('X-Admin-Id') or
        params.get('admin_id') or
        (body.get('admin_id') if isinstance(body, dict) else None)
    )
    if not admin_id:
        return False
    conn = get_db()
    cur = conn.cursor()
    cur.execute("SELECT id FROM admins WHERE id = %s AND is_active = TRUE", (int(admin_id),))
    row = cur.fetchone()
    conn.close()
    return row is not None

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS_HEADERS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    params = event.get('queryStringParameters') or {}
    action = params.get('action', '')
    headers = event.get('headers') or {}
    body_raw = event.get('body') or '{}'
    try:
        body = json.loads(body_raw)
    except Exception:
        body = {}

    # GET /gallery?action=images&section=N — публичный
    if method == 'GET' and action == 'images':
        section = params.get('section')
        if not section:
            return err('section required')
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "SELECT id, image_url, sort_order FROM gallery_images WHERE section_number = %s ORDER BY sort_order, id",
            (int(section),)
        )
        rows = cur.fetchall()
        cur.execute("SELECT slide_delay FROM gallery_settings WHERE section_number = %s", (int(section),))
        setting = cur.fetchone()
        conn.close()
        return ok({
            'images': [{'id': r[0], 'url': r[1], 'sort_order': r[2]} for r in rows],
            'slide_delay': setting[0] if setting else 5,
        })

    # GET /gallery?action=all_images&admin_id=N
    if method == 'GET' and action == 'all_images':
        if not verify_admin(headers, params, body):
            return err('Unauthorized', 401)
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT id, section_number, image_url, sort_order FROM gallery_images ORDER BY section_number, sort_order, id")
        rows = cur.fetchall()
        cur.execute("SELECT section_number, slide_delay FROM gallery_settings ORDER BY section_number")
        settings = cur.fetchall()
        conn.close()
        return ok({
            'images': [{'id': r[0], 'section': r[1], 'url': r[2], 'sort_order': r[3]} for r in rows],
            'settings': {str(s[0]): s[1] for s in settings},
        })

    # POST /gallery?action=upload
    if method == 'POST' and action == 'upload':
        if not verify_admin(headers, params, body):
            return err('Unauthorized', 401)
        section = body.get('section')
        image_data = body.get('image_data')
        content_type = body.get('content_type', 'image/jpeg')
        if not section or not image_data:
            return err('section and image_data required')
        ext = 'jpg' if 'jpeg' in content_type else content_type.split('/')[-1]
        file_key = f"gallery/section_{section}/{uuid.uuid4()}.{ext}"
        raw = base64.b64decode(image_data)
        s3 = get_s3()
        s3.put_object(Bucket='files', Key=file_key, Body=raw, ContentType=content_type)
        cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{file_key}"
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "INSERT INTO gallery_images (section_number, image_url, file_key) VALUES (%s, %s, %s) RETURNING id",
            (int(section), cdn_url, file_key)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        conn.close()
        return ok({'id': new_id, 'url': cdn_url})

    # DELETE /gallery?action=delete&id=N&admin_id=N
    if method == 'DELETE' and action == 'delete':
        if not verify_admin(headers, params, body):
            return err('Unauthorized', 401)
        img_id = params.get('id')
        if not img_id:
            return err('id required')
        conn = get_db()
        cur = conn.cursor()
        cur.execute("SELECT file_key FROM gallery_images WHERE id = %s", (int(img_id),))
        row = cur.fetchone()
        if not row:
            conn.close()
            return err('not found', 404)
        file_key = row[0]
        cur.execute("DELETE FROM gallery_images WHERE id = %s", (int(img_id),))
        conn.commit()
        conn.close()
        try:
            s3 = get_s3()
            s3.delete_object(Bucket='files', Key=file_key)
        except Exception:
            pass
        return ok({'deleted': True})

    # POST /gallery?action=set_delay
    if method == 'POST' and action == 'set_delay':
        if not verify_admin(headers, params, body):
            return err('Unauthorized', 401)
        section = body.get('section')
        delay = body.get('delay')
        if not section or delay is None:
            return err('section and delay required')
        delay = max(1, min(30, int(delay)))
        conn = get_db()
        cur = conn.cursor()
        cur.execute(
            "UPDATE gallery_settings SET slide_delay = %s, updated_at = NOW() WHERE section_number = %s",
            (delay, int(section))
        )
        conn.commit()
        conn.close()
        return ok({'updated': True, 'delay': delay})

    return err('Unknown action', 404)
