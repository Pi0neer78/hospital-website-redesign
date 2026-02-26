import json
import os
import boto3

def handler(event: dict, context) -> dict:
    """
    Получить список файлов из S3 папки Врачи
    GET / - список всех файлов в папке Врачи/
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY']
    )

    response = s3.list_objects_v2(Bucket='files', Prefix='Врачи/')
    
    files = []
    for obj in response.get('Contents', []):
        key = obj['Key']
        filename = key.split('/')[-1]
        if filename and not filename.endswith('/'):
            cdn_url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            files.append({'key': key, 'filename': filename, 'url': cdn_url})

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({'files': files}, ensure_ascii=False)
    }
