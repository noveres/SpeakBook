import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isLoggedIn()) {
      return true;
    }

    // 如果用戶未登錄，則重定向到登錄頁面
    return this.router.createUrlTree(['/login']);
  }
}
/*這個路由守衛的邏輯是：
呼叫 authService.isLoggedIn() 方法來檢查使用者是否已經登入。
如果 authService.isLoggedIn() 返回 true，表示使用者已登入，路由守衛會允許使用者繼續訪問目標路由（返回 true）。
如果 authService.isLoggedIn() 返回 false，表示使用者未登入，路由守衛會阻止使用者訪問目標路由，並重定向到 /login 頁面（返回 this.router.createUrlTree(['/login'])）。
 */