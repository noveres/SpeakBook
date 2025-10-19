import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadedImage } from '../upload-image/upload-image.component';
import { VirtualSelectComponent, SelectOption } from '@shared/components/ui';
import { AUDIO_DATA } from '@core/constants/audio-data';

export interface Hotspot {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  audioId?: string;
  audioUrl?: string;
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

  // 圖片尺寸
  originalImageWidth = 0;   // 原始圖片寬度
  originalImageHeight = 0;  // 原始圖片高度
  displayImageWidth = 0;    // 顯示圖片寬度
  displayImageHeight = 0;   // 顯示圖片高度
  scaleX = 1;               // X軸縮放比例
  scaleY = 1;               // Y軸縮放比例

  // 音訊選項
  audioOptions: SelectOption[] = [];
  selectedAudioId: string | null = null;

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
    // 使用共享的音訊數據
    // 實際項目中應該調用 audioService.getAudioList()
    this.audioOptions = AUDIO_DATA.map(audio => ({
      id: audio.id,
      name: audio.name,
      url: audio.url,
      duration: audio.duration,
      category: audio.category
    }));
  }

  onImageLoad(event: Event): void {
    const img = event.target as HTMLImageElement;
    
    // 獲取原始圖片尺寸
    this.originalImageWidth = img.naturalWidth;
    this.originalImageHeight = img.naturalHeight;
    
    // 獲取顯示尺寸
    this.displayImageWidth = img.clientWidth;
    this.displayImageHeight = img.clientHeight;
    
    // 計算縮放比例
    this.scaleX = this.displayImageWidth / this.originalImageWidth;
    this.scaleY = this.displayImageHeight / this.originalImageHeight;
    
    console.log('圖片載入:', {
      原始尺寸: `${this.originalImageWidth}x${this.originalImageHeight}`,
      顯示尺寸: `${this.displayImageWidth}x${this.displayImageHeight}`,
      縮放比例: `${this.scaleX.toFixed(2)}x${this.scaleY.toFixed(2)}`
    });
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
        
        // 將顯示座標轉換為原始圖片座標（用於儲存）
        const originalHotspot: Hotspot = {
          ...this.currentHotspot,
          x: this.currentHotspot.x / this.scaleX,
          y: this.currentHotspot.y / this.scaleY,
          width: this.currentHotspot.width / this.scaleX,
          height: this.currentHotspot.height / this.scaleY
        };

        this.hotspots.push(originalHotspot);
        this.selectedHotspot = originalHotspot;
        
        console.log('保存熱區:', {
          顯示座標: `x:${this.currentHotspot.x.toFixed(0)}, y:${this.currentHotspot.y.toFixed(0)}`,
          原始座標: `x:${originalHotspot.x.toFixed(0)}, y:${originalHotspot.y.toFixed(0)}`
        });
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

  // 獲取縮放後的熱區樣式（用於顯示）
  getScaledHotspotStyle(hotspot: Hotspot): any {
    return {
      left: `${hotspot.x * this.scaleX}px`,
      top: `${hotspot.y * this.scaleY}px`,
      width: `${hotspot.width * this.scaleX}px`,
      height: `${hotspot.height * this.scaleY}px`
    };
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
