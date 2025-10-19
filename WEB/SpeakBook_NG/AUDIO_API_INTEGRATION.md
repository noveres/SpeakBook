# 音訊 API 集成說明

## 概述

本文檔說明如何將音訊選擇功能與後端 API 集成，包括數據格式、API 端點和實現細節。

## 數據結構

### 音訊選項格式

```typescript
interface AudioOption extends SelectOption {
  id: string;        // 音訊唯一標識
  name: string;      // 音訊顯示名稱
  url: string;       // 音訊檔案完整 URL（重要！）
  duration?: number; // 音訊時長（秒）
  size?: number;     // 檔案大小（字節）
  category?: string; // 音訊分類
  createdAt?: string; // 創建時間
}
```

### 熱區數據格式

```typescript
interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioUrl: string;  // 存儲完整的音訊 URL（不是 ID）
}
```

## API 端點

### 1. 獲取音訊列表

**端點**: `GET /api/audio/list`

**請求參數**:
```typescript
{
  page?: number;      // 頁碼（可選，分頁時使用）
  pageSize?: number;  // 每頁數量（可選）
  search?: string;    // 搜尋關鍵字（可選）
  category?: string;  // 分類篩選（可選）
}
```

**響應格式**:
```json
{
  "success": true,
  "data": [
    {
      "id": "audio_001",
      "name": "小紅帽音訊",
      "url": "https://cdn.example.com/audio/little-red.mp3",
      "duration": 15,
      "size": 245678,
      "category": "角色",
      "createdAt": "2024-10-19T10:00:00Z"
    },
    {
      "id": "audio_002",
      "name": "大野狼音訊",
      "url": "https://cdn.example.com/audio/wolf.mp3",
      "duration": 12,
      "size": 198432,
      "category": "角色",
      "createdAt": "2024-10-19T10:05:00Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 50,
    "pageSize": 10
  }
}
```

### 2. 上傳音訊檔案（未來功能）

**端點**: `POST /api/audio/upload`

**請求格式**: `multipart/form-data`

**請求參數**:
```typescript
{
  file: File;         // 音訊檔案
  name: string;       // 音訊名稱
  category?: string;  // 分類
}
```

**響應格式**:
```json
{
  "success": true,
  "data": {
    "id": "audio_new",
    "name": "新上傳的音訊",
    "url": "https://cdn.example.com/audio/new-audio.mp3",
    "duration": 20,
    "size": 320000
  }
}
```

## 前端實現

### 1. 創建音訊服務

**文件**: `src/app/core/services/audio.service.ts`

```typescript
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { SelectOption } from '@shared/components/ui';

export interface AudioOption extends SelectOption {
  url: string;
  duration?: number;
  size?: number;
  category?: string;
}

export interface AudioListResponse {
  success: boolean;
  data: AudioOption[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    pageSize: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = '/api/audio';

  constructor(private http: HttpClient) {}

  /**
   * 獲取音訊列表
   * @param params 查詢參數
   */
  getAudioList(params?: {
    page?: number;
    pageSize?: number;
    search?: string;
    category?: string;
  }): Observable<AudioOption[]> {
    let httpParams = new HttpParams();
    
    if (params?.page !== undefined) {
      httpParams = httpParams.set('page', params.page.toString());
    }
    if (params?.pageSize) {
      httpParams = httpParams.set('pageSize', params.pageSize.toString());
    }
    if (params?.search) {
      httpParams = httpParams.set('search', params.search);
    }
    if (params?.category) {
      httpParams = httpParams.set('category', params.category);
    }

    return this.http.get<AudioListResponse>(`${this.apiUrl}/list`, { params: httpParams })
      .pipe(
        map(response => response.data)
      );
  }

  /**
   * 根據 URL 查找音訊選項
   * @param url 音訊 URL
   */
  getAudioByUrl(url: string): Observable<AudioOption | null> {
    return this.getAudioList().pipe(
      map(options => options.find(opt => opt.url === url) || null)
    );
  }

  /**
   * 上傳音訊檔案
   * @param file 音訊檔案
   * @param name 音訊名稱
   * @param category 分類
   */
  uploadAudio(file: File, name: string, category?: string): Observable<AudioOption> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (category) {
      formData.append('category', category);
    }

    return this.http.post<{ success: boolean; data: AudioOption }>(
      `${this.apiUrl}/upload`,
      formData
    ).pipe(
      map(response => response.data)
    );
  }
}
```

### 2. 更新 ImageEditorComponent

**文件**: `image-editor.component.ts`

