import { Component, OnInit, OnDestroy } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterOutlet } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LanguageService } from './core/services/i18n/language.service';
import { SidebarNAVmenuDropDownComponent } from './core/layout/sidebar-navmenu-drop-down/sidebar-navmenu-drop-down.component';
import { Subscription } from 'rxjs';
import { AuthService } from './core/services/auth/auth.service';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, SidebarNAVmenuDropDownComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  private langSubscription!: Subscription;

  constructor(
    private titleService: Title,
    private translate: TranslateService,
    private languageService: LanguageService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    // 初始化翻譯服務語言並等待載入完成後設置標題
    this.translate.use(this.languageService.getCurrentLanguage()).subscribe(() => {
      this.updateTitle();
    });
    
    // 監聽語言變更
    this.langSubscription = this.languageService.currentLanguage$.subscribe(() => {
      this.translate.use(this.languageService.getCurrentLanguage()).subscribe(() => {
        this.updateTitle();
      });
    });


  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  private updateTitle(): void {
    this.titleService.setTitle(this.translate.instant('SIDEBAR.SYSTEM_NAME'));
  }

}
