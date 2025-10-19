# Catbox.moe 圖片上傳集成說明

## 概述

在發布教材前，系統會先將圖片上傳到 Catbox.moe 免費圖床服務，獲取永久 URL 後再提交給後端 API。

## 為什麼使用 Catbox.moe？

### 優勢
- ✅ **完全免費** - 無需註冊，無限制上傳
- ✅ **永久存儲** - 圖片不會過期
- ✅ **無廣告** - 乾淨的圖片 URL
- ✅ **支持大檔案** - 最大支持 200MB
- ✅ **快速穩定** - CDN 加速
- ✅ **簡單 API** - 只需 POST 請求

### 限制
- 單檔案最大 200MB（我們限制為 20MB）
- 支持格式：JPG, PNG, GIF, WebP

## 實現流程

### 1. 用戶操作流程

```
用戶上傳圖片
    ↓
編輯熱區
    ↓
設定資訊
    ↓
點擊「發布教材」
    ↓
【開始上傳流程】
    ↓
上傳圖片到 Catbox.moe
    ↓
獲取圖片 URL
    ↓
準備教材數據（包含 Catbox URL）
    ↓
調用後端 API 創建教材
    ↓
發布成功
```

### 2. 技術流程

```typescript
onPublish() {
  // 1. 驗證
  if (!selectedImage.file) return;
  
  // 2. 上傳到 Catbox
  catboxUploadService.uploadImage(file)
    .subscribe(result => {
      // 3. 獲取 URL
      const imageUrl = result.url; // https://files.catbox.moe/abc123.jpg
      
      // 4. 準備數據
      const bookData = {
        ...settings,
        coverImageUrl: imageUrl, // 使用 Catbox URL
        hotspots: [...]
      };
      
      // 5. 調用後端 API
      bookEditService.createBook(bookData)
        .subscribe(response => {
          // 發布成功
        });
    });
}
```

## CatboxUploadService 實現

### 服務文件
`src/app/core/services/catbox-upload.service.ts`

### 主要方法

#### 1. uploadImage(file: File)

上傳單個圖片到 Catbox.moe

```typescript
uploadImage(file: File): Observable<CatboxUploadResponse> {
  // 驗證檔案類型
  if (!this.isValidImageType(file)) {
    return throwError(() => new Error('不支援的圖片格式'));
  }

  // 驗證檔案大小（20MB）
  if (file.size > 20 * 1024 * 1024) {
    return throwError(() => new Error('圖片檔案過大'));
  }

  // 準備 FormData
  const formData = new FormData();
  formData.append('reqtype', 'fileupload');
  formData.append('fileToUpload', file);

  // 上傳
  return this.http.post(CATBOX_API_URL, formData, {
    responseType: 'text'
  }).pipe(
    map(response => ({
      url: response.trim(), // Catbox 返回純文字 URL
      fileName: file.name
    }))
  );
}
```

**參數**:
- `file`: File - 圖片檔案對象

**返回**:
```typescript
{
  url: string;      // Catbox 圖片 URL
  fileName: string; // 原始檔案名
}
```

**範例**:
```typescript
this.catboxUploadService.uploadImage(file).subscribe({
  next: (result) => {
    console.log('上傳成功:', result.url);
    // result.url = "https://files.catbox.moe/abc123.jpg"
  },
  error: (error) => {
    console.error('上傳失敗:', error.message);
  }
});
```

#### 2. isValidImageType(file: File)

驗證圖片格式

```typescript
private isValidImageType(file: File): boolean {
  const validTypes = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp'
  ];
  return validTypes.includes(file.type);
}
```

#### 3. getPreviewUrl(file: File)

獲取本地預覽 URL

```typescript
getPreviewUrl(file: File): string {
  return URL.createObjectURL(file);
}
```

## EditComponent 更新

### 文件
`src/app/features/book/page/edit/edit.component.ts`

### onPublish() 方法

```typescript
onPublish(): void {
  // 1. 驗證
  if (!this.selectedImage || !this.selectedImage.file) {
    alert('請先上傳圖片');
    return;
  }

  if (!this.bookSettings.title) {
    alert('請填寫教材標題');
    return;
  }

  console.log('正在上傳圖片到 Catbox.moe，請稍候...');

  // 2. 上傳圖片到 Catbox
  this.catboxUploadService.uploadImage(this.selectedImage.file).subscribe({
    next: (uploadResult) => {
      console.log('圖片上傳成功:', uploadResult.url);
      
      // 3. 準備教材數據
      const bookData: CreateBookRequest = {
        title: this.bookSettings.title,
        author: this.bookSettings.author,
        description: this.bookSettings.description,
        category: this.bookSettings.category,
        pages: this.bookSettings.pages || 0,
        targetAge: this.bookSettings.targetAge,
        difficulty: this.bookSettings.difficulty,
        coverImageUrl: uploadResult.url, // ← Catbox URL
        status: 'published',
        hotspots: this.hotspots.map((hotspot, index) => ({
          label: hotspot.label,
          x: hotspot.x,
          y: hotspot.y,
          width: hotspot.width,
          height: hotspot.height,
          audioUrl: hotspot.audioUrl,
          sortOrder: index + 1
        }))
      };

      // 4. 調用後端 API
      this.bookEditService.createBook(bookData).subscribe({
        next: (response) => {
          console.log('教材發布成功:', response);
          alert('教材發布成功！');
          this.router.navigate(['/book']);
        },
        error: (error) => {
          console.error('發布失敗:', error);
          alert('發布失敗：' + error.message);
        }
      });
    },
    error: (error) => {
      console.error('圖片上傳失敗:', error);
      alert('圖片上傳失敗：' + error.message);
    }
  });
}
```

