import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BookQueryService } from '../service/book-query.service';
import { BookResponse, HotspotResponse } from '../service/book-edit.service';

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
export class BookDetailComponent implements OnInit {
  book: Book | null = null;
  isLoading = true;
  hotspots: Hotspot[] = [];
  selectedHotspot: Hotspot | null = null;
  imageLoaded = false;
  
  // 圖片尺寸相關
  originalImageWidth: number = 0;   // 原始圖片寬度
  originalImageHeight: number = 0;  // 原始圖片高度
  displayImageWidth: number = 0;    // 顯示圖片寬度
  displayImageHeight: number = 0;   // 顯示圖片高度
  scaleX: number = 1;               // X軸縮放比例
  scaleY: number = 1;               // Y軸縮放比例

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
    const img = event.target as HTMLImageElement;
    
    // 從圖片本身獲取原始尺寸 (naturalWidth/naturalHeight 是圖片的實際像素尺寸)
    this.originalImageWidth = img.naturalWidth;
    this.originalImageHeight = img.naturalHeight;
    
    // 獲取圖片實際顯示尺寸
    this.displayImageWidth = img.clientWidth;
    this.displayImageHeight = img.clientHeight;
    
    // 計算縮放比例
    this.scaleX = this.displayImageWidth / this.originalImageWidth;
    this.scaleY = this.displayImageHeight / this.originalImageHeight;
    
    this.imageLoaded = true;
    
    console.log('圖片載入完成:', {
      原始尺寸: `${this.originalImageWidth}x${this.originalImageHeight}`,
      顯示尺寸: `${this.displayImageWidth}x${this.displayImageHeight}`,
      縮放比例: `X:${this.scaleX.toFixed(2)}, Y:${this.scaleY.toFixed(2)}`
    });
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x400/e0e0e0/757575?text=No+Image';
  }

  // 計算縮放後的熱區位置
  getScaledHotspotStyle(hotspot: Hotspot): any {
    return {
      left: `${hotspot.x * this.scaleX}px`,
      top: `${hotspot.y * this.scaleY}px`,
      width: `${hotspot.width * this.scaleX}px`,
      height: `${hotspot.height * this.scaleY}px`
    };
  }

  selectHotspot(hotspot: Hotspot): void {
    this.selectedHotspot = hotspot;
    console.log('選中熱區:', hotspot);
  }

  playAudio(hotspot: Hotspot): void {
    if (hotspot.audioUrl) {
      console.log('播放音訊:', hotspot.audioUrl);
      // 實際應該創建 Audio 對象並播放
      // const audio = new Audio(hotspot.audioUrl);
      // audio.play();
      alert(`播放音訊: ${hotspot.label}\n音訊檔案: ${hotspot.audioUrl}`);
    } else {
      alert('此熱區沒有設置音訊');
    }
  }
}
