import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface BookSettings {
  title: string;
  author: string;
  description: string;
  category: string;
  pages: number;
  targetAge: string;
  difficulty: string;
  tags: string[];
}

@Component({
  selector: 'app-book-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './book-settings.component.html',
  styleUrl: './book-settings.component.scss'
})
export class BookSettingsComponent {
  @Input() settings: BookSettings = {
    title: '',
    author: '',
    description: '',
    category: '童話故事',
    pages: 0,
    targetAge: '3-6歲',
    difficulty: '簡單',
    tags: []
  };

  @Output() settingsChange = new EventEmitter<BookSettings>();

  categories = ['童話故事', '寓言故事', '科普知識', '生活教育', '品格教育', '其他'];
  ageGroups = ['0-3歲', '3-6歲', '6-9歲', '9-12歲', '12歲以上'];
  difficultyLevels = ['簡單', '中等', '困難'];

  newTag = '';

  onSettingsChange(): void {
    this.settingsChange.emit(this.settings);
  }

  addTag(): void {
    if (this.newTag.trim() && !this.settings.tags.includes(this.newTag.trim())) {
      this.settings.tags.push(this.newTag.trim());
      this.newTag = '';
      this.onSettingsChange();
    }
  }

  removeTag(tag: string): void {
    const index = this.settings.tags.indexOf(tag);
    if (index > -1) {
      this.settings.tags.splice(index, 1);
      this.onSettingsChange();
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addTag();
    }
  }
}
