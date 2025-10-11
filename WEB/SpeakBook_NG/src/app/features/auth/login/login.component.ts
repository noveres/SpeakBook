import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '@core/services/auth/auth.service';
import { LanguageSelectorComponent } from '@shared/components/ui/language-selector/language-selector.component';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { LanguageService } from '@core/services/i18n/language.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, 
    HttpClientModule, 
    LanguageSelectorComponent,
    TranslateModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {
  @ViewChild('hiddenGoogleButton', { static: false }) hiddenGoogleButton!: ElementRef;
  
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  keepLoggedIn = true;
  showPassword = false;
  
  private subscriptions = new Subscription();

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private translate: TranslateService,
    private languageService: LanguageService
  ) { }



  ngOnInit(): void {
    // 設定初始語言
    this.translate.setDefaultLang(this.languageService.getCurrentLanguage());
    this.translate.use(this.languageService.getCurrentLanguage());
    
    // 監聽語言變更
    this.subscriptions.add(
      this.languageService.currentLanguage$.subscribe(language => {
        this.translate.use(language);
      })
    );
    
    // 初始化密碼登錄表單
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]]
    });

  }

  /*
  用戶登入時：
  如果勾選了「保持登入」，token 存儲在 localStorage 中。
  如果未勾選「保持登入」，token 存儲在 sessionStorage 中。
  用戶關閉頁面時：
  系統檢查 sessionStorage 中是否有 token。
  如果有，表示用戶未選擇保持登入，系統會自動登出（清除 token）。
  如果沒有，表示用戶選擇了保持登入，系統不會自動登出。
  */

  // 密碼登錄
  onPasswordLogin(): void {
    if (this.loginForm.invalid) {
      this.markFormGroupTouched(this.loginForm);
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          // 檢查是否勾選了保持登入，並根據狀態儲存到 localStorage 或 sessionStorage
          if (this.keepLoggedIn) {
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('userName', response.name);
            localStorage.setItem('userRole', response.role);
          } else {
             sessionStorage.setItem('token', response.token);
             sessionStorage.setItem('userId', response.userId);
             sessionStorage.setItem('userName', response.name);
             sessionStorage.setItem('userRole', response.role);
             console.log('Token:', response.token);
          }
          // 登錄成功，導航到儀表板並清除瀏覽歷史
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          // 登錄失敗，顯示錯誤消息
          this.errorMessage = response.message || this.translate.instant('LOGIN.LOGIN_FAILED_CHECK_CREDENTIALS');
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || this.translate.instant('LOGIN.LOGIN_FAILED_CHECK_CREDENTIALS');
      }
    });
  }




  // 切換密碼可見性
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  // 標記表單組的所有控件為已觸摸
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();

      if ((control as any).controls) {
        this.markFormGroupTouched(control as FormGroup);
      }
    });
  }

  // 處理保持登入狀態
  onKeepLoggedInChange(event: any): void {
    this.keepLoggedIn = event.target.checked;
    // 將 keepLoggedIn 狀態同步到 AuthService
    this.authService.setKeepLoggedIn(this.keepLoggedIn);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}


