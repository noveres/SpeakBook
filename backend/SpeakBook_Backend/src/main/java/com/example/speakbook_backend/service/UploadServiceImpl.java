package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.UploadResponse;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class UploadServiceImpl implements UploadService {

    private static final String CATBOX_API_URL = "https://catbox.moe/user/api.php";

    @Override
    public UploadResponse uploadToCatbox(MultipartFile file) throws Exception {
        try {
            // 創建 RestTemplate
            RestTemplate restTemplate = new RestTemplate();

            // 準備請求頭
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            // 準備請求體
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("reqtype", "fileupload");
            
            // 將 MultipartFile 轉換為 ByteArrayResource
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("fileToUpload", fileResource);

            // 創建請求實體
            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 發送請求到 Catbox.moe
            ResponseEntity<String> response = restTemplate.exchange(
                CATBOX_API_URL,
                HttpMethod.POST,
                requestEntity,
                String.class
            );

            // 處理響應
            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                String imageUrl = response.getBody().trim();
                
                // 驗證返回的 URL
                if (imageUrl.isEmpty() || !imageUrl.startsWith("http")) {
                    throw new Exception("Catbox 返回無效的 URL");
                }

                // 返回結果
                return new UploadResponse(imageUrl, file.getOriginalFilename());
            } else {
                throw new Exception("Catbox 上傳失敗，狀態碼：" + response.getStatusCode());
            }

        } catch (Exception e) {
            throw new Exception("上傳到 Catbox 失敗：" + e.getMessage(), e);
        }
    }
}
