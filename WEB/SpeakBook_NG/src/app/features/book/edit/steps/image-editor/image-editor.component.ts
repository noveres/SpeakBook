import { Component, Input, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadedImage } from '../upload-image/upload-image.component';
import { VirtualSelectComponent, SelectOption, AudioCardComponent, AudioCardData } from '@shared/components/ui';
import { AudioService } from '@features/audio/service/audio.service';
import { PageRequest } from '@core/models';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioId?: string;
  audioUrl?: string;
  isInvalid?: boolean; // 標記是否為無效熱區（未選擇音訊）
}

@Component({
  selector: 'app-image-editor',
  imports: [CommonModule, FormsModule, VirtualSelectComponent, AudioCardComponent],
  templateUrl: './image-editor.component.html',
  styleUrl: './image-editor.component.scss'
})
export class ImageEditorComponent implements OnChanges, OnInit, OnDestroy {
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
  audioOptions: SelectOption[] = [];
  selectedAudioId: string | null = null;

  // 分頁相關
  audioLoading: boolean = false;
  audioTotalPages: number = 0;
  audioHasMore: boolean = true;
  currentAudioPage: number = 1;
  currentSearchTerm: string = '';

  // 音訊播放相關
  private currentAudio: HTMLAudioElement | null = null;
  playingHotspotId: string | null = null;
  audioCurrentTime: number = 0;
  audioDuration: number = 0;

  constructor(private audioService: AudioService) { }

  ngOnInit(): void {
    // 不在初始化時載入,等待用戶打開下拉選單
  }

