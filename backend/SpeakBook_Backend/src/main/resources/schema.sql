-- 教材表
CREATE TABLE IF NOT EXISTS books (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '教材標題',
    author VARCHAR(100) COMMENT '作者',
    description TEXT COMMENT '教材描述',
    category VARCHAR(50) COMMENT '分類',
    pages INT DEFAULT 0 COMMENT '頁數',
    target_age VARCHAR(20) COMMENT '適用年齡',
    difficulty VARCHAR(20) COMMENT '難度等級',
    cover_image_url VARCHAR(500) COMMENT '圖片URL',
    status VARCHAR(20) DEFAULT 'draft' COMMENT '狀態：draft/published',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    published_at DATETIME NULL COMMENT '發布時間',
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教材主表';

-- 熱區表
CREATE TABLE IF NOT EXISTS hotspots (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    book_id BIGINT NOT NULL COMMENT '教材ID',
    label VARCHAR(100) NOT NULL COMMENT '熱區標籤',
    x INT NOT NULL COMMENT 'X座標',
    y INT NOT NULL COMMENT 'Y座標',
    width INT NOT NULL COMMENT '寬度',
    height INT NOT NULL COMMENT '高度',
    audio_url VARCHAR(500) COMMENT '音訊URL',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='熱區表';
