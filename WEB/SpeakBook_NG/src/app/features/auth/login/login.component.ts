import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from '@core/services/auth/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  errorMessage = '';
  keepLoggedIn = true;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
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
          // 登錄成功，AuthService 已自動保存用戶信息到 localStorage
          // 導航到首頁並清除瀏覽歷史
          this.router.navigate(['/home'], { replaceUrl: true });
        } else {
          // 登錄失敗，顯示錯誤消息
          this.errorMessage = response.message || '登錄失敗，請檢查用戶名和密碼';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || '登錄失敗，請檢查用戶名和密碼';
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
}


