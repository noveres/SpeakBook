package com.example.speakbook_backend.controller;

import com.example.speakbook_backend.Response;
import com.example.speakbook_backend.dto.UploadResponse;
import com.example.speakbook_backend.service.UploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    @Autowired
    private UploadService uploadService;

    /**
     * 上傳圖片到 Catbox.moe
     * POST /api/upload/image
     */
    @PostMapping("/image")
    public Response<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 驗證檔案
            if (file.isEmpty()) {
                return Response.newFail("請選擇要上傳的圖片");
            }

            // 驗證檔案類型
            String contentType = file.getContentType();
            if (contentType == null || !isValidImageType(contentType)) {
                return Response.newFail("不支援的圖片格式，請上傳 JPG、PNG、GIF 或 WebP 格式");
            }

            // 驗證檔案大小（20MB）
            long maxSize = 20 * 1024 * 1024; // 20MB
            if (file.getSize() > maxSize) {
                return Response.newFail("圖片檔案過大，請上傳小於 20MB 的圖片");
            }

            // 上傳到 Catbox.moe
            UploadResponse uploadResponse = uploadService.uploadToCatbox(file);
            return Response.newSuccess(uploadResponse);

        } catch (Exception e) {
            return Response.newFail("圖片上傳失敗：" + e.getMessage());
        }
    }

    /**
     * 驗證圖片類型
     */
    private boolean isValidImageType(String contentType) {
        return contentType.equals("image/jpeg") ||
               contentType.equals("image/jpg") ||
               contentType.equals("image/png") ||
               contentType.equals("image/gif") ||
               contentType.equals("image/webp");
    }
}