```typescript
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadedImage } from '../upload-image/upload-image.component';
import { VirtualSelectComponent, SelectOption } from '@shared/components/ui';
import { AudioService, AudioOption } from '@core/services/audio.service';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioUrl?: string; // 存儲完整的音訊 URL
}

@Component({
  selector: 'app-image-editor',
  imports: [CommonModule, FormsModule, VirtualSelectComponent],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent implements OnChanges {
  @Input() selectedImage: UploadedImage | null = null;

  hotspots: Hotspot[] = [];
  isDrawing = false;
  startX = 0;
  startY = 0;
  currentHotspot: Hotspot | null = null;
  selectedHotspot: Hotspot | null = null;

  canvasWidth = 0;
  canvasHeight = 0;

  // 音訊選項
  audioOptions: AudioOption[] = [];
  selectedAudioId: string | null = null;
  isLoadingAudio = false;

  constructor(private audioService: AudioService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedImage'] && this.selectedImage) {
      // 清空熱區當切換圖片時
      this.hotspots = [];
      this.selectedHotspot = null;
      this.currentHotspot = null;
      this.loadAudioOptions();
    }
  }

  loadAudioOptions(): void {
    this.isLoadingAudio = true;
    
    // 從後端 API 獲取音訊列表
    this.audioService.getAudioList().subscribe({
      next: (options) => {
        this.audioOptions = options;
        this.isLoadingAudio = false;
        console.log('音訊列表載入成功:', options.length, '個音訊');
      },
      error: (error) => {
        console.error('載入音訊列表失敗:', error);
        this.isLoadingAudio = false;
        // 使用模擬數據作為後備
        this.loadMockAudioOptions();
      }
    });
  }

  // 模擬數據（開發時使用）
  private loadMockAudioOptions(): void {
    this.audioOptions = [
      { id: 'audio1', name: '小紅帽音訊', url: 'https://cdn.example.com/audio/little-red.mp3' },
      { id: 'audio2', name: '大野狼音訊', url: 'https://cdn.example.com/audio/wolf.mp3' },
      { id: 'audio3', name: '奶奶的房子音訊', url: 'https://cdn.example.com/audio/grandma-house.mp3' },
      { id: 'audio4', name: '森林背景音', url: 'https://cdn.example.com/audio/forest-bg.mp3' },
      { id: 'audio5', name: '故事旁白', url: 'https://cdn.example.com/audio/narration.mp3' }
    ];
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    
    // 根據 URL 找到對應的音訊選項
    if (hotspot.audioUrl) {
      const audioOption = this.audioOptions.find(opt => opt.url === hotspot.audioUrl);
      this.selectedAudioId = audioOption ? audioOption.id : hotspot.audioUrl;
    } else {
      this.selectedAudioId = null;
    }
  }

  onAudioChange(option: SelectOption | null): void {
    if (this.selectedHotspot && option) {
      // 更新選中熱區的音訊 URL（使用完整的 URL）
      const audioOption = option as AudioOption;
      this.selectedHotspot.audioUrl = audioOption.url;
      console.log('更新熱區音訊:', this.selectedHotspot.label, '音訊URL:', audioOption.url);
    }
  }

  // ... 其他方法保持不變
}
```

## 數據流程

### 1. 載入音訊列表

```
用戶打開圖片編輯器
    ↓
ngOnChanges 觸發
    ↓
調用 loadAudioOptions()
    ↓
AudioService.getAudioList()
    ↓
HTTP GET /api/audio/list
    ↓
後端返回音訊列表（包含 URL）
    ↓
更新 audioOptions
    ↓
VirtualSelectComponent 顯示選項
```

### 2. 選擇音訊

```
用戶點擊下拉選單
    ↓
選擇音訊選項
    ↓
觸發 selectionChange 事件
    ↓
調用 onAudioChange(option)
    ↓
從 option.url 獲取完整 URL
    ↓
更新 selectedHotspot.audioUrl = option.url
    ↓
熱區數據包含完整的音訊 URL
```

### 3. 保存教材

```
用戶點擊發布/保存
    ↓
收集所有熱區數據
    ↓
每個熱區包含 audioUrl（完整 URL）
    ↓
POST /api/books/create
    ↓
後端保存教材和熱區數據
```

## 重要注意事項

### 1. URL vs ID

**❌ 錯誤做法**（只存 ID）:
```typescript
hotspot.audioUrl = option.id; // 'audio1'
```

**✅ 正確做法**（存完整 URL）:
```typescript
hotspot.audioUrl = option.url; // 'https://cdn.example.com/audio/little-red.mp3'
```

