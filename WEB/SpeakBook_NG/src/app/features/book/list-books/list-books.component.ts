import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { BookResponse } from '../service/book-edit.service';
import { BookQueryService } from '../service/book-query.service';
import { PageRequest, PageResponse } from '@core/models';


@Component({
  selector: 'app-list-books',
  imports: [CommonModule],
  templateUrl: './list-books.component.html',
  styleUrl: './list-books.component.scss'
})
export class ListBooksComponent implements OnInit, OnChanges {
  @Input() currentPage: number = 1;
  @Input() pageSize: number = 10;
  @Input() searchKeyword: string = '';
  @Output() pageDataLoaded = new EventEmitter<PageResponse<BookResponse>>();

  books: BookResponse[] = [];
  isLoading = false;

  constructor(
    private router: Router,
    private bookQueryService: BookQueryService
  ) {}

  ngOnInit(): void {
    this.loadBooks();
  }

  ngOnChanges(changes: SimpleChanges): void {
    // 當分頁、搜尋參數或每頁筆數改變時重新載入
    if (changes['currentPage'] || changes['searchKeyword'] || changes['pageSize']) {
      this.loadBooks();
    }
  }

  loadBooks(): void {
    this.isLoading = true;

    const pageRequest: PageRequest = {
      page: this.currentPage,
      pageSize: this.pageSize,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      searchKeyword: this.searchKeyword
    };

    this.bookQueryService.getBooksWithPagination(pageRequest).subscribe({
      next: (response: PageResponse<BookResponse>) => {
        this.books = response.content;
        this.pageDataLoaded.emit(response);
        this.isLoading = false;
      },
      error: (error: Error) => {
        console.error('載入教材失敗:', error);
        alert('載入教材失敗: ' + error.message);
        this.isLoading = false;
      }
    });
  }

  onBookClick(book: BookResponse): void {
    console.log('點擊教材:', book);
    // 這裡可以導航到教材詳情頁面
  }

  // 查看詳情
  onViewDetails(event: Event, book: BookResponse): void {
    event.stopPropagation();
    console.log('查看詳情:', book);
    this.router.navigate(['/book', book.id]);
  }

  // 編輯教材
  onEdit(event: Event, book: BookResponse): void {
    event.stopPropagation();
    console.log('編輯教材:', book);
    this.router.navigate(['/book/edit', book.id]);
  }

  // 刪除教材
  onDelete(event: Event, book: BookResponse): void {
    event.stopPropagation();
    
    if (confirm(`確定要刪除教材「${book.title}」嗎？`)) {
      this.bookQueryService.deleteBook(book.id).subscribe({
        next: () => {
          alert('教材已成功刪除');
          // 重新載入列表
          this.loadBooks();
        },
        error: (error) => {
          console.error('刪除教材失敗:', error);
          alert('刪除教材失敗: ' + error.message);
        }
      });
    }
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'https://placehold.co/300x400/e0e0e0/757575?text=No+Image';
  }
}
