import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.component.html',
  styleUrls: ['./search-box.component.scss']
})
export class SearchBoxComponent {
  @Input() placeholder: string = '搜尋...';
  @Input() searchValue: string = '';
  @Input() autoSearchOnClear: boolean = true;  // 清空時是否自動搜尋
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  private hasSearched: boolean = false;  // 追蹤是否已執行過搜尋

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchValueChange.emit(value);
    
    // 如果已經搜尋過,且現在清空了文字,自動觸發搜尋
    if (this.autoSearchOnClear && this.hasSearched && value.trim() === '') {
      this.search.emit('');
    }
  }

  onSearchClick(): void {
    this.hasSearched = true;  // 標記已執行搜尋
    this.search.emit(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchValueChange.emit('');
    
    // 點擊清除按鈕時,如果已經搜尋過且啟用自動搜尋,則發送空字串搜尋
    if (this.autoSearchOnClear && this.hasSearched) {
      this.search.emit('');
    }
  }
}
