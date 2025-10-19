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
