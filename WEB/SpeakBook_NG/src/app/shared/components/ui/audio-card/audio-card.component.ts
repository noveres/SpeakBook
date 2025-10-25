import { Component, Input, OnDestroy } from '@angular/core';
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

  // 播放相關
  private currentAudio: HTMLAudioElement | null = null;
  isPlaying: boolean = false;
  audioCurrentTime: number = 0;
  audioDuration: number = 0;

  ngOnDestroy(): void {
    this.stopAudio();
  }

  togglePlay(): void {
    if (this.isPlaying) {
      this.stopAudio();
    } else {
      this.playAudio();
    }
  }

  playAudio(): void {
    if (!this.data.audioUrl) return;

    try {
      this.currentAudio = new Audio(this.data.audioUrl);
      this.isPlaying = true;

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
        this.isPlaying = false;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });

      // 監聽錯誤
      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        this.isPlaying = false;
        this.audioCurrentTime = 0;
        this.audioDuration = 0;
      });

      this.currentAudio.play().catch((error) => {
        console.error('播放失敗:', error);
        this.isPlaying = false;
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
      this.isPlaying = false;
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
