-- 情绪字典
INSERT INTO emotion_tag (id, code, name, polarity, sort_order, is_enabled) VALUES
(1, 'JOY', '喜悦', 1, 10, 1),
(2, 'CALM', '平静', 0, 20, 1),
(3, 'HOPE', '希望', 1, 30, 1),
(4, 'SAD', '难过', -1, 40, 1),
(5, 'ANGER', '愤怒', -1, 50, 1),
(6, 'ANXIETY', '焦虑', -1, 60, 1),
(7, 'FEAR', '害怕', -1, 70, 1),
(8, 'GUILT', '内疚', -1, 80, 1);

-- 事件字典
INSERT INTO event_type (id, code, name, sort_order, is_enabled) VALUES
(1, 'STUDY', '学业', 10, 1),
(2, 'WORK', '工作', 20, 1),
(3, 'FAMILY', '家庭', 30, 1),
(4, 'FRIEND', '朋友', 40, 1),
(5, 'LOVE', '亲密关系', 50, 1),
(6, 'HEALTH', '健康', 60, 1),
(7, 'FINANCE', '金钱', 70, 1),
(8, 'OTHER', '其他', 999, 1);

-- 测试用户
INSERT INTO app_user (id, username, password_hash, is_deleted, created_at, updated_at) VALUES
(1, 'test', '$2a$10$uYSTvbb./YVswqkwnrZn8un8Ls2xOpHkio2LxhB0JtgpjBNQrd3Vu', 0, NOW(), NOW());