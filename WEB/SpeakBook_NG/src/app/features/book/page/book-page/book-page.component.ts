import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ListBooksComponent } from '../../list-books/list-books.component';
import { SearchBoxComponent, PaginationComponent } from '@shared/components/ui';
import { BookResponse } from '../../service/book-edit.service';
import { PageResponse } from '@core/models';

@Component({
  selector: 'app-book-page',
  imports: [CommonModule, FormsModule, ListBooksComponent, SearchBoxComponent, PaginationComponent],
  templateUrl: './book-page.component.html',
  styleUrl: './book-page.component.scss'
})
export class BookPageComponent {
  searchKeyword: string = '';  // 實際用於搜尋的關鍵字
  
  // 分頁相關
  currentPage: number = 1;
  totalPages: number = 0;
  totalItems: number = 0;
  itemsPerPage: number = 10;
  
  // 每頁顯示筆數選項
  pageSizeOptions: number[] = [5, 10, 20, 50, 100];

  onSearch(value: string): void {
    // 只有在按下 Enter 或點擊搜尋按鈕時才執行搜尋
    this.searchKeyword = value.trim();
    console.log('執行搜尋:', this.searchKeyword);
    // 搜尋後重置到第一頁
    this.currentPage = 1;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    console.log('切換到第', page, '頁');
  }

  onPageSizeChange(newPageSize: number): void {
    this.itemsPerPage = newPageSize;
    // 切換每頁筆數後重置到第一頁
    this.currentPage = 1;
    console.log('每頁顯示筆數改為:', this.itemsPerPage);
  }

  onPageDataLoaded(pageData: PageResponse<BookResponse>): void {
    // 更新分頁資訊
    this.totalPages = pageData.totalPages;
    this.totalItems = pageData.totalElements;
    this.currentPage = pageData.currentPage;
    console.log('分頁資訊:', {
      currentPage: this.currentPage,
      totalPages: this.totalPages,
      totalItems: this.totalItems
    });
  }
}
