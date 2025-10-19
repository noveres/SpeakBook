# 音訊名稱顯示功能說明

## 概述

預覽組件現在會顯示具體的音訊名稱，而不是只顯示"已設定音訊"。通過共享的音訊數據常量，確保在不同組件間顯示一致的音訊信息。

## 實現方式

### 1. 創建共享音訊數據常量

**文件**: `src/app/core/constants/audio-data.ts`

```typescript
export interface AudioData {
  id: string;
  name: string;
  url: string;
  duration?: number;
  size?: number;
  category?: string;
}

export const AUDIO_DATA: AudioData[] = [
  {
    id: 'audio1',
    name: '小紅帽音訊',
    url: 'https://cdn.example.com/audio/little-red.mp3',
    duration: 15,
    category: '角色'
  },
  // ... 更多音訊
];

// 工具函數
export function getAudioNameByUrl(url: string): string {
  const audio = AUDIO_DATA.find(a => a.url === url);
  return audio ? audio.name : extractFileName(url);
}
```

### 2. 更新圖片編輯器組件

**文件**: `image-editor.component.ts`

```typescript
import { AUDIO_DATA } from '@core/constants/audio-data';

loadAudioOptions(): void {
  // 使用共享的音訊數據
  this.audioOptions = AUDIO_DATA.map(audio => ({
    id: audio.id,
    name: audio.name,
    url: audio.url,
    duration: audio.duration,
    category: audio.category
  }));
}
```

### 3. 更新預覽組件

**文件**: `book-preview.component.ts`

```typescript
import { getAudioNameByUrl } from '@core/constants/audio-data';

getAudioName(audioUrl: string): string {
  return getAudioNameByUrl(audioUrl);
}
```

**文件**: `book-preview.component.html`

```html
<span class="hotspot-audio" *ngIf="hotspot.audioUrl">
    <svg><!-- 音訊圖標 --></svg>
    音訊: {{ getAudioName(hotspot.audioUrl) }}
</span>
```

## 顯示效果

### 之前
```
✓ 已設定音訊
```

### 之後
```
🔊 音訊: 小紅帽音訊
🔊 音訊: 大野狼音訊
🔊 音訊: 森林背景音
```

## 數據流程

```
用戶選擇音訊
    ↓
hotspot.audioUrl = 'https://cdn.example.com/audio/little-red.mp3'
    ↓
預覽組件調用 getAudioName(audioUrl)
    ↓
getAudioNameByUrl() 查找 AUDIO_DATA
    ↓
找到匹配的音訊: { name: '小紅帽音訊', ... }
    ↓
顯示: "音訊: 小紅帽音訊"
```

## 優勢

### 1. 數據一致性
- ✅ 所有組件使用相同的音訊數據源
- ✅ 名稱、URL 保持一致
- ✅ 易於維護和更新

### 2. 代碼復用
- ✅ 避免重複定義音訊列表
- ✅ 共享工具函數
- ✅ 減少代碼冗餘

### 3. 易於擴展
- ✅ 新增音訊只需在一處更新
- ✅ 可以添加更多屬性（分類、時長等）
- ✅ 方便未來接入 API

## 完整範例

### 熱區預覽顯示

```html
<div class="hotspot-summary-item">
    <div class="hotspot-number">1</div>
    <div class="hotspot-details">
        <strong>小紅帽</strong>
        <span class="hotspot-info">位置: (50, 80) | 大小: 120 × 100</span>
        <span class="hotspot-audio">
            🔊 音訊: 小紅帽音訊
        </span>
    </div>
</div>
```

### 音訊數據結構

```typescript
{
  id: 'audio1',
  name: '小紅帽音訊',              // ← 顯示在預覽中
  url: 'https://cdn.example.com/audio/little-red.mp3',  // ← 存儲在 hotspot.audioUrl
  duration: 15,
  category: '角色'
}
```

## 未來改進

