# 服務架構說明

## 概述

將所有與 API 交互的邏輯集中到統一的服務層，使組件代碼更簡潔、易於維護和測試。

## 服務層架構

```
EditComponent (組件層)
    ↓
BookService (統一服務層)
    ↓
├── BookEditService (API 服務)
│   └── HttpClient → 後端 API
└── CatboxUploadService (圖片上傳服務)
    └── HttpClient → Catbox.moe
```

## 服務職責劃分

### 1. BookService (統一服務)
**文件**: `src/app/features/book/service/book.service.ts`

**職責**:
- 協調多個服務的調用
- 處理業務邏輯流程
- 統一錯誤處理
- 提供高層次的 API

**方法**:
```typescript
// 發布教材（上傳圖片 + 創建教材）
publishBook(image, hotspots, settings): Observable<BookResponse>

// 儲存草稿（上傳圖片 + 儲存草稿）
saveDraft(image, hotspots, settings): Observable<BookResponse>

// 更新教材（上傳新圖片 + 更新教材）
updateBook(id, image, hotspots, settings, existingUrl): Observable<BookResponse>

// 獲取教材詳情
getBook(id): Observable<BookResponse>
```

### 2. BookEditService (API 服務)
**文件**: `src/app/features/book/service/book-edit.service.ts`

**職責**:
- 直接與後端 API 交互
- 處理 HTTP 請求/響應
- 數據格式轉換

**方法**:
```typescript
// 創建教材
createBook(bookData): Observable<BookResponse>

// 儲存草稿
saveDraft(bookData): Observable<BookResponse>

// 更新教材
updateBook(id, bookData): Observable<BookResponse>

// 獲取教材
getBook(id): Observable<BookResponse>

// 上傳圖片（已棄用，改用 Catbox）
uploadImage(file): Observable<{url, fileName, fileSize}>
```

### 3. CatboxUploadService (圖片上傳服務)
**文件**: `src/app/core/services/catbox-upload.service.ts`

**職責**:
- 上傳圖片到 Catbox.moe
- 驗證圖片格式和大小
- 處理上傳錯誤

**方法**:
```typescript
// 上傳圖片
uploadImage(file): Observable<{url, fileName}>

// 批量上傳
uploadMultipleImages(files): Observable<{url, fileName}[]>

// 獲取預覽 URL
getPreviewUrl(file): string
```

## 使用範例

### 之前（組件直接調用多個服務）

```typescript
// EditComponent - 之前的做法
onPublish(): void {
  // 1. 驗證
  if (!this.selectedImage?.file) return;
  if (!this.bookSettings.title) return;

  // 2. 上傳圖片
  this.catboxUploadService.uploadImage(this.selectedImage.file)
    .subscribe({
      next: (uploadResult) => {
        // 3. 準備數據
        const bookData = {
          title: this.bookSettings.title,
          // ... 很多欄位
          coverImageUrl: uploadResult.url,
          hotspots: this.hotspots.map((h, i) => ({
            // ... 轉換邏輯
          }))
        };

        // 4. 調用 API
        this.bookEditService.createBook(bookData)
          .subscribe({
            next: (response) => {
              alert('發布成功');
              this.router.navigate(['/book']);
            },
            error: (error) => {
              alert('發布失敗：' + error.message);
            }
          });
      },
      error: (error) => {
        alert('圖片上傳失敗：' + error.message);
      }
    });
}
```

**問題**:
- ❌ 組件代碼過長（60+ 行）
- ❌ 業務邏輯分散在組件中
- ❌ 難以測試
- ❌ 難以復用
- ❌ 錯誤處理重複

### 之後（使用統一服務）

```typescript
// EditComponent - 現在的做法
onPublish(): void {
  console.log('正在發布教材，請稍候...');

  this.bookService.publishBook(
    this.selectedImage!,
    this.hotspots,
    this.bookSettings
  ).subscribe({
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
}
```

**優勢**:
- ✅ 組件代碼簡潔（15 行）
- ✅ 業務邏輯集中在服務層
- ✅ 易於測試
- ✅ 易於復用
- ✅ 統一錯誤處理

## BookService 實現細節

### publishBook() 方法

