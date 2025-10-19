import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type SupportedLanguage = 'zh-TW' | 'en-US' | 'ja-JP';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  // 默認語言為繁體中文
  private currentLanguageSubject = new BehaviorSubject<SupportedLanguage>('zh-TW');

  // 可觀察的當前語言
  public currentLanguage$: Observable<SupportedLanguage> = this.currentLanguageSubject.asObservable();

  constructor() {
    // 從本地存儲中讀取保存的語言設置
    const savedLanguage = localStorage.getItem('appLanguage') as SupportedLanguage;
    if (savedLanguage) {
      this.currentLanguageSubject.next(savedLanguage);
    }
  }

  // 獲取當前語言
  getCurrentLanguage(): SupportedLanguage {
    return this.currentLanguageSubject.value;
  }

  // 設置語言，想要切換語言時，只需要調用語言服務的 setLanguage 方法即可
  setLanguage(language: SupportedLanguage): void {
    // 保存到本地存儲
    localStorage.setItem('appLanguage', language);
    this.currentLanguageSubject.next(language);
  }
}
