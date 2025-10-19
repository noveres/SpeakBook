# 教材管理功能實現說明

## 已實現功能

### 1. 查看詳情 (View Details)
- **組件**: `BookDetailComponent`
- **路由**: `/book/:id`
- **功能**:
  - 顯示教材完整信息（標題、作者、封面、描述、出版日期、頁數、分類）
  - 提供編輯和刪除按鈕
  - 返回列表按鈕
  - 圖片加載錯誤處理
  - 未找到教材的友好提示

### 2. 編輯教材 (Edit)
- **組件**: `EditComponent`
- **路由**: `/book/edit/:id`
- **功能**:
  - 支持編輯模式和創建模式
  - 在編輯模式下自動加載現有教材數據
  - 使用步驟式表單（Stepper）
  - 包含圖片上傳、熱區編輯、設置配置和預覽功能

### 3. 刪除教材 (Delete)
- **位置**: `ListBooksComponent` 和 `BookDetailComponent`
- **功能**:
  - 刪除前確認對話框
  - 從列表中移除已刪除的教材
  - 刪除成功提示
  - 事件冒泡阻止（避免觸發卡片點擊）

## 文件結構

```
src/app/features/book/
├── list-books/                    # 教材列表組件
│   ├── list-books.component.ts
│   ├── list-books.component.html
│   └── list-books.component.scss
├── detail/                        # 教材詳情組件（新增）
│   ├── book-detail.component.ts
│   ├── book-detail.component.html
│   └── book-detail.component.scss
├── page/
│   ├── book-page/                # 教材頁面容器
│   └── edit/                     # 編輯頁面
│       └── edit.component.ts     # 已更新支持編輯模式
└── service/
    └── book-edit.service.ts
```

## 路由配置

```typescript
// 教材列表
{ path: 'book', component: BookPageComponent }

// 教材詳情
{ path: 'book/:id', component: BookDetailComponent }

// 編輯教材
{ path: 'book/edit/:id', component: EditComponent }

// 創建教材
{ path: 'create', component: EditComponent }
```

## 主要修改

### 1. ListBooksComponent (list-books.component.ts)
- 添加 `Router` 注入
- 新增方法:
  - `onViewDetails(event, book)` - 導航到詳情頁
  - `onEdit(event, book)` - 導航到編輯頁
  - `onDelete(event, book)` - 刪除教材

### 2. ListBooksComponent HTML (list-books.component.html)
- 為按鈕添加點擊事件:
  - `(click)="onViewDetails($event, book)"`
  - `(click)="onEdit($event, book)"`
  - `(click)="onDelete($event, book)"`

### 3. EditComponent (edit.component.ts)
- 實現 `OnInit` 接口
- 添加 `ActivatedRoute` 注入
- 新增屬性:
  - `isEditMode` - 判斷是否為編輯模式
  - `bookId` - 當前編輯的教材 ID
- 新增方法:
  - `ngOnInit()` - 檢查路由參數並加載數據
  - `loadBookData(id)` - 加載教材數據

### 4. 路由配置 (app.routes.ts)
- 添加教材詳情路由
- 添加編輯教材路由
- 保持創建教材路由

## 使用方式

### 查看詳情
1. 在教材列表中，將鼠標懸停在教材卡片上
2. 點擊「查看詳情」按鈕
3. 頁面將導航到 `/book/:id`

### 編輯教材
1. 在教材列表或詳情頁中點擊「編輯」按鈕
2. 頁面將導航到 `/book/edit/:id`
3. 表單會自動加載現有教材數據

### 刪除教材
1. 在教材列表或詳情頁中點擊「刪除」按鈕
2. 確認刪除對話框
3. 確認後教材將從列表中移除

## 待完成事項

### 後端集成
目前使用模擬數據，需要集成實際的後端 API:

1. **BookService** - 創建教材服務
   ```typescript
   getBookById(id: number): Observable<Book>
   updateBook(id: number, book: Book): Observable<Book>
   deleteBook(id: number): Observable<void>
   ```

2. **API 端點**
   - `GET /api/books/:id` - 獲取教材詳情
   - `PUT /api/books/:id` - 更新教材
   - `DELETE /api/books/:id` - 刪除教材

### UI 改進
1. 使用 Material Snackbar 或 Toast 替代 `alert()`
2. 添加加載動畫
3. 添加刪除動畫效果
4. 優化移動端響應式設計

### 功能增強
1. 批量刪除
2. 教材排序和篩選
3. 搜索功能集成
4. 分頁功能集成
5. 權限控制（只有作者或管理員可以編輯/刪除）

## 注意事項

1. **事件冒泡**: 所有按鈕點擊事件都使用 `event.stopPropagation()` 防止觸發卡片的點擊事件

2. **路由順序**: 在 `app.routes.ts` 中，更具體的路由（如 `/book/edit/:id`）應該放在更通用的路由（如 `/book/:id`）之前

3. **數據同步**: 刪除操作後需要更新列表，目前使用本地過濾，實際應該重新從後端獲取數據

4. **錯誤處理**: 需要添加完善的錯誤處理機制，包括網絡錯誤、權限錯誤等

## 樣式特點

- 使用漸變色按鈕
- 懸停效果和過渡動畫
- 響應式設計
- 統一的視覺風格
- 友好的空狀態和錯誤狀態提示
