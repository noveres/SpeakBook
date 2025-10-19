# 熱區功能集成說明

## 概述

教材詳情頁面現已支持顯示和互動熱區數據。當後端返回教材數據時，如果包含熱區信息，前端會自動在封面圖片上顯示可互動的熱區。

## 數據結構

### Hotspot 接口

```typescript
interface Hotspot {
  id: string;           // 熱區唯一標識
  x: number;            // X 座標（像素）
  y: number;            // Y 座標（像素）
  width: number;        // 寬度（像素）
  height: number;       // 高度（像素）
  label: string;        // 熱區標籤名稱
  audioUrl?: string;    // 可選的音訊檔案 URL
}
```

### Book 接口（已更新）

```typescript
interface Book {
  id: number;
  title: string;
  author: string;
  coverImage: string;
  description: string;
  publishDate: string;
  pages: number;
  category: string;
  hotspots?: Hotspot[];  // 新增：熱區數據數組
}
```

## 後端 API 響應格式

後端應該在教材詳情 API 響應中包含 `hotspots` 字段：

```json
{
  "id": 1,
  "title": "小紅帽",
  "author": "格林兄弟",
  "coverImage": "https://example.com/cover.jpg",
  "description": "一個關於小女孩與大野狼的經典童話故事",
  "publishDate": "2024-01-15",
  "pages": 32,
  "category": "童話故事",
  "hotspots": [
    {
      "id": "1",
      "x": 50,
      "y": 80,
      "width": 120,
      "height": 100,
      "label": "小紅帽",
      "audioUrl": "https://example.com/audio/little-red.mp3"
    },
    {
      "id": "2",
      "x": 200,
      "y": 150,
      "width": 100,
      "height": 90,
      "label": "大野狼",
      "audioUrl": "https://example.com/audio/wolf.mp3"
    }
  ]
}
```

## 功能特性

### 1. 熱區顯示

- **視覺效果**：
  - 半透明藍色邊框和背景
  - 懸停時高亮顯示
  - 選中時變為紅色邊框

- **標籤顯示**：
  - 懸停或選中時顯示熱區標籤
  - 標籤使用漸變色背景
  - 自動定位在熱區上方

### 2. 音訊播放

- **播放按鈕**：
  - 懸停熱區時顯示圓形播放按鈕
  - 按鈕位於熱區中心
  - 點擊播放對應的音訊檔案

- **當前實現**：
  - 顯示 alert 提示（模擬播放）
  - 實際項目中應使用 HTML5 Audio API

### 3. 熱區列表

- **右側面板顯示**：
  - 列出所有熱區
  - 顯示位置和大小信息
  - 提供快速播放按鈕

- **互動功能**：
  - 點擊列表項選中對應熱區
  - 選中的熱區在圖片上高亮顯示
  - 雙向同步選擇狀態

### 4. 響應式設計

- 支持移動端和桌面端
- 熱區位置自動適配圖片大小
- 觸摸設備友好

## 使用方式

### 前端集成

1. **獲取教材數據**：
```typescript
loadBook(id: number): void {
  this.bookService.getBookById(id).subscribe(book => {
    this.book = book;
    this.hotspots = book.hotspots || [];
  });
}
```

2. **選擇熱區**：
```typescript
selectHotspot(hotspot: Hotspot): void {
  this.selectedHotspot = hotspot;
}
```

3. **播放音訊**：
```typescript
playAudio(hotspot: Hotspot): void {
  if (hotspot.audioUrl) {
    const audio = new Audio(hotspot.audioUrl);
    audio.play();
  }
}
```

### 後端集成

1. **保存熱區數據**：
   - 在創建/編輯教材時保存熱區數組
   - 存儲為 JSON 格式

2. **返回熱區數據**：
   - 在教材詳情 API 中包含 `hotspots` 字段
   - 確保座標和尺寸為數字類型

## 樣式特點

### 熱區框
- 邊框：2px 實線，藍色半透明
- 背景：藍色半透明（10% 不透明度）
- 懸停：邊框變為完全不透明，背景變為 20% 不透明度
- 選中：紅色邊框和背景，帶陰影效果

### 標籤
- 背景：紫色漸變
- 文字：白色，0.75rem
- 位置：熱區上方 28px
- 動畫：淡入淡出效果

### 播放按鈕
- 大小：36px × 36px（圖片上）/ 28px × 28px（列表中）
- 背景：白色 / 紫色漸變
- 圖標：播放三角形
- 動畫：縮放和顏色變化

## 注意事項

1. **座標系統**：
   - 座標原點在圖片左上角
   - 使用像素單位
   - 需要根據圖片實際顯示大小調整

2. **音訊檔案**：
   - 支持常見音訊格式（MP3, WAV, OGG）
   - 建議使用 CDN 存儲
   - 需要處理 CORS 問題

3. **性能優化**：
   - 熱區數量建議不超過 20 個
   - 音訊檔案建議壓縮
   - 使用懶加載策略

4. **無障礙支持**：
   - 所有熱區都有 `title` 屬性
   - 鍵盤導航支持
   - 屏幕閱讀器友好

## 未來改進

1. **音訊播放器**：
   - 實現完整的音訊播放控制
   - 添加播放進度條
   - 支持暫停和重播

2. **熱區編輯**：
   - 在詳情頁支持快速編輯熱區
   - 拖拽調整位置和大小
   - 即時保存更改

3. **動畫效果**：
   - 熱區出現動畫
   - 選中時的脈衝效果
   - 音訊播放時的視覺反饋

4. **多語言支持**：
   - 支持多語言音訊
   - 根據用戶語言自動選擇

## 測試建議

1. **功能測試**：
   - 測試熱區點擊和選擇
   - 測試音訊播放
   - 測試響應式布局

2. **兼容性測試**：
   - 不同瀏覽器
   - 不同設備尺寸
   - 觸摸和滑鼠操作

3. **性能測試**：
   - 大量熱區的渲染性能
   - 音訊加載時間
   - 內存使用情況

## 相關文件

- `book-detail.component.ts` - 詳情頁組件邏輯
- `book-detail.component.html` - 詳情頁模板
- `book-detail.component.scss` - 詳情頁樣式
- `image-editor.component.ts` - 熱區編輯器（參考）
