UPDATE t_p30358746_hospital_website_red.doctors SET photo_url = CASE photo_url
 WHEN 'http://цгмб.рф/img/ancif.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/1182eca6-3f9e-4cbd-815a-1a1f12c71a20.jpg'
 WHEN 'http://цгмб.рф/img/belosor.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/045c07b2-b10f-4cc6-9c9e-b5dd88466bb4.jpg'
 WHEN 'http://цгмб.рф/img/chepur.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/d5c026d8-ff47-45a7-8fae-90c995242c7e.jpg'
 WHEN 'http://цгмб.рф/img/djach.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/968adf5e-71ac-4312-a26e-4c9f80470c86.jpg'
 WHEN 'http://цгмб.рф/img/doroshenko.jpg' THEN 'https://cdn.poehali.dev/projects/317e44da-9a2a-46c7-91b6-a5c7dee19b28/bucket/5e1441f0-450c-46fd-b457-a250330c06fb.jpg'
END
WHERE photo_url IN ('http://цгмб.рф/img/ancif.jpg','http://цгмб.рф/img/belosor.jpg','http://цгмб.рф/img/chepur.jpg','http://цгмб.рф/img/djach.jpg','http://цгмб.рф/img/doroshenko.jpg');