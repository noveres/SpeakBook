import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router } from '@angular/router';

import { AuthService} from '../../core/services/auth/auth.service';
import { LanguageSelectorComponent } from "../../shared/components/ui/language-selector/language-selector.component";

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule,
    LanguageSelectorComponent
],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    public translate: TranslateService,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  ngOnInit(): void {
  }

  login(): void {
    if (!this.loginForm.valid || this.loading) {
      return;
    }

    this.loading = true;
    const formValue = this.loginForm.value;

    // 使用 AuthService 期望的格式
    const loginData = {
      username: formValue.username,
      password: formValue.password
    };

    this.authService.login(loginData).subscribe({
      next: response => {
        this.loading = false;
        if (response && response.success) {
          this.router.navigate(['/home']);
        } else {
          this.showError(this.translate.instant('LOGIN.LOGIN_FAILED_CREDENTIALS'));
        }
      },
      error: error => {
        this.loading = false;
        console.error('Login error:', error);
        this.showError(this.translate.instant('LOGIN.LOGIN_FAILED_UNEXPECTED'));
      }
    });
  }

  cancel(): void {
    if (this.loading) {
      return;
    }

    this.loginForm.reset({
      username: '',
      password: '',
      language: this.translate.currentLang,
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  private showError(message: string): void {
    this.snackBar.open(message, this.translate.instant('COMMON.CLOSE'), {
      duration: 3000
    });
  }
}


