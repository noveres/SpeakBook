import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService, SupportedLanguage } from '@core/services/i18n/language.service';
import { AuthService } from '@core/services/auth/auth.service';
import { Subscription } from 'rxjs';
// 新增：權限 API 與本地權限服務、權限樹轉 tokens 工具


@Component({
  selector: 'app-home',
  imports: [CommonModule, TranslateModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {

  /*
  currentSlide = 0;
  private slideInterval: any;
  */
  private languageSubscription: Subscription = new Subscription();

  constructor(
    private translate: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,

  ) {}

  ngOnInit() {
    // 設定預設語言和當前語言
    this.translate.setDefaultLang('zh-TW');
    const currentLang = this.languageService.getCurrentLanguage();
    this.translate.use(currentLang);

    // 訂閱語言變更
    this.languageSubscription = this.languageService.currentLanguage$.subscribe((language: SupportedLanguage) => {
      this.translate.use(language);
    });

    // 調用 Account Profile API 以觸發自動登出檢查
    this.authService.fetchUserProfile().subscribe({
      next: (response) => {
        console.log('首頁載入時獲取用戶資料成功:', response);
      },
      error: (error) => {
        // console.log('首頁載入時獲取用戶資料失敗，可能觸發自動登出:', error);
      }
    });
  }

  ngOnDestroy() {
 
    // 取消訂閱
    this.languageSubscription.unsubscribe();
  }
}
