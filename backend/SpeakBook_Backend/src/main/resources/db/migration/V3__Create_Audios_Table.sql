-- 創建音訊表
CREATE TABLE IF NOT EXISTS audios (
    id BIGSERIAL PRIMARY KEY,
    original_file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_size BIGINT,
    duration DOUBLE PRECISION,
    mime_type VARCHAR(100),
    uploaded_at TIMESTAMP,
    updated_at TIMESTAMP,
    uploaded_by BIGINT,
    description TEXT,
    tags VARCHAR(500)
);

-- 創建索引
CREATE INDEX idx_audios_uploaded_at ON audios(uploaded_at DESC);
CREATE INDEX idx_audios_uploaded_by ON audios(uploaded_by);
CREATE INDEX idx_audios_original_file_name ON audios(original_file_name);

-- 添加註釋
COMMENT ON TABLE audios IS '音訊檔案表';
COMMENT ON COLUMN audios.id IS '主鍵 ID';
COMMENT ON COLUMN audios.original_file_name IS '原始檔案名稱';
COMMENT ON COLUMN audios.file_url IS '檔案 URL';
COMMENT ON COLUMN audios.file_size IS '檔案大小（bytes）';
COMMENT ON COLUMN audios.duration IS '音訊時長（秒）';
COMMENT ON COLUMN audios.mime_type IS '檔案類型';
COMMENT ON COLUMN audios.uploaded_at IS '上傳時間';
COMMENT ON COLUMN audios.updated_at IS '更新時間';
COMMENT ON COLUMN audios.uploaded_by IS '上傳者 ID';
COMMENT ON COLUMN audios.description IS '音訊描述';
COMMENT ON COLUMN audios.tags IS '標籤（逗號分隔）';
