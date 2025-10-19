# API 快速參考

## 創建教材 JSON 範例

### 最簡單的請求（必填欄位）

```json
{
  "title": "小紅帽",
  "category": "童話故事",
  "pages": 32,
  "targetAge": "3-6歲",
  "difficulty": "簡單",
  "coverImageUrl": "https://cdn.example.com/images/cover.jpg",
  "status": "published",
  "hotspots": []
}
```

### 完整的請求（包含所有欄位）

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

## 資料庫表結構（簡化版）

### books 表

```sql
CREATE TABLE books (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100),
    description TEXT,
    category VARCHAR(50),
    pages INT DEFAULT 0,
    target_age VARCHAR(20),
    difficulty VARCHAR(20),
    cover_image_url VARCHAR(500),
    status ENUM('draft', 'published') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);
```

### hotspots 表

```sql
CREATE TABLE hotspots (
    id INT PRIMARY KEY AUTO_INCREMENT,
    book_id INT NOT NULL,
    label VARCHAR(100) NOT NULL,
    x INT NOT NULL,
    y INT NOT NULL,
    width INT NOT NULL,
    height INT NOT NULL,
    audio_url VARCHAR(500),
    sort_order INT DEFAULT 0,
    FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE
);
```

## API 端點

| 方法 | 端點 | 說明 |
|------|------|------|
| POST | `/api/books` | 創建教材（發布） |
| POST | `/api/books/draft` | 儲存草稿 |
| PUT | `/api/books/{id}` | 更新教材 |
| GET | `/api/books/{id}` | 獲取教材詳情 |
| POST | `/api/upload/image` | 上傳圖片 |

## 欄位說明

### 教材欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| title | string | ✅ | 教材標題 |
| author | string | ❌ | 作者 |
| description | string | ❌ | 教材描述 |
| category | string | ✅ | 分類 |
| pages | number | ✅ | 頁數 |
| targetAge | string | ✅ | 適用年齡 |
| difficulty | string | ✅ | 難度等級 |
| coverImageUrl | string | ✅ | 封面圖片URL |
| status | string | ✅ | 狀態（draft/published） |
| hotspots | array | ✅ | 熱區數組（可為空） |

### 熱區欄位

| 欄位 | 類型 | 必填 | 說明 |
|------|------|------|------|
| label | string | ✅ | 熱區標籤 |
| x | number | ✅ | X座標 |
| y | number | ✅ | Y座標 |
| width | number | ✅ | 寬度 |
| height | number | ✅ | 高度 |
| audioUrl | string | ❌ | 音訊URL |
| sortOrder | number | ❌ | 排序順序 |

## 前端使用範例

```typescript
import { BookEditService, CreateBookRequest } from './book-edit.service';

// 準備數據
const bookData: CreateBookRequest = {
  title: '小紅帽',
  author: '格林兄弟',
  description: '一個關於小女孩與大野狼的經典童話故事',
  category: '童話故事',
  pages: 32,
  targetAge: '3-6歲',
  difficulty: '簡單',
  coverImageUrl: 'https://cdn.example.com/images/cover.jpg',
  status: 'published',
  hotspots: [
    {
      label: '小紅帽',
      x: 50,
      y: 80,
      width: 120,
      height: 100,
      audioUrl: 'https://cdn.example.com/audio/little-red.mp3',
      sortOrder: 1
    }
  ]
};

// 創建教材
this.bookEditService.createBook(bookData).subscribe({
  next: (response) => {
    console.log('創建成功:', response);
    alert('教材發布成功！');
  },
  error: (error) => {
    console.error('創建失敗:', error);
    alert('發布失敗：' + error.message);
  }
});
```

## 常見問題

### Q: 如何區分草稿和發布？
A: 使用 `status` 欄位，`"draft"` 表示草稿，`"published"` 表示已發布。

### Q: 熱區可以為空嗎？
A: 可以，`hotspots` 可以是空數組 `[]`。

### Q: 圖片 URL 從哪裡來？
A: 先調用 `/api/upload/image` 上傳圖片，獲取 URL 後再創建教材。

### Q: 如何更新教材？
A: 使用 PUT `/api/books/{id}`，請求格式與創建相同。

### Q: sortOrder 是什麼？
A: 用於控制熱區顯示順序，數字越小越靠前。

## 測試數據

```json
{
  "title": "測試教材",
  "category": "測試分類",
  "pages": 1,
  "targetAge": "3-6歲",
  "difficulty": "簡單",
  "coverImageUrl": "https://via.placeholder.com/800x600",
  "status": "draft",
  "hotspots": [
    {
      "label": "測試熱區",
      "x": 100,
      "y": 100,
      "width": 200,
      "height": 150,
      "sortOrder": 1
    }
  ]
}
```
