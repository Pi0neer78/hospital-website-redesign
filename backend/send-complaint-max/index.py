import json
import os
import urllib.request
import urllib.error
from datetime import datetime
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    """Отправка ответа на жалобу пациенту через мессенджер MAX (GREEN-API)"""
    method = event.get('httpMethod', 'POST')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }

    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Метод не поддерживается'}),
            'isBase64Encoded': False
        }

    body = json.loads(event.get('body', '{}'))
    phone = body.get('phone', '').strip()
    complaint_date = body.get('complaint_date')
    complaint_message = body.get('complaint_message')
    comment = body.get('comment')

    if not phone or not complaint_message or not comment:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Необходимо указать телефон, текст жалобы и комментарий'}),
            'isBase64Encoded': False
        }

    green_api_instance_id = os.environ.get('GREEN_API_INSTANCE_ID')
    green_api_token = os.environ.get('GREEN_API_TOKEN')

    if not green_api_instance_id or not green_api_token:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Настройки GREEN-API не указаны'}),
            'isBase64Encoded': False
        }

    clean_phone = ''.join(filter(str.isdigit, phone))
    if len(clean_phone) < 10:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Некорректный номер телефона'}),
            'isBase64Encoded': False
        }

    formatted_date = ''
    if complaint_date:
        try:
            dt = datetime.fromisoformat(complaint_date.replace('Z', '+00:00'))
            formatted_date = dt.strftime('%d.%m.%Y')
        except Exception:
            formatted_date = complaint_date

    message_text = f"Уважаемый пациент!\n\nНа ваше обращение от {formatted_date}:\n\n\"{complaint_message}\"\n\nСообщаем:\n{comment}\n\nС уважением,\nАдминистрация ГБУЗ АЦГМБ ЛНР"

    chat_id = f"{clean_phone}@c.us"
    request_data = json.dumps({
        'chatId': chat_id,
        'message': message_text
    }).encode('utf-8')

    url = f'https://api.green-api.com/v3/waInstance{green_api_instance_id}/sendMessage/{green_api_token}'

    req = urllib.request.Request(
        url,
        data=request_data,
        headers={'Content-Type': 'application/json'},
        method='POST'
    )

    with urllib.request.urlopen(req, timeout=15) as response:
        result = json.loads(response.read().decode('utf-8'))
        print(f"GREEN-API Response: {result}")

    sent_at = datetime.now().isoformat()

    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({
            'success': True,
            'sent_at': sent_at,
            'message_id': result.get('idMessage', '')
        }),
        'isBase64Encoded': False
    }