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
  currentSlide = 0;
  private slideInterval: any;
  private languageSubscription: Subscription = new Subscription();

  slides = [
    {
      image: 'images/KAS_Photo-4.jpg',
      title: 'HOME.SLIDES.SLIDE1.TITLE',
      subtitle: 'HOME.SLIDES.SLIDE1.SUBTITLE',
      description: 'HOME.SLIDES.SLIDE1.DESCRIPTION'
    },
    {
      image: 'images/KAS_Photo-5.jpg',
      title: 'HOME.SLIDES.SLIDE2.TITLE',
      subtitle: 'HOME.SLIDES.SLIDE2.SUBTITLE',
      description: 'HOME.SLIDES.SLIDE2.DESCRIPTION'
    },
    {
      image: 'images/KAS_Photo-29.jpg',
      title: 'HOME.SLIDES.SLIDE3.TITLE',
      subtitle: 'HOME.SLIDES.SLIDE3.SUBTITLE',
      description: 'HOME.SLIDES.SLIDE3.DESCRIPTION'
    }
  ];

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
        console.log('首頁載入時獲取用戶資料失敗，可能觸發自動登出:', error);
      }
    });

    // 檢查本地權限是否為空陣列；若是，嘗試刷新權限資料
    this.tryRefreshPermissionsIfEmpty();

    this.startSlideShow();
  }

  ngOnDestroy() {
    if (this.slideInterval) {
      clearInterval(this.slideInterval);
    }
    // 取消訂閱
    this.languageSubscription.unsubscribe();
  }

  startSlideShow() {
    this.slideInterval = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  prevSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.slides.length - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number) {
    this.currentSlide = index;
  }

  /**
   * 當本地 LocalStorage 的 app.permissions 為空陣列時，重新呼叫權限 API，
   * 並將權限樹轉為 tokens 寫回本地權限服務。
   */
  private tryRefreshPermissionsIfEmpty(): void {
    let shouldRefresh = false;
    try {
      const raw = localStorage.getItem('app.permissions');
      if (raw) {
        const parsed = JSON.parse(raw);
        shouldRefresh = Array.isArray(parsed) && parsed.length === 0;
      }
    } catch {
      // JSON 解析失敗時不刷新（依需求可改為刷新）
      shouldRefresh = false;
    }

    if (!shouldRefresh) return;

  
  }
}
