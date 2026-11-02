UPDATE t_p30358746_hospital_website_red.doctors SET photo_url = CASE photo_url
 WHEN 'http://цгмб.рф/img/emcev.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/2bca3563-9caa-4085-980b-d82db9ea4dc5.jpg'
 WHEN 'http://цгмб.рф/img/finog.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/768a6c68-1f19-4bad-a9f0-941a8453eed9.jpg'
 WHEN 'http://цгмб.рф/img/gajterova.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/a16dacb6-9c58-408a-9a3d-36a6ed425df2.jpg'
 WHEN 'http://цгмб.рф/img/gasanova.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/158290f2-6ecb-44c5-be07-d60a34f89361.jpg'
 WHEN 'http://цгмб.рф/img/german.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/b1aad56f-1f6e-4952-a9c3-ad802fb89f0c.jpg'
END
WHERE photo_url IN ('http://цгмб.рф/img/emcev.jpg','http://цгмб.рф/img/finog.jpg','http://цгмб.рф/img/gajterova.jpg','http://цгмб.рф/img/gasanova.jpg','http://цгмб.рф/img/german.jpg');