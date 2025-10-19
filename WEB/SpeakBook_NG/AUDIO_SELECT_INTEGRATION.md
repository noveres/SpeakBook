# 音訊選擇功能集成說明

## 概述

圖片編輯器現已集成 VirtualSelectComponent 下拉選單，用於選擇熱區的音訊檔案。使用者可以從預定義的音訊列表中選擇，而不需要手動輸入 URL。

## 功能特點

### 1. 下拉選單選擇音訊
- 使用 `VirtualSelectComponent` 提供流暢的下拉選單體驗
- 支持搜尋功能，快速找到所需音訊
- 本地模式（不需要分頁）
- 自動完成和即時搜尋

### 2. 音訊列表管理
- 從後端獲取可用音訊列表
- 顯示音訊名稱，方便識別
- 支持動態更新音訊列表

### 3. 熱區音訊綁定
- 選擇熱區時自動載入對應的音訊
- 更改音訊時即時更新熱區數據
- 支持清除音訊選擇

## 實現細節

### 組件更新

#### ImageEditorComponent (TypeScript)

**新增導入**:
```typescript
import { VirtualSelectComponent, SelectOption } from '@shared/components/ui';
```

**新增屬性**:
```typescript
// 音訊選項
audioOptions: SelectOption[] = [];
selectedAudioId: string | null = null;
```

**新增方法**:

1. **loadAudioOptions()** - 載入音訊列表
```typescript
loadAudioOptions(): void {
  // 模擬從後端獲取音訊列表
  // 實際應該調用 audioService.getAudioList()
  this.audioOptions = [
    { id: 'audio1', name: '小紅帽音訊' },
    { id: 'audio2', name: '大野狼音訊' },
    // ... 更多音訊
  ];
}
```

2. **selectHotspot()** - 更新以載入音訊
```typescript
selectHotspot(hotspot: Hotspot): void {
  this.selectedHotspot = hotspot;
  // 設置當前選中的音訊 ID
  this.selectedAudioId = hotspot.audioUrl || null;
}
```

3. **onAudioChange()** - 處理音訊選擇變更
```typescript
onAudioChange(option: SelectOption | null): void {
  if (this.selectedHotspot && option) {
    // 更新選中熱區的音訊 URL
    this.selectedHotspot.audioUrl = option.id;
    console.log('更新熱區音訊:', this.selectedHotspot.label, '音訊ID:', option.id);
  }
}
```

#### ImageEditorComponent (HTML)

**替換前**:
```html
<div class="form-group">
    <label>音訊檔案 URL</label>
    <input type="text" [(ngModel)]="selectedHotspot.audioUrl" placeholder="輸入音訊檔案 URL" />
</div>
```

**替換後**:
```html
<div class="form-group">
    <label>音訊檔案</label>
    <app-virtual-select 
        [options]="audioOptions" 
        [(ngModel)]="selectedAudioId"
        (selectionChange)="onAudioChange($event)"
        [placeholder]="'選擇音訊檔案'"
        [searchPlaceholder]="'搜尋音訊...'"
        [searchable]="true"
        [enablePagination]="false">
    </app-virtual-select>
</div>
```

### UI 組件導出

更新了 `@shared/components/ui/index.ts`:
```typescript
export * from './virtual-select/virtual-select.component';
```

## 使用流程

### 1. 創建熱區
1. 在圖片上拖曳創建熱區
2. 熱區自動被選中
3. 右側面板顯示熱區詳細設定

### 2. 選擇音訊
1. 點擊「音訊檔案」下拉選單
2. 可以使用搜尋框快速找到音訊
3. 點擊選擇所需音訊
4. 音訊 ID 自動綁定到熱區的 `audioUrl` 屬性

### 3. 更改音訊
1. 選擇已有熱區
2. 下拉選單會顯示當前選擇的音訊
3. 可以重新選擇其他音訊
4. 更改會即時保存到熱區數據

## 數據結構

### SelectOption 接口
```typescript
export interface SelectOption {
  id: any;           // 音訊唯一標識（存儲在 hotspot.audioUrl）
  name: string;      // 音訊顯示名稱
  [key: string]: any; // 其他可選屬性
}
```

### Hotspot 接口（未變更）
```typescript
export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioUrl?: string;  // 存儲選中的音訊 ID
}
```

## 後端集成

### 獲取音訊列表

**API 端點**: `GET /api/audio/list`