### 1. 從 API 獲取音訊數據

```typescript
// audio.service.ts
getAudioList(): Observable<AudioData[]> {
  return this.http.get<AudioListResponse>('/api/audio/list')
    .pipe(map(response => response.data));
}

// audio-data.ts
let AUDIO_DATA_CACHE: AudioData[] = [];

export function setAudioData(data: AudioData[]): void {
  AUDIO_DATA_CACHE = data;
}

export function getAudioNameByUrl(url: string): string {
  const audio = AUDIO_DATA_CACHE.find(a => a.url === url);
  return audio ? audio.name : extractFileName(url);
}
```

### 2. 添加音訊分類顯示

```html
<span class="hotspot-audio">
    🔊 音訊: {{ getAudioName(hotspot.audioUrl) }}
    <span class="audio-category">{{ getAudioCategory(hotspot.audioUrl) }}</span>
</span>
```

### 3. 顯示音訊時長

```html
<span class="hotspot-audio">
    🔊 音訊: {{ getAudioName(hotspot.audioUrl) }}
    <span class="audio-duration">({{ getAudioDuration(hotspot.audioUrl) }}秒)</span>
</span>
```

### 4. 添加播放預覽

```html
<span class="hotspot-audio">
    🔊 音訊: {{ getAudioName(hotspot.audioUrl) }}
    <button class="preview-audio" (click)="previewAudio(hotspot.audioUrl)">
        ▶ 試聽
    </button>
</span>
```

## 錯誤處理

### 找不到音訊時的處理

```typescript
export function getAudioNameByUrl(url: string): string {
  const audio = AUDIO_DATA.find(a => a.url === url);
  
  if (audio) {
    return audio.name;
  }
  
  // 後備方案：從 URL 提取檔案名
  const fileName = url.split('/').pop() || '';
  return fileName.replace('.mp3', '').replace(/-/g, ' ');
}
```

**範例**:
- 找到: `'https://cdn.example.com/audio/little-red.mp3'` → `'小紅帽音訊'`
- 找不到: `'https://other-cdn.com/audio/new-audio.mp3'` → `'new audio'`

## 測試建議

### 單元測試

```typescript
describe('getAudioNameByUrl', () => {
  it('應該返回正確的音訊名稱', () => {
    const url = 'https://cdn.example.com/audio/little-red.mp3';
    expect(getAudioNameByUrl(url)).toBe('小紅帽音訊');
  });

  it('找不到時應該返回格式化的檔案名', () => {
    const url = 'https://cdn.example.com/audio/unknown-audio.mp3';
    expect(getAudioNameByUrl(url)).toBe('unknown audio');
  });
});
```

### 集成測試

```typescript
it('預覽組件應該顯示音訊名稱', () => {
  const hotspot = {
    id: '1',
    label: '小紅帽',
    audioUrl: 'https://cdn.example.com/audio/little-red.mp3',
    x: 50, y: 80, width: 120, height: 100
  };
  
  component.hotspots = [hotspot];
  fixture.detectChanges();
  
  const audioSpan = fixture.nativeElement.querySelector('.hotspot-audio');
  expect(audioSpan.textContent).toContain('小紅帽音訊');
});
```

## 相關文件

- `src/app/core/constants/audio-data.ts` - 音訊數據常量
- `image-editor.component.ts` - 圖片編輯器（使用音訊數據）
- `book-preview.component.ts` - 預覽組件（顯示音訊名稱）
- `book-preview.component.html` - 預覽模板

## 總結

通過創建共享的音訊數據常量和工具函數：

✅ **統一數據源** - 所有組件使用相同的音訊信息
✅ **顯示具體名稱** - 用戶可以清楚看到選擇了哪個音訊
✅ **易於維護** - 只需在一處更新音訊列表
✅ **準備接入 API** - 結構設計便於未來從後端獲取數據
✅ **良好的用戶體驗** - 清晰的音訊信息展示
