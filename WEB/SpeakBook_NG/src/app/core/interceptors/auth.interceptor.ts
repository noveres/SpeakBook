import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, filter, take } from 'rxjs/operators';
import { AuthService } from '../services/auth/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { environment } from '@environments/environment';


import { HttpErrorHandlerService } from '../services/http/http-error-handler.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private hasShownAuthFailure = false; // 防止重複顯示認證失敗提示

  // 網路錯誤處理例外清單
  private networkErrorExceptionList: {
    urlPatterns: string[];
    statusCodes: number[];
    skipUrls: string[];
  } = {
    // 不顯示錯誤訊息的 URL 模式
    urlPatterns: [
      // 範例：'/api/health-check',
      // 範例：'/api/optional-service'

    ],
    // 不顯示錯誤訊息的狀態碼
    statusCodes: [
      // 範例：503 // Service Unavailable
    ],
    // 完全跳過錯誤處理的 URL 模式（連 console.error 都不執行）
    skipUrls: [
      // 範例：'/api/background-sync'
      '/api/Management/AssetManagement/Delete',
      '/api/Account/GetPermissionsByTree',

    ]
  };

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar,
    private httpErrorHandler: HttpErrorHandlerService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // 檢查是否為登入、註冊或刷新token的請求，這些請求不需要添加token
    if (this.isAuthRequest(request.url)) {
      return next.handle(request);
    }

    // 為其他請求添加認證token
    const authRequest = this.addTokenToRequest(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // 處理401未授權錯誤
        if (error.status === 401) {
          return this.handle401Error(authRequest, next);
        }

        // 處理403禁止訪問錯誤
        if (error.status === 403) {
          return this.handle403Error(error, authRequest, next);
        }

        // 處理網路錯誤或其他伺服器錯誤
        if (error.status === 0 || error.status >= 500) {
          // 檢查是否在完全跳過清單中，如果是就不調用 handleNetworkError
          const requestUrl = error.url || '';
          if (!this.isInSkipList(requestUrl)) {
            this.handleNetworkError(error);
          }
        }

        return throwError(error);
      })
    );
  }

  /**
   * 檢查是否為認證相關的請求
   */
  private isAuthRequest(url: string): boolean {
    const authUrls = [
      environment.api.Account.Login.url,
      environment.api.Account.RefreshToken.url,
      environment.api.Account.ExchangeAuthCode.url
    ];

    return authUrls.some(authUrl => url.includes(authUrl));
  }

  /**
   * 為請求添加認證token
   */
  private addTokenToRequest(request: HttpRequest<any>): HttpRequest<any> {
    const token = this.authService.getToken();

    if (token) {
      // 檢查是否為 FormData 請求，如果是則不設置 Content-Type
      const isFormData = request.body instanceof FormData;
      
      if (isFormData) {
        // 對於 FormData 請求，只添加 Authorization header，讓瀏覽器自動設置 Content-Type
        return request.clone({
          setHeaders: {
            'Authorization': `Bearer ${token}`
          }
        });
      } 
    }

    return request;
  }

  /**
   * 處理401未授權錯誤
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      const refreshToken = localStorage.getItem('refreshToken');

      if (refreshToken) {
        console.log('收到401錯誤，嘗試刷新token...');

        return this.authService.refreshToken(refreshToken).pipe(
          switchMap((response: any) => {
            this.isRefreshing = false;

            if (response && response.success && response.resultObject) {
              // 刷新成功，獲取新的token
              const newToken = response.resultObject.access_token;
              this.refreshTokenSubject.next(newToken);

              console.log('Token刷新成功，重試原請求');
              console.log('新Token:', newToken?.substring(0, 20) + '...');

              // 使用新token重試原請求
              const retryRequest = this.addTokenToRequest(request);
              return next.handle(retryRequest);
            } else {
              // 刷新失敗，登出用戶
              console.error('Token刷新失敗 - 響應格式不正確:', response);
              this.handleAuthFailure();
              return throwError(new Error('Token刷新失敗: ' + (response?.resultMessage || '響應格式不正確')));
            }
          }),
          catchError((error) => {
            this.isRefreshing = false;
            console.error('Token刷新過程中發生錯誤:', error);

            // 檢查是否為 400 錯誤，400 錯誤不應觸發自動登出
            if (error.status === 400) {
              console.log('檢測到 400 錯誤，不執行自動登出');
              // 顯示錯誤訊息但不登出用戶
              this.handleNetworkError(error);
              return throwError(error);
            }

            // 檢查是否為 refresh token 相關的認證錯誤
            if (this.isRefreshTokenAuthError(error)) {
              console.log('檢測到 refresh token 認證錯誤，執行自動登出');
              this.handleAuthFailure();
              return throwError(error);
            }

            // 檢查是否為網路錯誤或伺服器錯誤，而非認證錯誤
            if (this.isNetworkOrServerError(error)) {
              console.log('檢測到網路或伺服器錯誤，不執行自動登出');
              // 顯示網路錯誤訊息而不是登出
              this.handleNetworkError(error);
              return throwError(error);
            } else {
              // 真正的認證錯誤才執行登出
              this.handleAuthFailure();
              return throwError(error);
            }
          })
        );
      } else {
        // 沒有refresh token，直接登出
        console.log('沒有refresh token，重定向到登入頁面');
        this.isRefreshing = false;
        this.handleAuthFailure();
        return throwError(new Error('沒有refresh token'));
      }
    } else {
      // 正在刷新token，等待刷新完成
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          console.log('使用刷新後的token重試請求');
          return next.handle(this.addTokenToRequest(request));
        })
      );
    }
  }

  /**
   * 處理403禁止訪問錯誤
   */
  private handle403Error(error: HttpErrorResponse, request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    console.error('收到403錯誤 - 禁止訪問:', {
      url: error.url,
      message: error.message,
      status: error.status,
      statusText: error.statusText
    });

    // 檢查用戶是否有有效的token
    const token = this.authService.getToken();
    const refreshToken = localStorage.getItem('refreshToken');

    if (!token) {
      console.log('沒有有效token，重定向到登入頁面');
      this.handleAuthFailure();
      return throwError(error);
    }

    // 如果有 refreshToken，嘗試刷新 token（403 有時也可能是 token 過期導致）
    if (refreshToken && !this.isRefreshing) {
      console.log('403錯誤可能是token過期，嘗試刷新token...');
      return this.handle401Error(request, next);
    } else if (this.isRefreshing) {
      // 正在刷新token，等待刷新完成後重試
      return this.refreshTokenSubject.pipe(
        filter(token => token != null),
        take(1),
        switchMap(token => {
          console.log('使用刷新後的token重試403請求');
          return next.handle(this.addTokenToRequest(request));
        })
      );
    } else {
      // 沒有 refreshToken 或其他情況，顯示權限不足訊息
      const userRole = this.authService.getUserRole();
      console.log('用戶已登入但權限不足:', {
        hasToken: !!token,
        hasRefreshToken: !!refreshToken,
        userRole: userRole,
        requestUrl: error.url
      });

      this.showPermissionDeniedMessage();
      return throwError(error);
    }
  }

  /**
   * 處理認證失敗
   */
  private handleAuthFailure(): void {
    // 防止重複顯示提示
    if (this.hasShownAuthFailure) {
      return;
    }

    this.hasShownAuthFailure = true;

    // 顯示用戶提示
    if (typeof window !== 'undefined') {
      alert('登入驗證已過期，請重新登入');
    }



    // 清除本地存儲的認證信息
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userNameOriginal');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('userAvatar');


    // 重定向到登入頁面
    this.router.navigate(['/login'], { replaceUrl: true }).then(() => {
      // 導航完成後重置標誌，以便下次登入後能正常顯示
      setTimeout(() => {
        this.hasShownAuthFailure = false;
      }, 1000);
    });
  }

  /**
   * 顯示權限不足訊息
   */
  private showPermissionDeniedMessage(): void {
    // 這裡可以使用通知服務或其他方式顯示權限不足的訊息
    console.warn('權限不足：您沒有訪問此資源的權限');

    // 可以考慮重定向到無權限頁面或首頁
    // this.router.navigate(['/unauthorized']);
    // 或者顯示一個彈窗提示
    alert('權限不足：您沒有訪問此資源的權限');
  }

  /**
   * 處理網路錯誤
   */
  private handleNetworkError(error: HttpErrorResponse): void {
    const requestUrl = error.url || '';

    // 檢查是否在完全跳過清單中
    if (this.isInSkipList(requestUrl)) {
      return; // 完全跳過錯誤處理
    }

    // 檢查是否在例外清單中
    if (this.isInExceptionList(requestUrl, error.status)) {
      // 只記錄錯誤但不顯示用戶訊息
      this.logNetworkError(error);
      return;
    }

    // 統一錯誤訊息來源：優先使用後端 resultMessage，否則由 HttpErrorHandlerService 產生
    const hasBackendMessage = !!(error?.error && error.error.resultMessage);
    const fallbackMessage = this.httpErrorHandler.getErrorMessageOnly(error, '請求');
    const errorMessage = hasBackendMessage ? error.error.resultMessage : fallbackMessage;

    if (hasBackendMessage) {
      console.error('後端錯誤訊息:', errorMessage, error);
    } else {
      console.error('HTTP 錯誤:', error);
    }

    // 使用 MatSnackBar 顯示錯誤訊息
    this.snackBar.open(
      hasBackendMessage ? errorMessage : `${errorMessage}，如問題持續發生請聯絡系統管理員`,
      '關閉',
      {
        duration: 8000, // 8秒後自動關閉
        horizontalPosition: 'center',
        verticalPosition: 'bottom',
        panelClass: ['error-snackbar']
      }
    );
  }

  /**
   * 檢查 URL 是否在完全跳過清單中
   */
  private isInSkipList(url: string): boolean {
    return this.networkErrorExceptionList.skipUrls.some(pattern =>
      url.includes(pattern)
    );
  }

  /**
   * 檢查 URL 或狀態碼是否在例外清單中
   */
  private isInExceptionList(url: string, statusCode: number): boolean {
    // 檢查 URL 模式
    const urlInException = this.networkErrorExceptionList.urlPatterns.some(pattern =>
      url.includes(pattern)
    );

    // 檢查狀態碼
    const statusInException = this.networkErrorExceptionList.statusCodes.includes(statusCode);

    return urlInException || statusInException;
  }

  /**
   * 記錄網路錯誤（不顯示用戶訊息）
   */
  private logNetworkError(error: HttpErrorResponse): void {
    if (error.status === 0) {
      console.warn('網路連線錯誤 (已忽略用戶提示):', {
        url: error.url,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    } else if (error.status >= 500) {
      console.warn('伺服器錯誤 (已忽略用戶提示):', {
        status: error.status,
        url: error.url,
        message: error.message,
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * 動態添加 URL 到例外清單
   */
  public addUrlToExceptionList(urlPattern: string): void {
    if (!this.networkErrorExceptionList.urlPatterns.includes(urlPattern)) {
      this.networkErrorExceptionList.urlPatterns.push(urlPattern);
      console.log(`已添加 URL 模式到網路錯誤例外清單: ${urlPattern}`);
    }
  }

  /**
   * 動態添加狀態碼到例外清單
   */
  public addStatusCodeToExceptionList(statusCode: number): void {
    if (!this.networkErrorExceptionList.statusCodes.includes(statusCode)) {
      this.networkErrorExceptionList.statusCodes.push(statusCode);
      console.log(`已添加狀態碼到網路錯誤例外清單: ${statusCode}`);
    }
  }

  /**
   * 動態添加 URL 到完全跳過清單
   */
  public addUrlToSkipList(urlPattern: string): void {
    if (!this.networkErrorExceptionList.skipUrls.includes(urlPattern)) {
      this.networkErrorExceptionList.skipUrls.push(urlPattern);
      console.log(`已添加 URL 模式到網路錯誤跳過清單: ${urlPattern}`);
    }
  }

  /**
   * 移除 URL 從例外清單
   */
  public removeUrlFromExceptionList(urlPattern: string): void {
    const index = this.networkErrorExceptionList.urlPatterns.indexOf(urlPattern);
    if (index > -1) {
      this.networkErrorExceptionList.urlPatterns.splice(index, 1);
      console.log(`已從網路錯誤例外清單移除 URL 模式: ${urlPattern}`);
    }
  }

  /**
   * 獲取當前例外清單配置
   */
  public getExceptionListConfig(): any {
    return {
      urlPatterns: [...this.networkErrorExceptionList.urlPatterns],
      statusCodes: [...this.networkErrorExceptionList.statusCodes],
      skipUrls: [...this.networkErrorExceptionList.skipUrls]
    };
  }

  /**
   * 檢查是否為網路錯誤或伺服器錯誤
   */
  /**
   * 檢查是否為 refresh token 相關的認證錯誤
   */
  private isRefreshTokenAuthError(error: any): boolean {
    const errorMessage = error.error?.resultMessage || error.message || error.error?.message || '';

    // 檢查是否包含 refresh token 相關的錯誤訊息
    const refreshTokenErrorKeywords = [
      '刷新令牌失敗',
      '刷新令牌無效',
      '刷新令牌已過期',
      '令牌無效',
      '令牌已過期',
      'refresh token invalid',
      'refresh token expired',
      'token invalid',
      'token expired',
      'invalid refresh token',
      'expired refresh token'
    ];

    return refreshTokenErrorKeywords.some(keyword =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  private isNetworkOrServerError(error: any): boolean {
    // 網路連線錯誤 (status 0)
    if (error.status === 0) {
      return true;
    }

    // 對於 refresh token 相關錯誤，即使是 5xx 狀態碼也不視為網路錯誤
    if (this.isRefreshTokenAuthError(error)) {
      return false;
    }

    // 伺服器錯誤 (5xx)
    if (error.status >= 500) {
      return true;
    }

    // 檢查錯誤訊息是否包含網路相關關鍵字
    const errorMessage = error.message || error.error?.message || '';
    const networkErrorKeywords = [
      'network',
      'timeout',
      'connection',
      'unreachable',
      'offline',
      'ERR_NETWORK',
      'ERR_INTERNET_DISCONNECTED',
      'ERR_CONNECTION_REFUSED'
    ];

    return networkErrorKeywords.some(keyword =>
      errorMessage.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  /**
   * 檢查token是否即將過期並主動刷新
   */
  private checkAndRefreshToken(): void {
    const tokenExpires = localStorage.getItem('tokenExpires');

    if (tokenExpires) {
      const expirationDate = new Date(tokenExpires);
      const now = new Date();
      const timeUntilExpiry = expirationDate.getTime() - now.getTime();

      // 如果token將在5分鐘內過期，主動刷新
      if (timeUntilExpiry < 5 * 60 * 1000 && timeUntilExpiry > 0) {
        const refreshToken = localStorage.getItem('refreshToken');

        if (refreshToken && !this.isRefreshing) {
          console.log('Token即將過期，主動刷新...');
          this.authService.refreshToken(refreshToken).subscribe({
            next: (response) => {
              console.log('主動刷新token成功');
            },
            error: (error) => {
              console.error('主動刷新token失敗:', error);
            }
          });
        }
      }
    }
  }
}