```typescript
publishBook(
  image: UploadedImage,
  hotspots: Hotspot[],
  settings: BookSettings
): Observable<BookResponse> {
  // 1. 驗證
  if (!image?.file) {
    return throwError(() => new Error('請先上傳圖片'));
  }
  if (!settings.title) {
    return throwError(() => new Error('請填寫教材標題'));
  }

  // 2. 上傳圖片到 Catbox
  return this.catboxUploadService.uploadImage(image.file).pipe(
    switchMap(uploadResult => {
      // 3. 準備教材數據
      const bookData = this.prepareBookData(
        uploadResult.url,
        hotspots,
        settings,
        'published'
      );

      // 4. 調用後端 API
      return this.bookEditService.createBook(bookData);
    }),
    catchError(error => {
      console.error('發布教材失敗:', error);
      return throwError(() => error);
    })
  );
}
```

### prepareBookData() 私有方法

```typescript
private prepareBookData(
  imageUrl: string,
  hotspots: Hotspot[],
  settings: BookSettings,
  status: 'draft' | 'published'
): CreateBookRequest {
  return {
    title: settings.title,
    author: settings.author,
    description: settings.description,
    category: settings.category,
    pages: settings.pages || 0,
    targetAge: settings.targetAge,
    difficulty: settings.difficulty,
    coverImageUrl: imageUrl,
    status: status,
    hotspots: hotspots.map((hotspot, index) => ({
      label: hotspot.label,
      x: hotspot.x,
      y: hotspot.y,
      width: hotspot.width,
      height: hotspot.height,
      audioUrl: hotspot.audioUrl,
      sortOrder: index + 1
    }))
  };
}
```

## 數據流程

### 發布教材流程

```
用戶點擊「發布教材」
    ↓
EditComponent.onPublish()
    ↓
BookService.publishBook(image, hotspots, settings)
    ↓
├─→ CatboxUploadService.uploadImage(file)
│       ↓
│   POST https://catbox.moe/user/api.php
│       ↓
│   返回: { url: "https://files.catbox.moe/abc.jpg" }
│
└─→ BookEditService.createBook(bookData)
        ↓
    POST /api/books
        ↓
    返回: { success: true, data: {...} }
        ↓
    EditComponent 顯示成功訊息
```

### 儲存草稿流程

```
用戶點擊「儲存草稿」
    ↓
EditComponent.onSaveDraft()
    ↓
BookService.saveDraft(image, hotspots, settings)
    ↓
├─→ (如果有圖片) CatboxUploadService.uploadImage(file)
│       ↓
│   返回: { url: "https://files.catbox.moe/abc.jpg" }
│
└─→ BookEditService.saveDraft(bookData)
        ↓
    POST /api/books/draft
        ↓
    返回: { success: true, data: {...} }
        ↓
    EditComponent 顯示成功訊息
```

## 錯誤處理

### 統一錯誤處理

```typescript
// BookService 中統一處理錯誤
catchError(error => {
  console.error('發布教材失敗:', error);
  return throwError(() => error);
})
```

### 組件層錯誤處理

```typescript
// EditComponent 只需要顯示錯誤訊息
this.bookService.publishBook(...).subscribe({
  error: (error) => {
    console.error('發布失敗:', error);
    alert('發布失敗：' + error.message);
  }
});
```

## 測試策略

### 1. 單元測試 - BookService

```typescript
describe('BookService', () => {
  let service: BookService;
  let bookEditService: jasmine.SpyObj<BookEditService>;
  let catboxService: jasmine.SpyObj<CatboxUploadService>;

  beforeEach(() => {
    const bookEditSpy = jasmine.createSpyObj('BookEditService', ['createBook']);
    const catboxSpy = jasmine.createSpyObj('CatboxUploadService', ['uploadImage']);

    TestBed.configureTestingModule({
      providers: [
        BookService,
        { provide: BookEditService, useValue: bookEditSpy },
        { provide: CatboxUploadService, useValue: catboxSpy }
      ]
    });

    service = TestBed.inject(BookService);
    bookEditService = TestBed.inject(BookEditService) as jasmine.SpyObj<BookEditService>;
    catboxService = TestBed.inject(CatboxUploadService) as jasmine.SpyObj<CatboxUploadService>;
  });

  it('應該成功發布教材', (done) => {
    const mockImage = { file: new File([''], 'test.jpg') };
    const mockUploadResult = { url: 'https://files.catbox.moe/test.jpg', fileName: 'test.jpg' };
    const mockBookResponse = { id: 1, title: '測試教材' };

    catboxService.uploadImage.and.returnValue(of(mockUploadResult));
    bookEditService.createBook.and.returnValue(of(mockBookResponse as any));

    service.publishBook(mockImage as any, [], {} as any).subscribe({
      next: (result) => {
        expect(result.id).toBe(1);
        expect(catboxService.uploadImage).toHaveBeenCalled();
        expect(bookEditService.createBook).toHaveBeenCalled();
        done();
      }
    });
  });
});
```

