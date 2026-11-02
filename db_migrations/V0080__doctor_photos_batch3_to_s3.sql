UPDATE t_p30358746_hospital_website_red.doctors SET photo_url = CASE photo_url
 WHEN 'http://цгмб.рф/img/guryl.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/094360a4-7c31-491d-8957-104e3f0bb7d1.jpg'
 WHEN 'http://цгмб.рф/img/horoshko.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/212fbd7d-edac-4309-b761-71ebf1055a80.jpg'
 WHEN 'http://цгмб.рф/img/kiber.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/6a8e24f8-8152-47a7-8c00-923ac43f3c56.jpg'
 WHEN 'http://цгмб.рф/img/klekacuk.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/36029fb2-d8e9-4d4f-b35f-1ff08c7a4b47.jpg'
 WHEN 'http://цгмб.рф/img/kosova.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/4a870230-ff5c-4eb0-bd63-f9afc5b8c1df.jpg'
END
WHERE photo_url IN ('http://цгмб.рф/img/guryl.jpg','http://цгмб.рф/img/horoshko.jpg','http://цгмб.рф/img/kiber.jpg','http://цгмб.рф/img/klekacuk.jpg','http://цгмб.рф/img/kosova.jpg');