## 數據格式

### 上傳前（本地）

```typescript
{
  selectedImage: {
    file: File,                    // 原始檔案對象
    preview: "blob:http://..."     // 本地預覽 URL
  }
}
```

### 上傳後（Catbox）

```typescript
{
  url: "https://files.catbox.moe/abc123.jpg",  // Catbox 永久 URL
  fileName: "little-red-riding-hood.jpg"
}
```

### 發送給後端

```json
{
  "title": "小紅帽",
  "coverImageUrl": "https://files.catbox.moe/abc123.jpg",
  "hotspots": [...]
}
```

## Catbox API 詳情

### API 端點
```
POST https://catbox.moe/user/api.php
```

### 請求格式
```
Content-Type: multipart/form-data

reqtype: "fileupload"
fileToUpload: [File]
```

### 響應格式
```
純文字 URL:
https://files.catbox.moe/abc123.jpg
```

### 範例 cURL
```bash
curl -X POST https://catbox.moe/user/api.php \
  -F "reqtype=fileupload" \
  -F "fileToUpload=@image.jpg"
```

## 錯誤處理

### 1. 檔案類型錯誤

```typescript
if (!this.isValidImageType(file)) {
  return throwError(() => 
    new Error('不支援的圖片格式，請上傳 JPG、PNG、GIF 或 WebP 格式')
  );
}
```

**用戶提示**: "不支援的圖片格式，請上傳 JPG、PNG、GIF 或 WebP 格式"

### 2. 檔案過大

```typescript
const maxSize = 20 * 1024 * 1024; // 20MB
if (file.size > maxSize) {
  return throwError(() => 
    new Error('圖片檔案過大，請上傳小於 20MB 的圖片')
  );
}
```

**用戶提示**: "圖片檔案過大，請上傳小於 20MB 的圖片"

### 3. 網絡錯誤

```typescript
catchError(error => {
  console.error('Catbox 上傳錯誤:', error);
  return throwError(() => 
    new Error('圖片上傳失敗：' + (error.message || '網絡錯誤'))
  );
})
```

**用戶提示**: "圖片上傳失敗：網絡錯誤"

### 4. 無效響應

```typescript
if (!url || !url.startsWith('http')) {
  throw new Error('上傳失敗，請稍後再試');
}
```

**用戶提示**: "上傳失敗，請稍後再試"

## 用戶體驗優化

### 1. 上傳進度提示

```typescript
console.log('正在上傳圖片到 Catbox.moe，請稍候...');
```

建議添加 Loading 動畫：
```typescript
this.isUploading = true;

this.catboxUploadService.uploadImage(file).subscribe({
  next: (result) => {
    this.isUploading = false;
    // 繼續處理
  },
  error: (error) => {
    this.isUploading = false;
    // 錯誤處理
  }
});
```

### 2. 禁用發布按鈕

```html
<button 
  (click)="onPublish()" 
  [disabled]="isUploading || !isValid">
  {{ isUploading ? '上傳中...' : '發布教材' }}
</button>
```

### 3. 進度條（可選）

```html
<div class="upload-progress" *ngIf="isUploading">
  <div class="progress-bar">
    <div class="progress-fill"></div>
  </div>
  <p>正在上傳圖片到 Catbox.moe...</p>
</div>
```

## 測試

### 1. 單元測試

```typescript
describe('CatboxUploadService', () => {
  it('應該成功上傳圖片', (done) => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    service.uploadImage(file).subscribe({
      next: (result) => {
        expect(result.url).toContain('catbox.moe');
        done();
      }
    });
  });

  it('應該拒絕無效的圖片格式', (done) => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    
    service.uploadImage(file).subscribe({
      error: (error) => {
        expect(error.message).toContain('不支援的圖片格式');
        done();
      }
    });
  });
});
```

### 2. 集成測試

```typescript
it('應該完整完成發布流程', (done) => {
  component.selectedImage = {
    file: mockFile,
    preview: 'blob:...'
  };
  
  component.onPublish();
  
  // 驗證 Catbox 上傳被調用
  expect(catboxService.uploadImage).toHaveBeenCalled();
  
  // 驗證後端 API 被調用
  expect(bookEditService.createBook).toHaveBeenCalledWith(
    jasmine.objectContaining({
      coverImageUrl: jasmine.stringContaining('catbox.moe')
    })
  );
});
```

## 安全性考慮

### 1. 檔案類型驗證
- 前端驗證 MIME type
- 後端也應該驗證檔案類型

### 2. 檔案大小限制
- 前端限制 20MB
- 防止濫用和長時間上傳

### 3. URL 驗證
- 確保返回的是有效的 HTTP(S) URL
- 檢查 URL 格式

### 4. CORS 處理
- Catbox.moe 支持跨域請求
- 無需額外配置

## 替代方案

如果 Catbox.moe 不可用，可以考慮：

1. **ImgBB** - 需要 API Key
2. **Imgur** - 需要註冊
3. **自建圖床** - 需要服務器
4. **直接上傳到後端** - 需要存儲空間

## 總結

✅ **已實現功能**:
- Catbox.moe 圖片上傳服務
- 發布前自動上傳圖片
- 錯誤處理和驗證
- 獲取永久 URL

✅ **數據流程**:
1. 用戶選擇圖片（本地）
2. 點擊發布
3. 上傳到 Catbox.moe
4. 獲取永久 URL
5. 提交給後端 API

✅ **後端接收**:
```json
{
  "coverImageUrl": "https://files.catbox.moe/abc123.jpg"
}
```

後端只需要存儲這個 URL，不需要處理圖片上傳！
