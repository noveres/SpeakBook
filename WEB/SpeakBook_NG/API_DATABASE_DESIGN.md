# 教材創建 API 與資料庫設計

## 資料庫設計（簡化版）

### 1. books 表（教材主表）

```sql
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL COMMENT '教材標題',
    author VARCHAR(100) COMMENT '作者',
    description TEXT COMMENT '教材描述',
    category VARCHAR(50) COMMENT '分類',
    pages INT DEFAULT 0 COMMENT '頁數',
    target_age VARCHAR(20) COMMENT '適用年齡',
    difficulty VARCHAR(20) COMMENT '難度等級',
    cover_image_url VARCHAR(500) COMMENT '圖片URL',
    status ENUM('draft', 'published') DEFAULT 'draft' COMMENT '狀態：草稿/已發布',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新時間',
    published_at TIMESTAMP NULL COMMENT '發布時間',
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='教材主表';
```

### 2. hotspots 表（熱區表）

```sql
CREATE TABLE hotspots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL COMMENT '教材ID',
    label VARCHAR(100) NOT NULL COMMENT '熱區標籤',
    x INT NOT NULL COMMENT 'X座標',
    y INT NOT NULL COMMENT 'Y座標',
    width INT NOT NULL COMMENT '寬度',
    height INT NOT NULL COMMENT '高度',
    audio_url VARCHAR(500) COMMENT '音訊URL',
    sort_order INT DEFAULT 0 COMMENT '排序順序',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
    INDEX idx_book_id (book_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='熱區表';
```

### 3. audios 表（音訊表）

```sql
CREATE TABLE audios (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(200) NOT NULL COMMENT '音訊名稱',
    url VARCHAR(500) NOT NULL COMMENT '音訊URL',
    duration INT COMMENT '時長（秒）',
    file_size INT COMMENT '檔案大小（字節）',
    category VARCHAR(50) COMMENT '分類',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '創建時間',
    INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='音訊表';
```

## API 設計

### 1. 創建教材（發布）

**端點**: `POST /api/books`

**請求 Body**:

```json
{
  "title": "小紅帽",
  "author": "格林兄弟",
  "description": "一個關於小女孩與大野狼的經典童話故事",
  "category": "童話故事",
  "pages": 32,
  "targetAge": "3-6歲",
  "difficulty": "簡單",
  "coverImageUrl": "https://cdn.example.com/images/little-red-riding-hood.jpg",
  "status": "published",
  "hotspots": [
    {
      "label": "小紅帽",
      "x": 50,
      "y": 80,
      "width": 120,
      "height": 100,
      "audioUrl": "https://cdn.example.com/audio/little-red.mp3",
      "sortOrder": 1
    },
    {
      "label": "大野狼",
      "x": 200,
      "y": 150,
      "width": 100,
      "height": 90,
      "audioUrl": "https://cdn.example.com/audio/wolf.mp3",
      "sortOrder": 2
    }
  ]
}
```

**響應 (成功)**:

```json
{
  "success": true,
  "message": "教材創建成功",
  "data": {
    "id": 123,
    "title": "小紅帽",
    "author": "格林兄弟",
    "description": "一個關於小女孩與大野狼的經典童話故事",
    "category": "童話故事",
    "pages": 32,
    "targetAge": "3-6歲",
    "difficulty": "簡單",
    "coverImageUrl": "https://cdn.example.com/images/little-red-riding-hood.jpg",
    "status": "published",
    "createdAt": "2024-10-19T14:30:00Z",
    "publishedAt": "2024-10-19T14:30:00Z",
    "hotspots": [
      {
        "id": 456,
        "label": "小紅帽",
        "x": 50,
        "y": 80,
        "width": 120,
        "height": 100,
        "audioUrl": "https://cdn.example.com/audio/little-red.mp3",
        "sortOrder": 1
      },
      {
        "id": 457,
        "label": "大野狼",
        "x": 200,
        "y": 150,
        "width": 100,
        "height": 90,
        "audioUrl": "https://cdn.example.com/audio/wolf.mp3",
        "sortOrder": 2
      }
    ]
  }
}
```

**響應 (失敗)**:

```json
{
  "success": false,
  "message": "教材標題不能為空",
  "errors": {
    "title": ["教材標題為必填項目"]
  }
}
```

### 2. 儲存草稿

**端點**: `POST /api/books/draft`

**請求 Body** (與創建教材相同，但 status 為 "draft"):

```json
{
  "title": "小紅帽",
  "author": "格林兄弟",
  "description": "一個關於小女孩與大野狼的經典童話故事",
  "category": "童話故事",
  "pages": 32,
  "targetAge": "3-6歲",
  "difficulty": "簡單",
  "coverImageUrl": "https://cdn.example.com/images/little-red-riding-hood.jpg",
  "status": "draft",
  "hotspots": [
    {
      "label": "小紅帽",
      "x": 50,
      "y": 80,
      "width": 120,
      "height": 100,
      "audioUrl": "https://cdn.example.com/audio/little-red.mp3",
      "sortOrder": 1
    }
  ]
}
```

