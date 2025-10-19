package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.UploadResponse;
import org.springframework.web.multipart.MultipartFile;

public interface UploadService {

    /**
     * 上傳圖片到 Catbox.moe
     * @param file 圖片檔案
     * @return UploadResponse 包含圖片 URL 和檔案名
     */
    UploadResponse uploadToCatbox(MultipartFile file) throws Exception;
}