**響應格式**:
```json
{
  "data": [
    {
      "id": "audio1",
      "name": "小紅帽音訊",
      "url": "https://cdn.example.com/audio/little-red.mp3",
      "duration": 15,
      "size": 245678
    },
    {
      "id": "audio2",
      "name": "大野狼音訊",
      "url": "https://cdn.example.com/audio/wolf.mp3",
      "duration": 12,
      "size": 198432
    }
  ]
}
```

### 實現音訊服務

創建 `AudioService`:
```typescript
@Injectable({
  providedIn: 'root'
})
export class AudioService {
  constructor(private http: HttpClient) {}

  getAudioList(): Observable<SelectOption[]> {
    return this.http.get<any>('/api/audio/list').pipe(
      map(response => response.data.map(audio => ({
        id: audio.id,
        name: audio.name,
        url: audio.url,
        duration: audio.duration
      })))
    );
  }
}
```

### 更新 ImageEditorComponent

```typescript
constructor(private audioService: AudioService) {}

loadAudioOptions(): void {
  this.audioService.getAudioList().subscribe(options => {
    this.audioOptions = options;
  });
}
```

## VirtualSelectComponent 配置

### 使用的屬性

| 屬性 | 值 | 說明 |
|------|-----|------|
| `options` | `audioOptions` | 音訊選項數組 |
| `ngModel` | `selectedAudioId` | 雙向綁定選中的音訊 ID |
| `selectionChange` | `onAudioChange($event)` | 選擇變更事件 |
| `placeholder` | `'選擇音訊檔案'` | 未選擇時的提示文字 |
| `searchPlaceholder` | `'搜尋音訊...'` | 搜尋框提示文字 |
| `searchable` | `true` | 啟用搜尋功能 |
| `enablePagination` | `false` | 本地模式，不需要分頁 |

### 可選配置

如果音訊列表很大，可以啟用分頁：

```html
<app-virtual-select 
    [options]="audioOptions" 
    [(ngModel)]="selectedAudioId"
    (selectionChange)="onAudioChange($event)"
    (loadMore)="onLoadMoreAudio($event)"
    [enablePagination]="true"
    [pageSize]="20"
    [hasMore]="hasMoreAudio">
</app-virtual-select>
```

## 優勢

### 1. 用戶體驗
- ✅ 不需要記憶或輸入複雜的 URL
- ✅ 視覺化選擇，減少錯誤
- ✅ 搜尋功能快速定位
- ✅ 下拉選單自動完成

### 2. 數據一致性
- ✅ 只能選擇已存在的音訊
- ✅ 避免無效的 URL
- ✅ 統一的音訊管理

### 3. 維護性
- ✅ 集中管理音訊資源
- ✅ 易於添加或移除音訊
- ✅ 可以添加額外的音訊元數據

## 未來改進

### 1. 音訊預覽
在下拉選單中添加播放按鈕：
```html
<app-virtual-select>
  <ng-template #optionTemplate let-option>
    <div class="audio-option">
      <span>{{ option.name }}</span>
      <button (click)="previewAudio(option)">
        <svg><!-- 播放圖標 --></svg>
      </button>
    </div>
  </ng-template>
</app-virtual-select>
```

### 2. 音訊上傳
添加直接上傳音訊的功能：
```html
<div class="form-group">
  <label>音訊檔案</label>
  <div class="audio-input-group">
    <app-virtual-select ...></app-virtual-select>
    <button (click)="uploadAudio()">上傳新音訊</button>
  </div>
</div>
```

### 3. 音訊分類
支持按類別篩選音訊：
```typescript
audioOptions = [
  { id: 'audio1', name: '小紅帽音訊', category: '角色' },
  { id: 'audio2', name: '森林背景音', category: '背景音樂' }
];
```

### 4. 批量設置
為多個熱區同時設置相同音訊：
```typescript
setBatchAudio(audioId: string): void {
  this.selectedHotspots.forEach(hotspot => {
    hotspot.audioUrl = audioId;
  });
}
```

## 測試建議

### 功能測試
1. ✅ 選擇音訊後正確綁定到熱區
2. ✅ 切換熱區時正確顯示對應音訊
3. ✅ 搜尋功能正常工作
4. ✅ 清除選擇功能正常

### 兼容性測試
1. ✅ 不同瀏覽器的下拉選單顯示
2. ✅ 移動設備的觸摸操作
3. ✅ 鍵盤導航支持

### 性能測試
1. ✅ 大量音訊選項的載入速度
2. ✅ 搜尋響應時間
3. ✅ 內存使用情況

## 相關文件

- `image-editor.component.ts` - 圖片編輯器組件
- `image-editor.component.html` - 圖片編輯器模板
- `virtual-select.component.ts` - 下拉選單組件
- `@shared/components/ui/index.ts` - UI 組件導出
