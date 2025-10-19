# 圖片上傳代理實現說明

## 架構變更

### 之前（前端直接上傳）
```
前端 → Catbox.moe API
```
**問題**: Catbox.moe 不支援前端直接透過 API 上傳（CORS 限制）

### 之後（後端代理）
```
前端 → 後端 API → Catbox.moe API → 返回 URL → 後端 → 前端
```
**優勢**: 
- ✅ 繞過 CORS 限制
- ✅ 後端可以進行額外驗證
- ✅ 統一錯誤處理
- ✅ 可以記錄上傳日誌

## 前端修改

### CatboxUploadService

**文件**: `src/app/core/services/catbox-upload.service.ts`

**修改內容**:
```typescript
// 之前：直接上傳到 Catbox
private readonly CATBOX_API_URL = 'https://catbox.moe/user/api.php';

// 之後：通過後端代理
private readonly UPLOAD_API_URL = '/api/upload/image';
```

**請求格式**:
```typescript
const formData = new FormData();
formData.append('file', file);  // 改為 'file'

// POST /api/upload/image
this.http.post<{ success: boolean; data?: CatboxUploadResponse; errorMsg?: string }>(
  this.UPLOAD_API_URL, 
  formData
)
```

**響應格式**:
```json
{
  "success": true,
  "data": {
    "url": "https://files.catbox.moe/abc123.jpg",
    "fileName": "image.jpg"
  },
  "errorMsg": null
}
```

## 後端實現

### 1. UploadController

**文件**: `controller/UploadController.java`

**端點**: `POST /api/upload/image`

**功能**:
- 接收前端上傳的圖片
- 驗證檔案類型和大小
- 調用 UploadService 上傳到 Catbox
- 返回圖片 URL

**程式碼**:
```java
@PostMapping("/image")
public Response<UploadResponse> uploadImage(@RequestParam("file") MultipartFile file) {
    try {
        // 驗證檔案
        if (file.isEmpty()) {
            return Response.newFail("請選擇要上傳的圖片");
        }

        // 驗證檔案類型
        String contentType = file.getContentType();
        if (!isValidImageType(contentType)) {
            return Response.newFail("不支援的圖片格式");
        }

        // 驗證檔案大小（20MB）
        if (file.getSize() > 20 * 1024 * 1024) {
            return Response.newFail("圖片檔案過大");
        }

        // 上傳到 Catbox.moe
        UploadResponse uploadResponse = uploadService.uploadToCatbox(file);
        return Response.newSuccess(uploadResponse);

    } catch (Exception e) {
        return Response.newFail("圖片上傳失敗：" + e.getMessage());
    }
}
```

### 2. UploadService

**文件**: `service/UploadService.java` 和 `service/UploadServiceImpl.java`

**功能**:
- 使用 RestTemplate 發送請求到 Catbox.moe
- 處理 MultipartFile 轉換
- 返回上傳結果

**程式碼**:
```java
@Override
public UploadResponse uploadToCatbox(MultipartFile file) throws Exception {
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
    HttpEntity<MultiValueMap<String, Object>> requestEntity = 
        new HttpEntity<>(body, headers);

    // 發送請求到 Catbox.moe
    ResponseEntity<String> response = restTemplate.exchange(
        CATBOX_API_URL,
        HttpMethod.POST,
        requestEntity,
        String.class
    );

    // 處理響應
    if (response.getStatusCode() == HttpStatus.OK) {
        String imageUrl = response.getBody().trim();
        return new UploadResponse(imageUrl, file.getOriginalFilename());
    } else {
        throw new Exception("Catbox 上傳失敗");
    }
}
```

### 3. UploadResponse DTO

**文件**: `dto/UploadResponse.java`

```java
public class UploadResponse {
    private String url;
    private String fileName;

    // Getters and Setters
}
```

## 完整流程

### 1. 前端上傳圖片

```typescript
// 用戶選擇圖片
const file: File = event.target.files[0];

// 調用服務上傳
this.catboxUploadService.uploadImage(file).subscribe({
  next: (result) => {
    console.log('圖片 URL:', result.url);
    // result.url = "https://files.catbox.moe/abc123.jpg"
  },
  error: (error) => {
    console.error('上傳失敗:', error.message);
  }
});
```

