import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BehaviorSubject } from 'rxjs';
import { tap, finalize } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:9527/api/auth'; // 後端 API 地址
  private keepLoggedInSubject = new BehaviorSubject<boolean>(false);
  keepLoggedIn$ = this.keepLoggedInSubject.asObservable();

  setKeepLoggedIn(value: boolean): void {
    this.keepLoggedInSubject.next(value);
  }
  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  login(loginData: { username: string, password: string }): Observable<any> {
    // 將前端的 username 映射到後端的 identityNumber
    const loginRequest = {
      identityNumber: loginData.username,
      password: loginData.password
    };

    return this.http.post<any>(`${this.apiUrl}/login`, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.success) {
            // 登錄成功，存儲令牌和用戶信息
            localStorage.setItem('token', response.token);
            localStorage.setItem('userId', response.userId);
            localStorage.setItem('userName', response.name);
            localStorage.setItem('userRole', response.role);
          }
        })
      );
  }

  logout(): void {
    // 清除本地存儲的令牌和用戶信息
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');

    // 使用 navigate 方法導航到登入頁面並清除瀏覽歷史
    this.router.navigate(['/login'], { replaceUrl: true });
  }

  isLoggedIn(): boolean {
    // 檢查用戶是否已登錄
    return !!localStorage.getItem('token');
  }

  getToken(): string | null {
    // 獲取令牌
    return localStorage.getItem('token');
  }

  getUserRole(): string | null {
    // 獲取用戶角色
    return localStorage.getItem('userRole');
  }

  /**
   * 獲取當前登錄用戶的信息
   * @returns 用戶信息對象
   */
  getCurrentUser(): any {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userRole = localStorage.getItem('userRole');

    if (userId) {
      return {
        id: userId,
        name: userName,
        role: userRole
      };
    }

    return null;
  }

  /**
   * 保存用戶信息到本地存儲
   * @param user 用戶信息對象
   */
  saveUserToLocalStorage(user: any): void {
    if (user) {
      if (user.id) localStorage.setItem('userId', user.id.toString());
      if (user.name) localStorage.setItem('userName', user.name);
      if (user.role) localStorage.setItem('userRole', user.role);
    }
  }
}