**響應**:

```json
{
  "success": true,
  "message": "草稿儲存成功",
  "data": {
    "id": 124,
    "title": "小紅帽",
    "status": "draft",
    "createdAt": "2024-10-19T14:30:00Z"
  }
}
```

### 3. 更新教材

**端點**: `PUT /api/books/{id}`

**請求 Body** (與創建教材相同):

```json
{
  "title": "小紅帽（修訂版）",
  "author": "格林兄弟",
  "description": "一個關於小女孩與大野狼的經典童話故事（修訂版）",
  "category": "童話故事",
  "pages": 32,
  "targetAge": "3-6歲",
  "difficulty": "簡單",
  "coverImageUrl": "https://cdn.example.com/images/little-red-riding-hood-v2.jpg",
  "status": "published",
  "hotspots": [
    {
      "id": 456,
      "label": "小紅帽",
      "x": 50,
      "y": 80,
      "width": 120,
      "height": 100,
      "audioUrl": "https://cdn.example.com/audio/little-red.mp3",
      "sortOrder": 1
    }
  ]
}
```

**響應**:

```json
{
  "success": true,
  "message": "教材更新成功",
  "data": {
    "id": 123,
    "title": "小紅帽（修訂版）",
    "updatedAt": "2024-10-19T15:00:00Z"
  }
}
```

### 4. 上傳圖片

**端點**: `POST /api/upload/image`

**請求 Headers**:

```
Content-Type: multipart/form-data
Authorization: Bearer {token}
```

**請求 Body** (FormData):

```
file: [圖片檔案]
type: "cover" // 圖片類型
```

**響應**:

```json
{
  "success": true,
  "message": "圖片上傳成功",
  "data": {
    "url": "https://cdn.example.com/images/abc123.jpg",
    "fileName": "little-red-riding-hood.jpg",
    "fileSize": 245678,
    "width": 800,
    "height": 600
  }
}
```

### 5. 獲取教材詳情（編輯時使用）

**端點**: `GET /api/books/{id}`

**響應**:

```json
{
  "success": true,
  "data": {
    "id": 123,
    "title": "小紅帽",
    "author": "格林兄弟",
    "description": "一個關於小女孩與大野狼的經典童話故事",
    "category": "童話故事",
    "pages": 32,
    "targetAge": "3-6歲",
    "difficulty": "簡單",
    "coverImageUrl": "https://cdn.example.com/images/little-red-riding-hood.jpg",
    "status": "published",
    "createdAt": "2024-10-19T14:30:00Z",
    "publishedAt": "2024-10-19T14:30:00Z",
    "hotspots": [
      {
        "id": 456,
        "label": "小紅帽",
        "x": 50,
        "y": 80,
        "width": 120,
        "height": 100,
        "audioUrl": "https://cdn.example.com/audio/little-red.mp3",
        "sortOrder": 1
      },
      {
        "id": 457,
        "label": "大野狼",
        "x": 200,
        "y": 150,
        "width": 100,
        "height": 90,
        "audioUrl": "https://cdn.example.com/audio/wolf.mp3",
        "sortOrder": 2
      }
    ]
  }
}
```

## 前端 TypeScript 接口定義

```typescript
// 創建教材請求
export interface CreateBookRequest {
  title: string;
  author?: string;
  description?: string;
  category: string;
  pages: number;
  targetAge: string;
  difficulty: string;
  coverImageUrl: string;
  status: 'draft' | 'published';
  hotspots: HotspotRequest[];
}

// 熱區請求
export interface HotspotRequest {
  id?: number; // 更新時需要
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  audioUrl?: string;
  sortOrder: number;
}

// API 響應
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

// 教材響應
export interface BookResponse {
  id: number;
  title: string;
  author?: string;
  description?: string;
  category: string;
  pages: number;
  targetAge: string;
  difficulty: string;
  coverImageUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  hotspots: HotspotResponse[];
}

// 熱區響應
export interface HotspotResponse {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  audioUrl?: string;
  sortOrder: number;
}
```

## 後端處理邏輯（偽代碼）

### 創建教材