### 2. 前端發送請求到後端

```
POST /api/upload/image
Content-Type: multipart/form-data

file: [圖片二進制數據]
```

### 3. 後端接收並驗證

```java
// 接收檔案
MultipartFile file = request.getParameter("file");

// 驗證類型和大小
if (!isValidImageType(file.getContentType())) {
    return error;
}
```

### 4. 後端代理上傳到 Catbox

```java
// 使用 RestTemplate 發送請求
POST https://catbox.moe/user/api.php
Content-Type: multipart/form-data

reqtype: "fileupload"
fileToUpload: [圖片二進制數據]
```

### 5. Catbox 返回 URL

```
https://files.catbox.moe/abc123.jpg
```

### 6. 後端返回給前端

```json
{
  "success": true,
  "data": {
    "url": "https://files.catbox.moe/abc123.jpg",
    "fileName": "image.jpg"
  }
}
```

### 7. 前端使用 URL 創建教材

```typescript
const bookData = {
  title: "小紅帽",
  coverImageUrl: "https://files.catbox.moe/abc123.jpg", // 使用上傳得到的 URL
  hotspots: [...]
};

this.bookEditService.createBook(bookData).subscribe(...);
```

## 已創建的文件

### 後端
- ✅ `controller/UploadController.java` - 上傳控制器
- ✅ `service/UploadService.java` - 上傳服務接口
- ✅ `service/UploadServiceImpl.java` - 上傳服務實現
- ✅ `dto/UploadResponse.java` - 上傳響應 DTO

### 前端
- ✅ `catbox-upload.service.ts` - 已修改為通過後端代理

## 測試

### 使用 Postman 測試

```bash
POST http://localhost:8080/api/upload/image
Content-Type: multipart/form-data

file: [選擇圖片檔案]
```

**預期響應**:
```json
{
  "success": true,
  "data": {
    "url": "https://files.catbox.moe/abc123.jpg",
    "fileName": "test.jpg"
  },
  "errorMsg": null
}
```

### 使用 curl 測試

```bash
curl -X POST http://localhost:8080/api/upload/image \
  -F "file=@/path/to/image.jpg"
```

## 錯誤處理

### 前端錯誤

| 錯誤 | 訊息 |
|------|------|
| 檔案類型錯誤 | 不支援的圖片格式，請上傳 JPG、PNG、GIF 或 WebP 格式 |
| 檔案過大 | 圖片檔案過大，請上傳小於 20MB 的圖片 |
| 網絡錯誤 | 圖片上傳失敗：網絡錯誤 |

### 後端錯誤

| 錯誤 | 訊息 |
|------|------|
| 檔案為空 | 請選擇要上傳的圖片 |
| 檔案類型錯誤 | 不支援的圖片格式 |
| 檔案過大 | 圖片檔案過大 |
| Catbox 錯誤 | 上傳到 Catbox 失敗 |

## 配置

### application.properties

```properties
# 檔案上傳配置
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB
```

## 優勢總結

1. **繞過 CORS 限制** - 後端可以直接調用 Catbox API
2. **統一驗證** - 前後端雙重驗證檔案類型和大小
3. **錯誤處理** - 統一的錯誤處理和響應格式
4. **安全性** - 可以在後端添加額外的安全檢查
5. **可擴展** - 未來可以輕鬆切換到其他圖床服務
6. **日誌記錄** - 可以記錄所有上傳操作

## 注意事項

1. **RestTemplate** - Spring Boot 3.x 已內建，無需額外依賴
2. **MultipartFile** - Spring Web 提供，用於處理檔案上傳
3. **ByteArrayResource** - 用於將 MultipartFile 轉換為可發送的資源
4. **CORS** - 已在控制器添加 `@CrossOrigin(origins = "*")`
5. **檔案大小限制** - 前後端都設定為 20MB

## 完成狀態

✅ 前端服務已修改
✅ 後端控制器已創建
✅ 後端服務已實現
✅ DTO 已創建
✅ 錯誤處理已完成
✅ 文檔已完成

現在前端可以通過後端代理成功上傳圖片到 Catbox.moe！
