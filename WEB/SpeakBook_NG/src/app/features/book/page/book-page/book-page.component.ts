import { Component } from '@angular/core';
import { ListBooksComponent } from '../../list-books/list-books.component';
import { SearchBoxComponent, PaginationComponent } from '@shared/components/ui';

@Component({
  selector: 'app-book-page',
  imports: [ListBooksComponent, SearchBoxComponent, PaginationComponent],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent {
  searchValue: string = '';
  
  // 分頁相關
  currentPage: number = 1;
  totalPages: number = 5;
  totalItems: number = 50;
  itemsPerPage: number = 10;

  onSearch(value: string): void {
    this.searchValue = value;
    console.log('搜尋:', value);
    // 這裡可以添加搜尋邏輯
    // 搜尋後重置到第一頁
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('切換到第', page, '頁');
    // 這裡可以添加載入新頁面數據的邏輯
  }
}
