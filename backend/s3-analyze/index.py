import json
import os
import boto3


def human_size(n: int) -> str:
    size = float(n)
    for unit in ['Б', 'КБ', 'МБ', 'ГБ', 'ТБ']:
        if size < 1024:
            return f"{size:.1f} {unit}"
        size /= 1024
    return f"{size:.1f} ПБ"


def handler(event: dict, context) -> dict:
    """
    Диагностика S3-хранилища: считает объём файлов по папкам верхнего уровня.
    GET / - возвращает суммарный размер и разбивку по префиксам первого уровня
    """
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': {'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type', 'Access-Control-Max-Age': '86400'}, 'body': ''}

    s3 = boto3.client(
        's3',
        endpoint_url='https://bucket.poehali.dev',
        aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
        aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
    )

    folder_stats = {}
    total_bytes = 0
    total_files = 0
    debug_pages = 0
    debug_raw_first_page = None

    continuation_token = None
    while True:
        kwargs = {'Bucket': 'files'}
        if continuation_token:
            kwargs['ContinuationToken'] = continuation_token
        page = s3.list_objects_v2(**kwargs)
        debug_pages += 1
        if debug_raw_first_page is None:
            debug_raw_first_page = {'KeyCount': page.get('KeyCount'), 'IsTruncated': page.get('IsTruncated'), 'Name': page.get('Name')}
        for obj in page.get('Contents', []):
            key = obj['Key']
            size = obj['Size']
            total_bytes += size
            total_files += 1
            top = key.split('/')[0] if '/' in key else '(корень)'
            if top not in folder_stats:
                folder_stats[top] = {'bytes': 0, 'files': 0}
            folder_stats[top]['bytes'] += size
            folder_stats[top]['files'] += 1
        if page.get('IsTruncated'):
            continuation_token = page.get('NextContinuationToken')
        else:
            break

    folders = sorted(
        [
            {'prefix': k, 'size_bytes': v['bytes'], 'size_human': human_size(v['bytes']), 'files': v['files']}
            for k, v in folder_stats.items()
        ],
        key=lambda x: x['size_bytes'],
        reverse=True,
    )

    return {
        'statusCode': 200,
        'headers': {'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json'},
        'body': json.dumps({
            'total_size_bytes': total_bytes,
            'total_size_human': human_size(total_bytes),
            'total_files': total_files,
            'folders': folders,
            'debug_pages': debug_pages,
            'debug_first_page': debug_raw_first_page,
        }, ensure_ascii=False),
    }