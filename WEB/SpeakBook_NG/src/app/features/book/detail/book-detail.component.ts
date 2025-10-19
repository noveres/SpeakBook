import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookQueryService } from '../service/book-query.service';
import { BookResponse, HotspotResponse } from '../service/book-edit.service';
import { getAudioNameByUrl } from '@core/constants/audio-data';

// 使用後端返回的類型
type Hotspot = HotspotResponse;
type Book = BookResponse;

@Component({
  selector: 'app-book-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './book-detail.component.html',
  styleUrl: './book-detail.component.scss'
})
export class BookDetailComponent implements OnInit, OnDestroy {
  book: Book | null = null;
  isLoading = true;
  hotspots: Hotspot[] = [];
  selectedHotspot: Hotspot | null = null;
  imageLoaded = false;
  
  // 音訊播放相關
  private currentAudio: HTMLAudioElement | null = null;
  playingHotspotId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookQueryService: BookQueryService
  ) {}

  ngOnInit(): void {
    // 從路由參數獲取教材 ID
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBook(+id);
    }
  }

  ngOnDestroy(): void {
    // 組件銷毀時停止音訊播放
    this.stopAudio();
  }

  loadBook(id: number): void {
    this.isLoading = true;
    
    // 調用 API 獲取教材詳情
    this.bookQueryService.getBookById(id).subscribe({
      next: (book) => {
        this.book = book;
        this.hotspots = book.hotspots || [];
        this.isLoading = false;
        console.log('教材詳情載入成功:', book);
      },
      error: (error) => {
        console.error('載入教材詳情失敗:', error);
        alert('載入教材詳情失敗: ' + error.message);
        this.isLoading = false;
        // 載入失敗後返回列表頁
        this.router.navigate(['/book']);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/book']);
  }

  onEdit(): void {
    if (this.book) {
      this.router.navigate(['/book/edit', this.book.id]);
    }
  }

  onDelete(): void {
    if (this.book && confirm(`確定要刪除教材「${this.book.title}」嗎？`)) {
      this.bookQueryService.deleteBook(this.book.id).subscribe({
        next: () => {
          alert('教材已成功刪除');
          this.router.navigate(['/book']);
        },
        error: (error) => {
          console.error('刪除教材失敗:', error);
          alert('刪除教材失敗: ' + error.message);
        }
      });
    }
  }

  onImageLoad(event: Event): void {
    this.imageLoaded = true;
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x400/e0e0e0/757575?text=No+Image';
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    console.log('選中熱區:', hotspot);
  }

  playAudio(hotspot: Hotspot): void {
    if (!hotspot.audioUrl) {
      console.warn('此熱區沒有設置音訊');
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
      // 創建新的音訊對象
      this.currentAudio = new Audio(hotspot.audioUrl);
      this.playingHotspotId = hotspot.id;

      // 監聽播放結束事件
      this.currentAudio.addEventListener('ended', () => {
        this.playingHotspotId = null;
        console.log('音訊播放完成');
      });

      // 監聽錯誤事件
      this.currentAudio.addEventListener('error', (error) => {
        console.error('音訊播放錯誤:', error);
        alert('音訊播放失敗，請檢查音訊檔案是否存在');
        this.playingHotspotId = null;
      });

      // 播放音訊
      this.currentAudio.play().then(() => {
        console.log('開始播放音訊:', hotspot.label);
      }).catch((error) => {
        console.error('播放失敗:', error);
        alert('無法播放音訊，請稍後再試');
        this.playingHotspotId = null;
      });
    } catch (error) {
      console.error('創建音訊對象失敗:', error);
      alert('音訊初始化失敗');
      this.playingHotspotId = null;
    }
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
    this.playingHotspotId = null;
  }

  isPlaying(hotspotId: number): boolean {
    return this.playingHotspotId === hotspotId;
  }

  getAudioName(audioUrl: string): string {
    // 使用共享的函數獲取音訊名稱
    return getAudioNameByUrl(audioUrl);
  }
}