### 2. 單元測試 - EditComponent

```typescript
describe('EditComponent', () => {
  let component: EditComponent;
  let bookService: jasmine.SpyObj<BookService>;

  beforeEach(() => {
    const bookServiceSpy = jasmine.createSpyObj('BookService', ['publishBook']);

    TestBed.configureTestingModule({
      providers: [
        { provide: BookService, useValue: bookServiceSpy }
      ]
    });

    component = TestBed.inject(EditComponent);
    bookService = TestBed.inject(BookService) as jasmine.SpyObj<BookService>;
  });

  it('應該調用 BookService.publishBook', () => {
    const mockResponse = { id: 1, title: '測試教材' };
    bookService.publishBook.and.returnValue(of(mockResponse as any));

    component.selectedImage = { file: new File([''], 'test.jpg') } as any;
    component.onPublish();

    expect(bookService.publishBook).toHaveBeenCalled();
  });
});
```

## 優勢總結

### 1. 代碼組織
- ✅ **關注點分離**: 組件只負責 UI，服務負責業務邏輯
- ✅ **單一職責**: 每個服務有明確的職責
- ✅ **易於維護**: 修改業務邏輯只需修改服務

### 2. 可測試性
- ✅ **易於 Mock**: 服務可以輕鬆被 Mock
- ✅ **獨立測試**: 服務和組件可以獨立測試
- ✅ **測試覆蓋**: 更容易達到高測試覆蓋率

### 3. 可復用性
- ✅ **跨組件復用**: 其他組件也可以使用 BookService
- ✅ **邏輯復用**: 發布、草稿、更新共享相同邏輯
- ✅ **減少重複**: 避免在多個組件中重複相同代碼

### 4. 可擴展性
- ✅ **易於添加功能**: 新功能只需在服務中添加方法
- ✅ **易於修改流程**: 修改業務流程不影響組件
- ✅ **易於集成**: 可以輕鬆集成新的第三方服務

## 文件結構

```
src/app/features/book/
├── service/
│   ├── book.service.ts           ← 統一服務（新增）
│   ├── book-edit.service.ts      ← API 服務
│   └── book.service.spec.ts      ← 測試文件
├── page/
│   └── edit/
│       ├── edit.component.ts     ← 簡化後的組件
│       ├── edit.component.html
│       └── edit.component.scss
└── edit/
    └── steps/
        ├── upload-image/
        ├── image-editor/
        ├── book-settings/
        └── book-preview/

src/app/core/services/
└── catbox-upload.service.ts      ← 圖片上傳服務
```

## 遷移指南

### 從舊代碼遷移到新架構

**步驟 1**: 創建 BookService
```bash
ng generate service features/book/service/book
```

**步驟 2**: 實現業務邏輯方法
- publishBook()
- saveDraft()
- updateBook()
- getBook()

**步驟 3**: 更新組件
- 注入 BookService
- 移除直接調用 BookEditService 和 CatboxUploadService
- 簡化方法實現

**步驟 4**: 測試
- 編寫服務單元測試
- 更新組件測試
- 進行集成測試

## 總結

通過將 API 交互邏輯集中到統一的服務層：

✅ **組件更簡潔** - EditComponent 從 180 行減少到 137 行
✅ **邏輯更清晰** - 業務邏輯集中在 BookService
✅ **易於測試** - 服務和組件可以獨立測試
✅ **易於維護** - 修改業務邏輯只需修改服務
✅ **易於復用** - 其他組件可以直接使用 BookService