  ngOnDestroy(): void {
    // 組件銷毀時停止音訊播放
    this.stopAudio();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['selectedImage'] && this.selectedImage) {
      // 清空熱區當切換圖片時
      this.hotspots = [];
      this.selectedHotspot = null;
      this.currentHotspot = null;
    }
  }

  // 載入音訊選項 (支援分頁和搜尋)
  loadAudioPage(event: { page: number, pageSize: number, searchTerm: string }): void {
    this.audioLoading = true;
    this.currentAudioPage = event.page + 1; // VirtualSelect 從 0 開始,API 從 1 開始
    this.currentSearchTerm = event.searchTerm;

    const pageRequest: PageRequest = {
      page: this.currentAudioPage,
      pageSize: event.pageSize,
      sortBy: 'createdAt,desc'
    };

    this.audioService.getAudios(pageRequest, event.searchTerm).subscribe({
      next: (response) => {
        const newOptions = response.content.map(audio => ({
          id: audio.id.toString(),
          name: audio.name,
          url: audio.url,
          duration: audio.duration,
          category: audio.category
        }));

        // 如果是第一頁或搜尋,替換選項;否則追加
        if (event.page === 0) {
          this.audioOptions = newOptions;
        } else {
          this.audioOptions = [...this.audioOptions, ...newOptions];
        }

        this.audioTotalPages = response.totalPages;
        this.audioHasMore = this.currentAudioPage < response.totalPages;
        this.audioLoading = false;

        console.log(`載入音訊第 ${this.currentAudioPage} 頁:`, newOptions.length, '個音訊');
      },
      error: (error) => {
        console.error('載入音訊選項失敗:', error);
        this.audioLoading = false;
        this.audioHasMore = false;
      }
    });
  }

  // 保留舊方法以便向後兼容
  loadAudioOptions(): void {
    this.loadAudioPage({ page: 0, pageSize: 20, searchTerm: '' });
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    this.canvasWidth = img.clientWidth;
    this.canvasHeight = img.clientHeight;
  }

  onMouseDown(event: MouseEvent): void {
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    this.startX = event.clientX - rect.left;
    this.startY = event.clientY - rect.top;
    this.isDrawing = true;

    this.currentHotspot = {
      id: this.generateId(),
      x: this.startX,
      y: this.startY,
      width: 0,
      height: 0,
      label: `熱區 ${this.hotspots.length + 1}`
    };
  }

  onMouseMove(event: MouseEvent): void {
    if (!this.isDrawing || !this.currentHotspot) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const currentX = event.clientX - rect.left;
    const currentY = event.clientY - rect.top;

    this.currentHotspot.width = currentX - this.startX;
    this.currentHotspot.height = currentY - this.startY;
  }

  onMouseUp(): void {
    if (this.isDrawing && this.currentHotspot) {
      // 只保存有效的熱區（寬高都大於10px）
      if (Math.abs(this.currentHotspot.width) > 10 && Math.abs(this.currentHotspot.height) > 10) {
        // 標準化負數寬高
        if (this.currentHotspot.width < 0) {
          this.currentHotspot.x += this.currentHotspot.width;
          this.currentHotspot.width = Math.abs(this.currentHotspot.width);
        }
        if (this.currentHotspot.height < 0) {
          this.currentHotspot.y += this.currentHotspot.height;
          this.currentHotspot.height = Math.abs(this.currentHotspot.height);
        }

        this.hotspots.push(this.currentHotspot);
        this.selectedHotspot = this.currentHotspot;
        // 清除音訊選擇器，因為新熱區還沒有音訊
        this.selectedAudioId = null;
      }
      this.currentHotspot = null;
    }
    this.isDrawing = false;
  }

  // 觸控事件處理
  onTouchStart(event: TouchEvent): void {
    event.preventDefault(); // 防止觸控時的預設行為（如滾動）
    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    this.startX = touch.clientX - rect.left;
    this.startY = touch.clientY - rect.top;
    this.isDrawing = true;

    this.currentHotspot = {
      id: this.generateId(),
      x: this.startX,
      y: this.startY,
      width: 0,
      height: 0,
      label: `熱區 ${this.hotspots.length + 1}`
    };
  }

  onTouchMove(event: TouchEvent): void {
    event.preventDefault();
    if (!this.isDrawing || !this.currentHotspot) return;

    const canvas = event.currentTarget as HTMLElement;
    const rect = canvas.getBoundingClientRect();
    const touch = event.touches[0];
    const currentX = touch.clientX - rect.left;
    const currentY = touch.clientY - rect.top;

    this.currentHotspot.width = currentX - this.startX;
    this.currentHotspot.height = currentY - this.startY;
  }

  onTouchEnd(event: TouchEvent): void {
    event.preventDefault();
    if (this.isDrawing && this.currentHotspot) {
      // 只保存有效的熱區（寬高都大於10px）
      if (Math.abs(this.currentHotspot.width) > 10 && Math.abs(this.currentHotspot.height) > 10) {
        // 標準化負數寬高
        if (this.currentHotspot.width < 0) {
          this.currentHotspot.x += this.currentHotspot.width;
          this.currentHotspot.width = Math.abs(this.currentHotspot.width);
        }
        if (this.currentHotspot.height < 0) {
          this.currentHotspot.y += this.currentHotspot.height;
          this.currentHotspot.height = Math.abs(this.currentHotspot.height);
        }

        this.hotspots.push(this.currentHotspot);
        this.selectedHotspot = this.currentHotspot;
        // 清除音訊選擇器，因為新熱區還沒有音訊
        this.selectedAudioId = null;
      }
      this.currentHotspot = null;
    }
    this.isDrawing = false;
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    // 設置當前選中的音訊 ID（使用 audioId 而非 audioUrl）
    this.selectedAudioId = hotspot.audioId || null;
  }

  onAudioChange(option: SelectOption | null): void {
    if (this.selectedHotspot && option) {
      // 同時保存音訊 ID 和 URL
      this.selectedHotspot.audioId = option.id;
      this.selectedHotspot.audioUrl = (option as any).url || option.id;
      // 同步更新 selectedAudioId
      this.selectedAudioId = option.id;
      // 清除無效標記
      delete this.selectedHotspot.isInvalid;
      console.log('更新熱區音訊:', this.selectedHotspot.label, '音訊ID:', option.id, '音訊URL:', this.selectedHotspot.audioUrl);
    }
  }

  deleteHotspot(hotspot: Hotspot): void {
    const index = this.hotspots.indexOf(hotspot);
    if (index > -1) {
      this.hotspots.splice(index, 1);
      if (this.selectedHotspot?.id === hotspot.id) {
        this.selectedHotspot = null;
      }
    }
  }

  clearAllHotspots(): void {
    if (confirm('確定要清除所有熱區嗎？')) {
      this.hotspots = [];
      this.selectedHotspot = null;
    }
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // 標記未選擇音訊的熱區
  markInvalidHotspots(invalidHotspots: Hotspot[]): void {
    invalidHotspots.forEach(hotspot => {
      (hotspot as any).isInvalid = true;
    });
  }

  // 清除所有無效標記
  clearInvalidMarks(): void {
    this.hotspots.forEach(hotspot => {
      delete (hotspot as any).isInvalid;
    });
  }

  // 播放音訊
  playAudio(hotspot: Hotspot): void {
    if (!hotspot.audioUrl) {
      alert('此熱區尚未選擇音訊');
      return;
    }

    // 如果正在播放同一個熱區的音訊，則停止播放
    if (this.playingHotspotId === hotspot.id) {
      this.stopAudio();
      return;
    }

    // 停止當前播放的音訊
    this.stopAudio();

    try {
      this.currentAudio = new Audio(hotspot.audioUrl);
      this.playingHotspotId = hotspot.id;

      // 監聽音訊載入完成
      this.currentAudio.addEventListener('loadedmetadata', () => {
        this.audioDuration = this.currentAudio?.duration || 0;
      });

      // 監聽播放進度
      this.currentAudio.addEventListener('timeupdate', () => {
        this.audioCurrentTime = this.currentAudio?.currentTime || 0;
      });

      // 監聽播放結束
      this.currentAudio.addEventListener('ended', () => {
        this.playingHotspotId = null;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
        console.log('音訊播放完成');
      });

      // 監聽錯誤
      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        alert('音訊播放失敗，請檢查音訊檔案是否存在');
        this.playingHotspotId = null;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });

      this.currentAudio.play().then(() => {
        console.log('開始播放音訊:', hotspot.label);
      }).catch((error) => {
        console.error('播放失敗:', error);
        alert('無法播放音訊');
        this.playingHotspotId = null;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
      alert('音訊初始化失敗');
      this.playingHotspotId = null;
      this.audioCurrentTime = 0;
      this.audioDuration = 0;
    }
  }

  // 停止音訊
  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.playingHotspotId = null;
    this.audioCurrentTime = 0;
    this.audioDuration = 0;
  }

  // 檢查是否正在播放
  isPlaying(hotspotId: string): boolean {
    return this.playingHotspotId === hotspotId;
  }

  // 獲取音訊名稱
  getAudioName(hotspot: Hotspot): string {
    if (!hotspot.audioId && !hotspot.audioUrl) {
      return '未選擇音訊';
    }

    // 從 audioOptions 中查找對應的音訊名稱
    const audioOption = this.audioOptions.find(option => option.id === hotspot.audioId);
    if (audioOption) {
      return audioOption.name;
    }

    // 如果找不到，嘗試從 URL 提取檔案名
    if (hotspot.audioUrl) {
      const urlParts = hotspot.audioUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      return decodeURIComponent(fileName);
    }

    return '未知音訊';
  }

  // 轉換 Hotspot 為 AudioCardData
  toAudioCardData(hotspot: Hotspot): AudioCardData {
    return {
      id: hotspot.id,
      label: hotspot.label,
      audioUrl: hotspot.audioUrl || '',
      position: { x: hotspot.x, y: hotspot.y },
      size: { width: hotspot.width, height: hotspot.height }
    };
  }
}
