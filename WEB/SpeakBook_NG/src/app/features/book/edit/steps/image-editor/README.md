# 圖片熱區編輯器使用說明

## 📋 目錄
- [功能概述](#功能概述)
- [核心概念](#核心概念)
- [使用方法](#使用方法)
- [技術實現](#技術實現)
- [數據結構](#數據結構)
- [常見問題](#常見問題)

---

## 功能概述

圖片熱區編輯器（Image Editor）是一個互動式工具，允許使用者在上傳的圖片上創建可點擊的「熱區」（Hotspot）。每個熱區可以設定標籤、音訊 URL 和位置資訊。

### 主要功能
- ✅ 在圖片上拖曳滑鼠創建矩形熱區
- ✅ 編輯熱區的標籤和音訊 URL
- ✅ 調整熱區的位置和大小
- ✅ 刪除單個或所有熱區
- ✅ 視覺化顯示所有熱區

---

## 核心概念

### 什麼是熱區？

**熱區（Hotspot）** 是圖片上的一個矩形區域，具有以下屬性：

```typescript
interface Hotspot {
  id: string;           // 唯一識別碼
  x: number;            // 左上角 X 座標（像素）
  y: number;            // 左上角 Y 座標（像素）
  width: number;        // 寬度（像素）
  height: number;       // 高度（像素）
  label: string;        // 標籤文字
  audioUrl?: string;    // 音訊檔案 URL（選填）
}
```

### 使用場景

例如，在一張動物圖片上：
- 熱區 1：位置 (100, 50)，大小 150×100，標籤「小狗」，音訊「dog.mp3」
- 熱區 2：位置 (300, 150)，大小 120×80，標籤「小貓」，音訊「cat.mp3」

當使用者點擊這些區域時，可以觸發相應的互動（播放音訊、顯示資訊等）。

---

## 使用方法

### 步驟 1：創建熱區

1. **在圖片上按住滑鼠左鍵**
2. **拖曳滑鼠**形成矩形區域
3. **放開滑鼠**完成繪製

```
開始點 (startX, startY)
    ┌─────────────┐
    │             │  拖曳中...
    │             │
    └─────────────┘
              結束點 (currentX, currentY)
```

### 步驟 2：編輯熱區資訊

創建熱區後，右側面板會自動顯示編輯表單：

1. **標籤**：輸入熱區的名稱（例如：「小狗」、「蘋果」）
2. **音訊 URL**：輸入音訊檔案的網址（選填）
3. **位置和大小**：可以手動調整數值

### 步驟 3：管理熱區

- **選擇熱區**：點擊圖片上的熱區或右側列表中的項目
- **刪除熱區**：點擊編輯表單中的「刪除熱區」按鈕
- **清除所有**：點擊頂部的「清除所有熱區」按鈕

---

## 技術實現

### 1. 滑鼠事件處理

#### 開始繪製（mousedown）
```typescript
onMouseDown(event: MouseEvent): void {
  // 1. 獲取滑鼠相對於圖片的座標
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  this.startX = event.clientX - rect.left;
  this.startY = event.clientY - rect.top;
  
  // 2. 標記為正在繪製
  this.isDrawing = true;
}
```

**說明：**
- `event.clientX/Y`：滑鼠在整個視窗的座標
- `rect.left/top`：圖片元素在視窗中的位置
- 相減得到滑鼠在圖片內的相對座標

#### 繪製中（mousemove）
```typescript
onMouseMove(event: MouseEvent): void {
  if (!this.isDrawing) return;  // 沒在繪製就忽略
  
  // 1. 計算當前座標
  const rect = (event.target as HTMLElement).getBoundingClientRect();
  this.currentX = event.clientX - rect.left;
  this.currentY = event.clientY - rect.top;
  
  // 2. 計算矩形的位置和大小
  this.currentHotspot = {
    x: Math.min(this.startX, this.currentX),      // 左上角 X
    y: Math.min(this.startY, this.currentY),      // 左上角 Y
    width: Math.abs(this.currentX - this.startX), // 寬度
    height: Math.abs(this.currentY - this.startY) // 高度
  };
}
```

**為什麼要用 Math.min 和 Math.abs？**

因為使用者可能從右下往左上拖曳：

```
情況 1：從左上到右下拖曳
startX=100, currentX=200
→ x = min(100,200) = 100 ✓
→ width = abs(200-100) = 100 ✓

情況 2：從右下到左上拖曳
startX=200, currentX=100
→ x = min(200,100) = 100 ✓
→ width = abs(100-200) = 100 ✓
```

#### 完成繪製（mouseup）
```typescript
onMouseUp(): void {
  if (!this.isDrawing || !this.currentHotspot) return;
  
  // 1. 檢查熱區大小（至少 10×10 像素）
  if (this.currentHotspot.width < 10 || this.currentHotspot.height < 10) {
    alert('熱區太小，請重新繪製');
    this.resetDrawing();
    return;
  }
  
  // 2. 創建新熱區
  const newHotspot: Hotspot = {
    id: this.generateId(),
    x: this.currentHotspot.x,
    y: this.currentHotspot.y,
    width: this.currentHotspot.width,
    height: this.currentHotspot.height,
    label: `熱區 ${this.hotspots.length + 1}`,
    audioUrl: ''
  };
  
  // 3. 加入陣列並選中
  this.hotspots.push(newHotspot);
  this.selectedHotspot = newHotspot;
  
  // 4. 重置繪製狀態
  this.resetDrawing();
}
```

### 2. 視覺化顯示

#### 繪製中的預覽（半透明藍色）
```html
<div *ngIf="isDrawing && currentHotspot" 
     class="drawing-hotspot"
     [style.left.px]="currentHotspot.x"
     [style.top.px]="currentHotspot.y"
     [style.width.px]="currentHotspot.width"
     [style.height.px]="currentHotspot.height">
</div>
```

```scss
.drawing-hotspot {
  position: absolute;
  border: 2px dashed #3498db;
  background: rgba(52, 152, 219, 0.2);
  pointer-events: none;  // 不阻擋滑鼠事件
}
```

#### 已保存的熱區（綠色邊框）
```html
<div *ngFor="let hotspot of hotspots" 
     class="hotspot"
     [class.selected]="selectedHotspot?.id === hotspot.id"
     [style.left.px]="hotspot.x"
     [style.top.px]="hotspot.y"
     [style.width.px]="hotspot.width"
     [style.height.px]="hotspot.height"
     (click)="selectHotspot(hotspot)">
  <span class="hotspot-label">{{ hotspot.label }}</span>
</div>
```

```scss
.hotspot {
  position: absolute;
  border: 2px solid #005746;           // 綠色邊框
  background: rgba(0, 87, 70, 0.2);    // 半透明綠色背景
  cursor: pointer;
  
  &.selected {
    border-color: #e74c3c;             // 選中時變紅色
    background: rgba(231, 76, 60, 0.2);
  }
}
```

### 3. 座標系統圖解

```
圖片元素 (HTMLImageElement)
┌─────────────────────────────────┐
│ (0, 0)                          │
│   ┌──────────┐                  │
│   │  熱區 1  │ ← (x, y)         │
│   │          │                  │
│   └──────────┘                  │
│        ↑                        │
│    width × height               │
│                                 │
│              ┌─────┐            │
│              │熱區2│            │
│              └─────┘            │
│                                 │
└─────────────────────────────────┘
                          (imgWidth, imgHeight)
```

---

## 數據結構

### 組件狀態

```typescript
export class ImageEditorComponent {
  // 輸入：選中的圖片
  @Input() selectedImage: UploadedImage | null = null;
  
  // 熱區陣列（所有已創建的熱區）
  hotspots: Hotspot[] = [];
  
  // 當前選中的熱區（用於編輯）
  selectedHotspot: Hotspot | null = null;
  
  // 繪製狀態
  isDrawing = false;              // 是否正在繪製
  startX = 0;                     // 起始 X 座標
  startY = 0;                     // 起始 Y 座標
  currentX = 0;                   // 當前 X 座標
  currentY = 0;                   // 當前 Y 座標
  currentHotspot: any = null;     // 繪製中的熱區預覽
}
```

### 數據流程

```
1. 使用者拖曳滑鼠
   ↓
2. onMouseDown → 記錄起始座標
   ↓
3. onMouseMove → 計算並顯示預覽矩形
   ↓
4. onMouseUp → 創建 Hotspot 物件
   ↓
5. 加入 hotspots[] 陣列
   ↓
6. 顯示在圖片上 + 右側列表
   ↓
7. 使用者編輯標籤和音訊 URL
   ↓
8. 雙向綁定自動更新 hotspot 物件
```

---

## 常見問題

### Q1: 為什麼要限制最小尺寸（10×10）？

**答：** 防止使用者不小心點擊產生極小的熱區，這些熱區難以選中和編輯。

### Q2: 熱區的座標是相對於什麼？

**答：** 相對於圖片元素的左上角 (0, 0)。這樣即使圖片縮放，熱區位置也能正確對應。

### Q3: 如何確保熱區不會超出圖片範圍？

**答：** 目前使用 `mouseleave` 事件，當滑鼠離開圖片時自動結束繪製。也可以加入邊界檢查：

```typescript
// 限制座標在圖片範圍內
const maxX = this.imageElement.width;
const maxY = this.imageElement.height;

this.currentX = Math.max(0, Math.min(this.currentX, maxX));
this.currentY = Math.max(0, Math.min(this.currentY, maxY));
```

### Q4: 為什麼使用 `position: absolute`？

**答：** 讓熱區可以精確定位在圖片的任意位置。父容器需要設定 `position: relative`。

### Q5: 如何實現熱區的拖曳和調整大小？

**答：** 目前版本只支援創建和刪除。如需拖曳功能，可以添加：

```typescript
// 拖曳熱區
onHotspotMouseDown(event: MouseEvent, hotspot: Hotspot): void {
  this.isDragging = true;
  this.draggedHotspot = hotspot;
  this.dragStartX = event.clientX - hotspot.x;
  this.dragStartY = event.clientY - hotspot.y;
}

onHotspotMouseMove(event: MouseEvent): void {
  if (!this.isDragging) return;
  this.draggedHotspot.x = event.clientX - this.dragStartX;
  this.draggedHotspot.y = event.clientY - this.dragStartY;
}
```

---

## 使用範例

### 完整的創建流程

```typescript
// 1. 使用者上傳圖片
selectedImage = {
  id: 'img123',
  url: 'blob:http://localhost/abc',
  name: 'animals.jpg',
  size: 102400
};

// 2. 在圖片上拖曳創建熱區
// 滑鼠從 (100, 50) 拖到 (250, 150)

// 3. 自動生成熱區物件
hotspot = {
  id: '1234567890',
  x: 100,
  y: 50,
  width: 150,
  height: 100,
  label: '熱區 1',
  audioUrl: ''
};

// 4. 使用者編輯
hotspot.label = '小狗';
hotspot.audioUrl = 'https://example.com/dog.mp3';

// 5. 最終數據
hotspots = [
  {
    id: '1234567890',
    x: 100,
    y: 50,
    width: 150,
    height: 100,
    label: '小狗',
    audioUrl: 'https://example.com/dog.mp3'
  }
];
```

---

## 技術要點總結

### 關鍵技術
1. **滑鼠事件處理**：mousedown → mousemove → mouseup
2. **座標計算**：相對座標 = 絕對座標 - 元素偏移
3. **動態樣式綁定**：`[style.left.px]`、`[style.width.px]`
4. **雙向數據綁定**：`[(ngModel)]` 自動同步表單和數據
5. **條件渲染**：`*ngIf`、`*ngFor` 控制顯示

### 設計模式
- **狀態管理**：使用 `isDrawing` 標記繪製狀態
- **事件驅動**：滑鼠事件觸發狀態變化
- **數據綁定**：Angular 雙向綁定簡化更新邏輯

---

## 延伸功能建議

### 可以添加的功能
- [ ] 熱區拖曳移動
- [ ] 熱區調整大小（8個控制點）
- [ ] 熱區複製/貼上
- [ ] 撤銷/重做功能
- [ ] 鍵盤快捷鍵（Delete 刪除、Ctrl+Z 撤銷）
- [ ] 熱區顏色自訂
- [ ] 匯出/匯入熱區數據（JSON）
- [ ] 熱區對齊輔助線
- [ ] 圖片縮放功能

---

## 相關文件

- `image-editor.component.ts` - 主要邏輯
- `image-editor.component.html` - 模板結構
- `image-editor.component.scss` - 樣式定義

---

**最後更新：** 2025-10-16  
**版本：** 1.0.0
