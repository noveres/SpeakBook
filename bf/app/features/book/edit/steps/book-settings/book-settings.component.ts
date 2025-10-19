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
    difficulty: '簡單'
  };

  @Output() settingsChange = new EventEmitter<BookSettings>();

  categories = ['童話故事', '寓言故事', '科普知識', '生活教育', '品格教育', '其他'];
  ageGroups = ['0-3歲', '3-6歲', '6-9歲', '9-12歲', '12歲以上'];
  difficultyLevels = ['簡單', '中等', '困難'];

  onSettingsChange(): void {
    this.settingsChange.emit(this.settings);
  }
}
