import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UploadedImage } from '../upload-image/upload-image.component';
import { Hotspot } from '../image-editor/image-editor.component';
import { BookSettings } from '../book-settings/book-settings.component';
import { getAudioNameByUrl } from '@core/constants/audio-data';
import { AudioCardComponent, AudioCardData } from '@shared/components/ui';

@Component({
  selector: 'app-book-preview',
  imports: [CommonModule, AudioCardComponent],
  templateUrl: './book-preview.component.html',
  styleUrl: './book-preview.component.scss'
})
export class BookPreviewComponent implements OnDestroy {
  @Input() uploadedImage: UploadedImage | null = null;
  @Input() hotspots: Hotspot[] = [];
  @Input() settings: BookSettings | null = null;

  @Output() publish = new EventEmitter<void>();
  @Output() saveDraft = new EventEmitter<void>();

  isPublishing = false;
  isSavingDraft = false;

  // 音訊播放相關
  private currentAudio: HTMLAudioElement | null = null;
  playingHotspotId: string | null = null;
  selectedHotspot: Hotspot | null = null;
  audioCurrentTime: number = 0;
  audioDuration: number = 0;

  get isValid(): boolean {
    return !!(
      this.uploadedImage &&
      this.settings?.title &&
      this.settings?.author &&
      this.hotspots.length > 0
    );
  }

  get validationMessages(): string[] {
    const messages: string[] = [];
    
    if (!this.uploadedImage) {
      messages.push('尚未上傳圖片');
    }
    
    if (!this.settings?.title) {
      messages.push('尚未填寫教材標題');
    }
    
    if (!this.settings?.author) {
      messages.push('尚未填寫作者');
    }
    
    if (this.hotspots.length === 0) {
      messages.push('尚未創建任何熱區');
    }
    
    return messages;
  }

  onPublish(): void {
    if (!this.isValid) {
      alert('請完成所有必填項目後再發布');
      return;
    }

    if (confirm('確定要發布此教材嗎？發布後將可供所有使用者查看。')) {
      this.isPublishing = true;
      this.publish.emit();
    }
  }

  onSaveDraft(): void {
    if (confirm('確定要儲存為草稿嗎？')) {
      this.isSavingDraft = true;
      this.saveDraft.emit();
    }
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('zh-TW');
  }

  getAudioName(audioUrl: string): string {
    // 使用共享的函數獲取音訊名稱
    return getAudioNameByUrl(audioUrl);
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

  ngOnDestroy(): void {
    this.stopAudio();
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
  }

  // 播放音訊
  playAudio(hotspot: Hotspot): void {
    if (!hotspot.audioUrl) {
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
      });

      // 監聽錯誤
      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        this.playingHotspotId = null;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });

      this.currentAudio.play().then(() => {
        console.log('開始播放音訊:', hotspot.label);
      }).catch((error) => {
        console.error('播放失敗:', error);
        this.playingHotspotId = null;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
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
}
