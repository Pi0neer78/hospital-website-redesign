-- Добавление поля images в таблицу forum_posts для хранения массива URL картинок
ALTER TABLE forum_posts ADD COLUMN IF NOT EXISTS images TEXT DEFAULT '[]';

-- Комментарий к полю
COMMENT ON COLUMN forum_posts.images IS 'JSON array of image URLs attached to the post';