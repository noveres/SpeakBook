import { Component, EventEmitter, Input, Output, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LanguageService, SupportedLanguage } from '@core/services/i18n/language.service';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.scss']
})
export class LanguageSelectorComponent implements OnInit {
  // 顯示名稱映射
  languageDisplayMap: Record<SupportedLanguage, string> = {
    'zh-TW': '中文',
    'en-US': 'English',
    'ja-JP': '日本語'
  };

  // 反向映射，用於從顯示名稱獲取語言代碼
  displayToLanguageMap: Record<string, SupportedLanguage> = {
    '中文': 'zh-TW',
    'English': 'en-US',
    '日本語': 'ja-JP'
  };

  // 當前顯示的語言名稱
  currentLanguageDisplay: string = '中文';

  isDropdownOpen: boolean = false;
  availableLanguages: string[] = ['中文', 'English'];

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    // 從語言服務獲取當前語言
    const currentLang = this.languageService.getCurrentLanguage();
    this.currentLanguageDisplay = this.languageDisplayMap[currentLang];

    // 訂閱語言變更
    this.languageService.currentLanguage$.subscribe(lang => {
      this.currentLanguageDisplay = this.languageDisplayMap[lang];
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // 點擊組件外部時關閉下拉選單
    const clickedInside = (event.target as HTMLElement).closest('.language-selector');
    if (!clickedInside && this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }

  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  selectLanguage(languageDisplay: string): void {
    if (this.currentLanguageDisplay !== languageDisplay) {
      this.currentLanguageDisplay = languageDisplay;
      // 將選擇的語言代碼傳送給語言服務
      const languageCode = this.displayToLanguageMap[languageDisplay];
      this.languageService.setLanguage(languageCode);
    }
    this.isDropdownOpen = false;
  }
}