### 2. 為什麼需要 URL？

- **播放音訊**: HTML5 Audio 需要完整的 URL
- **跨域支持**: CDN URL 可以配置 CORS
- **緩存優化**: 瀏覽器可以緩存音訊檔案
- **獨立性**: 不依賴額外的 API 查詢

### 3. 選中熱區時的處理

當選中已有熱區時，需要反向查找：

```typescript
selectHotspot(hotspot: Hotspot): void {
  this.selectedHotspot = hotspot;
  
  if (hotspot.audioUrl) {
    // 根據 URL 找到對應的選項
    const audioOption = this.audioOptions.find(opt => opt.url === hotspot.audioUrl);
    
    if (audioOption) {
      // 找到了，使用 ID
      this.selectedAudioId = audioOption.id;
    } else {
      // 沒找到（可能是舊數據），直接使用 URL
      this.selectedAudioId = hotspot.audioUrl;
    }
  } else {
    this.selectedAudioId = null;
  }
}
```

## 測試數據

### 開發環境模擬數據

```typescript
private loadMockAudioOptions(): void {
  this.audioOptions = [
    {
      id: 'audio_001',
      name: '小紅帽音訊',
      url: 'https://cdn.example.com/audio/little-red.mp3',
      duration: 15,
      size: 245678,
      category: '角色'
    },
    {
      id: 'audio_002',
      name: '大野狼音訊',
      url: 'https://cdn.example.com/audio/wolf.mp3',
      duration: 12,
      size: 198432,
      category: '角色'
    },
    {
      id: 'audio_003',
      name: '奶奶的房子音訊',
      url: 'https://cdn.example.com/audio/grandma-house.mp3',
      duration: 18,
      size: 289012,
      category: '場景'
    },
    {
      id: 'audio_004',
      name: '森林背景音',
      url: 'https://cdn.example.com/audio/forest-bg.mp3',
      duration: 60,
      size: 980000,
      category: '背景音樂'
    },
    {
      id: 'audio_005',
      name: '故事旁白',
      url: 'https://cdn.example.com/audio/narration.mp3',
      duration: 120,
      size: 1950000,
      category: '旁白'
    }
  ];
}
```

## 錯誤處理

### 1. API 載入失敗

```typescript
loadAudioOptions(): void {
  this.isLoadingAudio = true;
  
  this.audioService.getAudioList().subscribe({
    next: (options) => {
      this.audioOptions = options;
      this.isLoadingAudio = false;
    },
    error: (error) => {
      console.error('載入音訊列表失敗:', error);
      this.isLoadingAudio = false;
      
      // 顯示錯誤提示
      alert('載入音訊列表失敗，請稍後再試');
      
      // 使用模擬數據作為後備
      this.loadMockAudioOptions();
    }
  });
}
```

### 2. 音訊檔案不存在

```typescript
onAudioChange(option: SelectOption | null): void {
  if (this.selectedHotspot && option) {
    const audioOption = option as AudioOption;
    
    // 驗證 URL 是否有效
    if (!audioOption.url) {
      console.error('音訊選項缺少 URL:', audioOption);
      alert('此音訊檔案無效，請選擇其他音訊');
      return;
    }
    
    this.selectedHotspot.audioUrl = audioOption.url;
  }
}
```

## 性能優化

### 1. 緩存音訊列表

```typescript
export class AudioService {
  private audioCache: AudioOption[] | null = null;
  private cacheTime: number = 0;
  private cacheDuration = 5 * 60 * 1000; // 5分鐘

  getAudioList(params?: any): Observable<AudioOption[]> {
    // 檢查緩存
    if (this.audioCache && (Date.now() - this.cacheTime) < this.cacheDuration) {
      return of(this.audioCache);
    }

    return this.http.get<AudioListResponse>(`${this.apiUrl}/list`, { params })
      .pipe(
        map(response => {
          this.audioCache = response.data;
          this.cacheTime = Date.now();
          return response.data;
        })
      );
  }
}
```

### 2. 延遲載入

```typescript
ngOnChanges(changes: SimpleChanges): void {
  if (changes['selectedImage'] && this.selectedImage) {
    // 只在需要時載入音訊列表
    if (this.audioOptions.length === 0) {
      this.loadAudioOptions();
    }
  }
}
```

## 總結

- ✅ 音訊選項包含完整的 `url` 屬性
- ✅ 熱區的 `audioUrl` 存儲完整 URL
- ✅ 使用 AudioService 從後端獲取音訊列表
- ✅ 支持錯誤處理和模擬數據後備
- ✅ 優化性能和用戶體驗
