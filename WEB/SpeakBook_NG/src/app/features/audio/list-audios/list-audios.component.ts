import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AudioService, AudioResponse } from '../service/audio.service';
import { PageRequest, PageResponse } from '@core/models';
import { PaginationComponent } from '@shared/components/ui';

@Component({
  selector: 'app-list-audios',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginationComponent],
  templateUrl: './list-audios.component.html',
  styleUrl: './list-audios.component.scss'
})
export class ListAudiosComponent implements OnInit {
  audios: AudioResponse[] = [];
  isLoading = false;
  searchKeyword = '';
  
  // 分頁相關
  currentPage = 1;  // 改為從 1 開始
  pageSize = 10;
  totalElements = 0;
  totalPages = 0;
  
  // 每頁顯示筆數選項
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  // 上傳相關
  isUploading = false;
  uploadProgress = 0;
  selectedFile: File | null = null;

  // 播放相關
  currentAudio: HTMLAudioElement | null = null;
  playingAudioId: number | null = null;

  constructor(
    private audioService: AudioService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadAudios();
  }

  ngOnDestroy(): void {
    this.stopAudio();
  }

  loadAudios(): void {
    this.isLoading = true;
    const pageRequest: PageRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: 'createdAt,desc'
    };

    this.audioService.getAudios(pageRequest, this.searchKeyword).subscribe({
      next: (response: PageResponse<AudioResponse>) => {
        this.audios = response.content;
        this.totalElements = response.totalElements;
        this.totalPages = response.totalPages;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('載入音訊列表失敗:', error);
        alert('載入音訊列表失敗: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  onSearch(): void {
    this.currentPage = 1;
    this.loadAudios();
  }

  onClearSearch(): void {
    this.searchKeyword = '';
    this.currentPage = 1;
    this.loadAudios();
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadAudios();
  }

  onPageSizeChange(newPageSize: number): void {
    this.pageSize = newPageSize;
    // 切換每頁筆數後重置到第一頁
    this.currentPage = 1;
    this.loadAudios();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // 驗證檔案類型
      if (!file.type.startsWith('audio/')) {
        alert('請選擇音訊檔案');
        return;
      }

      // 驗證檔案大小（限制 10MB）
      const maxSize = 10 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('檔案大小不能超過 10MB');
        return;
      }

      this.selectedFile = file;
      this.uploadAudio();
    }
  }

  uploadAudio(): void {
    if (!this.selectedFile) return;

    this.isUploading = true;
    this.uploadProgress = 0;

    // 使用 uploadAndSaveAudio 方法:後端會上傳到 Catbox 並保存到數據庫
    this.audioService.uploadAndSaveAudio(this.selectedFile).subscribe({
      next: (response) => {
        console.log('上傳成功:', response);
        alert('音訊上傳成功');
        this.isUploading = false;
        this.selectedFile = null;
        this.loadAudios(); // 重新載入列表
      },
      error: (error) => {
        console.error('上傳失敗:', error);
        alert('上傳失敗: ' + error.message);
        this.isUploading = false;
        this.selectedFile = null;
      }
    });
  }

  onDelete(audio: AudioResponse): void {
    if (confirm(`確定要刪除音訊「${audio.name}」嗎？`)) {
      this.audioService.deleteAudio(audio.id).subscribe({
        next: () => {
          alert('音訊已成功刪除');
          this.loadAudios();
        },
        error: (error) => {
          console.error('刪除音訊失敗:', error);
          alert('刪除音訊失敗: ' + error.message);
        }
      });
    }
  }

  playAudio(audio: AudioResponse): void {
    // 如果正在播放同一個音訊，則停止播放
    if (this.playingAudioId === audio.id) {
      this.stopAudio();
      return;
    }

    // 停止當前播放的音訊
    this.stopAudio();

    try {
      this.currentAudio = new Audio(audio.url);
      this.playingAudioId = audio.id;

      this.currentAudio.addEventListener('ended', () => {
        this.playingAudioId = null;
      });

      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        alert('音訊播放失敗');
        this.playingAudioId = null;
      });

      this.currentAudio.play().then(() => {
        console.log('開始播放音訊:', audio.name);
      }).catch((error) => {
        console.error('播放失敗:', error);
        alert('無法播放音訊');
        this.playingAudioId = null;
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
      alert('音訊初始化失敗');
      this.playingAudioId = null;
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.playingAudioId = null;
  }

  isPlaying(audioId: number): boolean {
    return this.playingAudioId === audioId;
  }

  copyToClipboard(text: string): void {
    navigator.clipboard.writeText(text).then(() => {
      alert('已複製到剪貼簿');
    }).catch(err => {
      console.error('複製失敗:', err);
      alert('複製失敗');
    });
  }

  formatFileSize(bytes: number): string {
    return this.audioService.formatFileSize(bytes);
  }

  formatDuration(seconds: number): string {
    return this.audioService.formatDuration(seconds);
  }

  get hasAudios(): boolean {
    return this.audios && this.audios.length > 0;
  }
}
