import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface AudioCardData {
  id: string | number;
  label: string;
  audioUrl: string;
  position?: { x: number; y: number };
  size?: { width: number; height: number };
}

@Component({
  selector: 'app-audio-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audio-card.component.html',
  styleUrl: './audio-card.component.scss'
})
export class AudioCardComponent implements OnDestroy {
  @Input() data!: AudioCardData;
  @Input() index?: number;
  @Input() isActive: boolean = false;
  
  // 外部播放狀態控制
  @Input() externalIsPlaying: boolean = false;
  @Input() externalAudioCurrentTime: number = 0;
  @Input() externalAudioDuration: number = 0;
  @Input() useExternalPlayback: boolean = false; // 是否使用外部播放控制
  
  // 播放切換事件
  @Output() playToggle = new EventEmitter<void>();

  // 播放相關
  private currentAudio: HTMLAudioElement | null = null;
  isPlaying: boolean = false;
  audioCurrentTime: number = 0;
  audioDuration: number = 0;
  private isLoading: boolean = false; // 防止連點
  
  // 獲取當前播放狀態（優先使用外部狀態）
  get currentIsPlaying(): boolean {
    return this.useExternalPlayback ? this.externalIsPlaying : this.isPlaying;
  }
  
  get currentAudioTime(): number {
    return this.useExternalPlayback ? this.externalAudioCurrentTime : this.audioCurrentTime;
  }
  
  get currentDuration(): number {
    return this.useExternalPlayback ? this.externalAudioDuration : this.audioDuration;
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }

  togglePlay(): void {
    // 如果使用外部播放控制，發出事件讓父組件處理
    if (this.useExternalPlayback) {
      this.playToggle.emit();
      return;
    }
    
    // 防止連點
    if (this.isLoading) {
      return;
    }
    
    if (this.isPlaying) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  }

  playAudio(): void {
    if (!this.data.audioUrl) return;
    
    // 防止連點
    if (this.isLoading) return;
    
    this.isLoading = true;

    try {
      this.currentAudio = new Audio(this.data.audioUrl);
      this.isPlaying = true;

      // 監聽音訊載入完成
      this.currentAudio.addEventListener('loadedmetadata', () => {
        this.audioDuration = this.currentAudio?.duration || 0;
        this.isLoading = false; // 載入完成，解除鎖定
      });

      // 監聽播放進度
      this.currentAudio.addEventListener('timeupdate', () => {
        this.audioCurrentTime = this.currentAudio?.currentTime || 0;
      });

      // 監聽播放結束
      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
        this.isLoading = false; // 播放結束，解除鎖定
      });

      // 監聽錯誤
      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        this.isPlaying = false;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
        this.isLoading = false; // 錯誤時，解除鎖定
      });

      this.currentAudio.play().catch((error) => {
        console.error('播放失敗:', error);
        this.isPlaying = false;
        this.isLoading = false; // 播放失敗，解除鎖定
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
      this.isPlaying = false;
      this.isLoading = false; // 異常時，解除鎖定
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.isPlaying = false;
    this.audioCurrentTime = 0;
    this.audioDuration = 0;
    this.isLoading = false; // 停止時，解除鎖定
  }

  // 拖動進度條
  onProgressChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const newTime = parseFloat(input.value);
    if (this.currentAudio) {
      this.currentAudio.currentTime = newTime;
      this.audioCurrentTime = newTime;
    }
  }

  // 格式化時間 (秒 -> mm:ss)
  formatTime(seconds: number): string {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  getAudioName(url: string): string {
    if (!url) return '未知';
    const parts = url.split('/');
    return parts[parts.length - 1] || '未知';
  }
}
