import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-search-box',
  imports: [CommonModule, FormsModule],
  templateUrl: './search-box.component.html',
  styleUrl: './search-box.component.scss'
})
export class SearchBoxComponent {
  @Input() placeholder: string = '搜尋...';
  @Input() searchValue: string = '';
  @Output() searchValueChange = new EventEmitter<string>();
  @Output() search = new EventEmitter<string>();

  onSearchChange(value: string): void {
    this.searchValue = value;
    this.searchValueChange.emit(value);
  }

  onSearchClick(): void {
    this.search.emit(this.searchValue);
  }

  clearSearch(): void {
    this.searchValue = '';
    this.searchValueChange.emit('');
    this.search.emit('');
  }
}
