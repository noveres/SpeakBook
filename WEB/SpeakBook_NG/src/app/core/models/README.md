# 通用分頁模型

這個模組提供了通用的分頁功能接口和工具類,可以在整個應用程式中重複使用。

## 使用方式

### 基本導入

```typescript
import { PageRequest, PageResponse, PageRequestBuilder } from '@core/models';
```

### 1. 創建分頁請求

#### 方式一: 直接創建對象

```typescript
const pageRequest: PageRequest = {
  page: 1,
  pageSize: 10,
  sortBy: 'createdAt',
  sortDirection: 'DESC',
  searchKeyword: '搜尋關鍵字'
};
```

#### 方式二: 使用建構器 (推薦)

```typescript
const pageRequest = PageRequestBuilder.create()
  .page(1)
  .pageSize(20)
  .sortBy('title')
  .sortDirection('ASC')
  .searchKeyword('小紅帽')
  .build();
```

### 2. 在服務中使用

```typescript
@Injectable({
  providedIn: 'root'
})
export class YourService {
  constructor(private http: HttpClient) {}

  getItemsWithPagination(pageRequest: PageRequest): Observable<PageResponse<YourModel>> {
    const params: any = {
      page: pageRequest.page.toString(),
      pageSize: pageRequest.pageSize.toString()
    };

    if (pageRequest.sortBy) {
      params.sortBy = pageRequest.sortBy;
    }

    if (pageRequest.sortDirection) {
      params.sortDirection = pageRequest.sortDirection;
    }

    if (pageRequest.searchKeyword) {
      params.searchKeyword = pageRequest.searchKeyword;
    }

    return this.http.get<ApiResponse<PageResponse<YourModel>>>(`${this.apiUrl}/page`, { params })
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取列表失敗');
          }
          return response.data;
        })
      );
  }
}
```

### 3. 在組件中使用

```typescript
export class YourListComponent implements OnInit, OnChanges {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() searchKeyword: string = '';
  @Output() pageDataLoaded = new EventEmitter<PageResponse<YourModel>>();

  items: YourModel[] = [];
  isLoading = false;

  constructor(private yourService: YourService) {}

  ngOnInit(): void {
    this.loadItems();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentPage'] || changes['searchKeyword']) {
      this.loadItems();
    }
  }

  loadItems(): void {
    this.isLoading = true;

    const pageRequest = PageRequestBuilder.create()
      .page(this.currentPage)
      .pageSize(this.pageSize)
      .sortBy('createdAt')
      .sortDirection('DESC')
      .searchKeyword(this.searchKeyword)
      .build();

    this.yourService.getItemsWithPagination(pageRequest).subscribe({
      next: (response) => {
        this.items = response.content;
        this.pageDataLoaded.emit(response);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('載入失敗:', error);
        this.isLoading = false;
      }
    });
  }
}
```

## 接口說明

### PageRequest

| 屬性 | 類型 | 必填 | 說明 |
|------|------|------|------|
| page | number | ✅ | 當前頁碼(從1開始) |
| pageSize | number | ✅ | 每頁大小 |
| sortBy | string | ❌ | 排序欄位 |
| sortDirection | 'ASC' \| 'DESC' | ❌ | 排序方向 |
| searchKeyword | string | ❌ | 搜尋關鍵字 |

### PageResponse<T>

| 屬性 | 類型 | 說明 |
|------|------|------|
| content | T[] | 當前頁數據 |
| currentPage | number | 當前頁碼 |
| pageSize | number | 每頁大小 |
| totalElements | number | 總記錄數 |
| totalPages | number | 總頁數 |
| first | boolean | 是否第一頁 |
| last | boolean | 是否最後一頁 |
| empty | boolean | 是否為空 |

## 注意事項

1. **頁碼從 1 開始**: 前端使用的頁碼從 1 開始,後端會自動轉換為從 0 開始
2. **類型安全**: PageResponse 使用泛型,確保類型安全
3. **可選參數**: sortBy、sortDirection 和 searchKeyword 都是可選的
4. **建構器模式**: 推薦使用 PageRequestBuilder 來創建請求,代碼更清晰

## 範例

完整的實現範例可以參考:
- `src/app/features/book/list-books/list-books.component.ts`
- `src/app/features/book/service/book-edit.service.ts`
- `src/app/features/book/page/book-page/book-page.component.ts`