```python
def create_book(request_data):
    # 1. 驗證數據
    if not request_data.get('title'):
        return error_response('教材標題不能為空')
  
    # 2. 創建教材記錄
    book = Book.create({
        'title': request_data['title'],
        'author': request_data.get('author'),
        'description': request_data.get('description'),
        'category': request_data['category'],
        'pages': request_data['pages'],
        'target_age': request_data['targetAge'],
        'difficulty': request_data['difficulty'],
        'cover_image_url': request_data['coverImageUrl'],
        'status': request_data['status'],
        'published_at': datetime.now() if request_data['status'] == 'published' else None
    })
  
    # 3. 創建熱區記錄
    for index, hotspot_data in enumerate(request_data.get('hotspots', [])):
        Hotspot.create({
            'book_id': book.id,
            'label': hotspot_data['label'],
            'x': hotspot_data['x'],
            'y': hotspot_data['y'],
            'width': hotspot_data['width'],
            'height': hotspot_data['height'],
            'audio_url': hotspot_data.get('audioUrl'),
            'sort_order': hotspot_data.get('sortOrder', index + 1)
        })
  
    # 4. 返回結果
    return success_response({
        'id': book.id,
        'title': book.title,
        'status': book.status,
        'createdAt': book.created_at,
        'hotspots': book.hotspots
    })
```

### 更新教材

```python
def update_book(book_id, request_data):
    # 1. 查找教材
    book = Book.find(book_id)
    if not book:
        return error_response('教材不存在', 404)
  
    # 2. 更新教材信息
    book.update({
        'title': request_data['title'],
        'author': request_data.get('author'),
        'description': request_data.get('description'),
        'category': request_data['category'],
        'pages': request_data['pages'],
        'target_age': request_data['targetAge'],
        'difficulty': request_data['difficulty'],
        'cover_image_url': request_data['coverImageUrl'],
        'status': request_data['status']
    })
  
    # 3. 刪除舊的熱區
    Hotspot.delete_by_book_id(book_id)
  
    # 4. 創建新的熱區
    for index, hotspot_data in enumerate(request_data.get('hotspots', [])):
        Hotspot.create({
            'book_id': book.id,
            'label': hotspot_data['label'],
            'x': hotspot_data['x'],
            'y': hotspot_data['y'],
            'width': hotspot_data['width'],
            'height': hotspot_data['height'],
            'audio_url': hotspot_data.get('audioUrl'),
            'sort_order': hotspot_data.get('sortOrder', index + 1)
        })
  
    # 5. 返回結果
    return success_response({
        'id': book.id,
        'title': book.title,
        'updatedAt': book.updated_at
    })
```

## 驗證規則

### 教材驗證

- `title`: 必填，最大 200 字符
- `author`: 可選，最大 100 字符
- `description`: 可選，最大 5000 字符
- `category`: 必填，最大 50 字符
- `pages`: 必填，整數，>= 0
- `targetAge`: 必填，最大 20 字符
- `difficulty`: 必填，最大 20 字符
- `coverImageUrl`: 必填，有效的 URL，最大 500 字符
- `status`: 必填，只能是 'draft' 或 'published'

### 熱區驗證

- `label`: 必填，最大 100 字符
- `x`: 必填，整數，>= 0
- `y`: 必填，整數，>= 0
- `width`: 必填，整數，> 0
- `height`: 必填，整數，> 0
- `audioUrl`: 可選，有效的 URL，最大 500 字符
- `sortOrder`: 可選，整數，>= 0

## 錯誤碼

| 錯誤碼 | 說明         |
| ------ | ------------ |
| 400    | 請求參數錯誤 |
| 401    | 未授權       |
| 403    | 無權限       |
| 404    | 資源不存在   |
| 500    | 服務器錯誤   |

## 注意事項

1. **圖片上傳**: 建議先上傳圖片獲取 URL，再創建教材
2. **熱區順序**: `sortOrder` 用於控制熱區顯示順序
3. **草稿與發布**: 使用 `status` 字段區分
4. **級聯刪除**: 刪除教材時自動刪除相關熱區
5. **事務處理**: 創建/更新教材和熱區應在同一事務中
6. **音訊 URL**: 存儲完整的 CDN URL，便於直接播放

## 索引優化

```sql
-- 教材表索引
CREATE INDEX idx_books_status ON books(status);
CREATE INDEX idx_books_category ON books(category);
CREATE INDEX idx_books_created_at ON books(created_at);

-- 熱區表索引
CREATE INDEX idx_hotspots_book_id ON hotspots(book_id);
```

## 簡化建議

如果要進一步簡化，可以：

1. **合併表**: 將熱區數據以 JSON 格式存儲在 books 表的一個字段中
2. **移除音訊表**: 直接在熱區中存儲音訊 URL
3. **減少字段**: 移除不常用的字段（如 pages, sortOrder）

### 極簡版資料庫（單表）

```sql
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    target_age VARCHAR(20),
    difficulty VARCHAR(20),
    cover_image_url VARCHAR(500),
    hotspots_json TEXT COMMENT '熱區數據（JSON格式）',
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

**hotspots_json 範例**:

```json
[
  {
    "label": "小紅帽",
    "x": 50,
    "y": 80,
    "width": 120,
    "height": 100,
    "audioUrl": "https://cdn.example.com/audio/little-red.mp3"
  }
]
```

這樣只需要一個表，但查詢和更新熱區會比較麻煩。建議還是使用兩個表的方案。
