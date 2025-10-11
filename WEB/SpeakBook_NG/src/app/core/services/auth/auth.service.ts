import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { catchError, map, tap, finalize, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { LanguageService } from '../i18n/language.service'; // 導入 LanguageService

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private userNameSubject = new BehaviorSubject<string | null>(localStorage.getItem('userName'));
  userName$ = this.userNameSubject.asObservable();
  private keepLoggedInSubject = new BehaviorSubject<boolean>(false);
  keepLoggedIn$ = this.keepLoggedInSubject.asObservable();

  // Token 刷新事件通知
  private tokenRefreshedSubject = new Subject<{success: boolean, timestamp: Date}>();
  public tokenRefreshed$ = this.tokenRefreshedSubject.asObservable();

  // Token 狀態變化通知
  private tokenStatusSubject = new BehaviorSubject<any>(this.getTokenStatus());
  public tokenStatus$ = this.tokenStatusSubject.asObservable();

  setKeepLoggedIn(value: boolean): void {
    this.keepLoggedInSubject.next(value);
  }
  constructor(
    private http: HttpClient,
    private router: Router,
    private languageService: LanguageService, // 注入 LanguageService
  ) { }

  login(loginData: { username: string, password: string }): Observable<any> {
    const loginRequest = {
      identityNumber: loginData.username,
      password: loginData.password
    };
      return this.http.post<any>(environment.api.Account.Login.url, loginRequest)
      .pipe(
        tap(response => {
          if (response && response.success && response.resultObject) {
            const { resultObject } = response;

            // 從後端響應中獲取語系並自動設置
            if (response.language) {
              console.log('從後端獲取語系:', response.language);
              this.languageService.setLanguage(response.language);
            }

            // 存儲令牌信息
            localStorage.setItem('token', resultObject.access_token);
            localStorage.setItem('refreshToken', resultObject.refresh_token);
            localStorage.setItem('tokenType', resultObject.token_type);
            localStorage.setItem('expiresIn', resultObject.expires_in.toString());
            localStorage.setItem('tokenIssued', resultObject['.issued']);
            localStorage.setItem('tokenExpires', resultObject['.expires']);
            console.log('Token 信息已保存，過期時間:', new Date(resultObject['.expires']));

            // 存儲用戶基本信息
            localStorage.setItem('userId', resultObject.userId);
            localStorage.setItem('userName', resultObject.username);
            this.userNameSubject.next(resultObject.username); // 更新 BehaviorSubject
            localStorage.setItem('userEmail', resultObject.email);
            if (resultObject.roles && resultObject.roles.length > 0) {
              localStorage.setItem('userRole', resultObject.roles[0]);
            }

            // 登入成功後獲取用戶詳細資料
            this.fetchUserProfile().subscribe();

            // 更新 token 狀態
            this.updateTokenStatus();
          }
        }),
        switchMap(response => {
  
          return of(response);
        })
      );
  }

  logout(): void {

    // 獲取當前的 token
    const token = this.getToken();
    if (!token) {
      // 如果沒有 token，直接清除本地存儲並重定向
      this.clearLocalStorageAndRedirect();
      return;
    }

    // 準備請求內容，完全符合 API 預期格式
    const requestBody = {
      language: this.languageService.getCurrentLanguage(),
      code: 0,
      success: true,
      resultMessage: "",
      systemStatusCode: "",
      resultObject: null
    };

    // 設置請求頭
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    // 呼叫登出 API
    this.http.post<any>(environment.api.Account.Logout.url, requestBody, httpOptions)
      .subscribe({
        next: (response) => {
          console.log('登出成功:', response);
          this.clearLocalStorageAndRedirect();
        },
        error: (error) => {
          console.error('登出 API 呼叫失敗:', error);
          // 即使 API 失敗，也要清除本地存儲並登出
          this.clearLocalStorageAndRedirect();
        }
      });
  }

  /**
   * 清除本地存儲並重定向到登入頁面
   * @private
   */
  private clearLocalStorageAndRedirect(): void {
    // 清除本地存儲的令牌和用戶信息
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    this.userNameSubject.next(null); // 清除 BehaviorSubject
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userPhone');
    localStorage.removeItem('twoFactorEnabled');
    localStorage.removeItem('userNameOriginal');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('tokenType');
    localStorage.removeItem('expiresIn');
    localStorage.removeItem('tokenIssued');
    localStorage.removeItem('tokenExpires');
    localStorage.removeItem('app.permissions');


    // 更新 token 狀態
    this.updateTokenStatus();

    // 停止自動刷新機制
    this.stopAutoRefresh();

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
    const userEmail = localStorage.getItem('userEmail');
    const userPhone = localStorage.getItem('userPhone');
    const twoFactorEnabled = localStorage.getItem('twoFactorEnabled');

    if (userId) {
      return {
        id: userId,
        name: userName,
        role: userRole,
        email: userEmail,
        phoneNumber: userPhone,
        twoFactorEnabled: twoFactorEnabled === 'true'
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
      if (user.name) {
        localStorage.setItem('userName', user.name);
        this.userNameSubject.next(user.name); // 更新 BehaviorSubject
      }
      if (user.role) localStorage.setItem('userRole', user.role);
      if (user.email) localStorage.setItem('userEmail', user.email);
      if (user.phoneNumber) localStorage.setItem('userPhone', user.phoneNumber);
      if (user.twoFactorEnabled !== undefined) localStorage.setItem('twoFactorEnabled', user.twoFactorEnabled.toString());
    }
  }

  exchangeAuthCodeForToken(authCode: string): Observable<any> {
    const requestBody = {
      resultObject: {
        AuthCode: authCode
      }
    };

    return this.http.post<any>(environment.api.Account.ExchangeAuthCode.url, requestBody)
      .pipe(
        tap(response => {
          if (response && response.success && response.resultObject) {
            // 從後端響應中獲取語系並自動設置
            if (response.language) {
              console.log('從後端獲取語系 (授權碼交換):', response.language);
              this.languageService.setLanguage(response.language);
            }

            // 存儲令牌信息
            localStorage.setItem('token', response.resultObject.access_token);
            localStorage.setItem('refreshToken', response.resultObject.refresh_token);
            localStorage.setItem('tokenType', response.resultObject.token_type);
            localStorage.setItem('expiresIn', response.resultObject.expires_in.toString());
            localStorage.setItem('tokenIssued', response.resultObject['.issued']);
            localStorage.setItem('tokenExpires', response.resultObject['.expires']);

            // 存儲用戶信息
            localStorage.setItem('userId', response.resultObject.username);
            localStorage.setItem('userName', response.resultObject.username);
            this.userNameSubject.next(response.resultObject.username); // 更新 BehaviorSubject
            if (response.resultObject.roles && response.resultObject.roles.length > 0) {
              localStorage.setItem('userRole', response.resultObject.roles[0]);
            } else {
              localStorage.removeItem('userRole');
            }

            // 授權碼交換成功後獲取用戶詳細資料
            this.fetchUserProfile().subscribe();
          }
        }),
        switchMap(response => {

          return of(response);
        })
      );
  }

  /**
   * 獲取用戶個人資料並保存到本地存儲
   * @returns Observable<any> 用戶個人資料響應
   */
  fetchUserProfile(): Observable<any> {
    // 獲取保存的令牌
    const token = this.getToken();

    // 如果沒有令牌，返回錯誤
    if (!token) {
      console.error('獲取用戶資料失敗：未找到認證令牌');
      return new Observable(observer => {
        observer.error('未找到認證令牌');
        observer.complete();
      });
    }

    // 創建帶有授權標頭的 HTTP 請求
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    console.log('fetchUserProfile - 開始獲取用戶資料...');
    console.log('fetchUserProfile - 請求 URL:', environment.api.Account.Profile.url);

    return this.http.get<any>(environment.api.Account.Profile.url, httpOptions)
      .pipe(
        tap(response => {
          console.log('fetchUserProfile - API 響應:', JSON.stringify(response, null, 2));

          if (response && response.success && response.resultObject) {
            const profileData = response.resultObject;
            console.log('fetchUserProfile - 用戶資料:', JSON.stringify(profileData, null, 2));
            console.log('fetchUserProfile - 用戶資料字段:', Object.keys(profileData).join(', '));

            // 保存用戶資料到本地存儲
            localStorage.setItem('userId', profileData.Id);

            // 處理用戶名 - 如果用戶名是電子郵件地址，則提取 @ 前的部分作為顯示名稱
            let displayName = profileData.UserName;
            if (displayName && displayName.includes('@') && displayName === profileData.Email) {
              // 用戶名與電子郵件相同，且包含 @，可能是 Google 登入
              displayName = displayName.split('@')[0]; // 提取 @ 前的部分
              console.log('fetchUserProfile - 從電子郵件提取用戶名:', displayName);
            }

            // 保存原始用戶名和顯示名稱
            localStorage.setItem('userNameOriginal', profileData.UserName);
            localStorage.setItem('userName', displayName);
            this.userNameSubject.next(displayName); // 更新 BehaviorSubject
            localStorage.setItem('userEmail', profileData.Email);
            localStorage.setItem('userPhone', profileData.PhoneNumber);
            localStorage.setItem('twoFactorEnabled', profileData.TwoFactorEnabled.toString());

            // 檢查保存後的數據
            console.log('fetchUserProfile - 保存後的用戶信息:', {
              userId: localStorage.getItem('userId'),
              userNameOriginal: localStorage.getItem('userNameOriginal'),
              userName: localStorage.getItem('userName'),
              userEmail: localStorage.getItem('userEmail'),
              userPhone: localStorage.getItem('userPhone'),
              twoFactorEnabled: localStorage.getItem('twoFactorEnabled')
            });
          } else {
            console.error('fetchUserProfile - 獲取用戶資料失敗或格式不符合預期:', response);
          }
        }),
        finalize(() => {
          console.log('fetchUserProfile - 完成獲取用戶資料');
        })
      );
  }

  /**
   * 測試獲取用戶資料 API
   * 用於開發測試，顯示 API 返回的用戶資料
   * @returns Observable<any> 包含 console.log 的用戶資料響應
   */
  testFetchUserProfile(): Observable<any> {
    // 獲取保存的令牌
    const token = this.getToken();

    // 如果沒有令牌，返回錯誤並顯示警告
    if (!token) {
      console.error('測試獲取用戶資料失敗：未找到認證令牌');
      return new Observable(observer => {
        observer.error('未找到認證令牌');
        observer.complete();
      });
    }

    console.log('開始測試獲取用戶資料 API...');
    console.log('使用令牌:', token.substring(0, 15) + '...');
    console.log('請求 URL:', environment.api.Account.Profile.url);

    // 創建帶有授權標頭的 HTTP 請求
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };

    return this.http.get<any>(environment.api.Account.Profile.url, httpOptions)
      .pipe(
        tap(response => {
          console.log('API 響應完整內容:', JSON.stringify(response, null, 2));
          console.log('API 響應類型:', typeof response);

          if (response && response.success) {
            console.log('API 調用成功!');
            console.log('結果訊息:', response.resultMessage);
            console.log('響應時間:', response.responseDatetime);

            if (response.resultObject) {
              console.log('用戶資料 (resultObject):', JSON.stringify(response.resultObject, null, 2));
              console.log('用戶資料類型:', typeof response.resultObject);
              console.log('用戶資料屬性:');
              for (const key in response.resultObject) {
                console.log(`- ${key}: ${response.resultObject[key]} (${typeof response.resultObject[key]})`);
              }
            } else {
              console.log('警告: API 返回成功但沒有用戶資料 (resultObject 為空)');
            }
          } else {
            console.log('API 調用失敗或格式不符合預期!');
            console.log('檢查響應格式:');
            for (const key in response) {
              console.log(`- ${key}: ${response[key]} (${typeof response[key]})`);
            }
          }
        }),
        finalize(() => {
          console.log('測試獲取用戶資料 API 完成');
        })
      );
  }

  /**
   * 檢查 API 是否接錯或格式不符合預期
   * @returns void
   */
  checkProfileApiFormat(): void {
    console.log('開始檢查 Profile API 格式...');
    this.testFetchUserProfile().subscribe({
      next: (response) => {
        // 檢查是否符合預期格式
        const expectedFormat = {
          language: 'string',
          code: 0,
          success: true,
          resultMessage: 'string',
          systemStatusCode: 'string',
          resultObject: {
            Id: 'string',
            UserName: 'string',
            Email: 'string',
            PhoneNumber: 'string',
            TwoFactorEnabled: true
          }
        };

        console.log('預期格式:', JSON.stringify(expectedFormat, null, 2));

        // 檢查關鍵字段是否存在
        const missingFields = [];
        if (!response.hasOwnProperty('success')) missingFields.push('success');
        if (!response.hasOwnProperty('resultObject')) missingFields.push('resultObject');

        if (response.resultObject) {
          if (!response.resultObject.hasOwnProperty('Id')) missingFields.push('resultObject.Id');
          if (!response.resultObject.hasOwnProperty('UserName')) missingFields.push('resultObject.UserName');
          if (!response.resultObject.hasOwnProperty('Email')) missingFields.push('resultObject.Email');
        }

        if (missingFields.length > 0) {
          console.error('API 響應缺少以下關鍵字段:', missingFields.join(', '));
          console.log('可能需要調整代碼以適應實際 API 格式');
        } else {
          console.log('API 響應包含所有預期的關鍵字段');
        }

        // 檢查字段大小寫是否有問題
        if (response.resultObject) {
          const fields = Object.keys(response.resultObject);
          console.log('實際返回的字段 (注意大小寫):', fields.join(', '));

          // 檢查是否有小寫開頭的字段 (可能與我們的代碼不匹配)
          const lowercaseFields = fields.filter(f => f[0] === f[0].toLowerCase() && f[0] !== f[0].toUpperCase());
          if (lowercaseFields.length > 0) {
            console.warn('發現小寫開頭的字段 (可能需要調整代碼):', lowercaseFields.join(', '));
          }
        }
      },
      error: (err) => {
        console.error('檢查 API 格式時出錯:', err);
      }
    });
  }
  /**
   * 刷新訪問令牌
   * @param refreshToken 當前的刷新令牌
   * @returns Observable<ResponseResultOfVM_LoginResp> 包含新的訪問令牌和刷新令牌的響應
   */
  refreshToken(refreshToken: string): Observable<any> {
    console.log('開始刷新 Token...');

    // 準備符合 API 格式的請求內容
    const requestBody = {
      language: this.languageService.getCurrentLanguage(),
      resultObject: {
        RefreshToken: refreshToken  // 注意：這裡的 RefreshToken 必須大寫開頭
      }
    };

    console.log('刷新 Token 請求 URL:', environment.api.Account.RefreshToken.url);

    return this.http.post<any>(environment.api.Account.RefreshToken.url, requestBody)
      .pipe(
        tap(response => {
          console.log('收到刷新 Token 響應:', JSON.stringify(response, null, 2));

          if (response && response.success && response.resultObject) {
            const { resultObject } = response;
            console.log('開始更新 localStorage...');

            // 檢查並存儲令牌信息
            if (resultObject.access_token) {
              localStorage.setItem('token', resultObject.access_token);
              console.log('✓ 已更新 access_token:', resultObject.access_token.substring(0, 20) + '...');
            } else {
              console.warn('⚠ 響應中缺少 access_token');
            }

            if (resultObject.refresh_token) {
              localStorage.setItem('refreshToken', resultObject.refresh_token);
              console.log('✓ 已更新 refresh_token:', resultObject.refresh_token.substring(0, 20) + '...');
            } else {
              console.warn('⚠ 響應中缺少 refresh_token');
            }

            // 存儲令牌過期時間
            if (resultObject['.expires']) {
              localStorage.setItem('tokenExpires', resultObject['.expires']);
              console.log('✓ 已更新 tokenExpires:', resultObject['.expires']);
              console.log('✓ 令牌過期時間:', new Date(resultObject['.expires']));
            } else {
              console.warn('⚠ 響應中缺少 .expires');
            }

            // 存儲令牌發行時間
            if (resultObject['.issued']) {
              localStorage.setItem('tokenIssued', resultObject['.issued']);
              console.log('✓ 已更新 tokenIssued:', resultObject['.issued']);
            } else {
              console.warn('⚠ 響應中缺少 .issued');
            }

            // 存儲其他令牌相關信息
            if (resultObject.token_type) {
              localStorage.setItem('tokenType', resultObject.token_type);
              console.log('✓ 已更新 tokenType:', resultObject.token_type);
            }

            if (resultObject.expires_in) {
              localStorage.setItem('expiresIn', resultObject.expires_in.toString());
              console.log('✓ 已更新 expiresIn:', resultObject.expires_in);
            }

            // 存儲用戶信息
            if (resultObject.email) {
              localStorage.setItem('userEmail', resultObject.email);
              console.log('✓ 已更新 userEmail:', resultObject.email);
            }

            if (resultObject.username) {
              // 處理用戶名 - 如果用戶名是電子郵件地址，則提取 @ 前的部分作為顯示名稱
              let displayName = resultObject.username;
              if (displayName && displayName.includes('@') && displayName === resultObject.email) {
                // 用戶名與電子郵件相同，且包含 @，可能是 Google 登入
                displayName = displayName.split('@')[0]; // 提取 @ 前的部分
                console.log('refreshToken - 從電子郵件提取用戶名:', displayName);
              }

              // 保存原始用戶名和顯示名稱
              localStorage.setItem('userNameOriginal', resultObject.username);
              localStorage.setItem('userName', displayName);
              this.userNameSubject.next(displayName);
              console.log('✓ 已更新 userName:', displayName);
            }

            if (resultObject.roles && resultObject.roles.length > 0) {
              localStorage.setItem('userRole', resultObject.roles[0]);
              console.log('✓ 已更新 userRole:', resultObject.roles[0]);
            }
          } else {
            console.error('❌ 刷新 Token 失敗 - 響應格式不正確:', {
              hasResponse: !!response,
              hasSuccess: response?.success,
              hasResultObject: !!response?.resultObject,
              response: response
            });
            throw new Error('刷新 Token 失敗: ' + (response?.resultMessage || '響應格式不正確'));
          }
        }),
        finalize(() => {
          console.log('🔄 Token 刷新程序完成');
        })
      );
  }

  /**
   * 檢查 token 是否需要刷新
   * @returns boolean 如果需要刷新返回 true
   */
  private shouldRefreshToken(): boolean {
    const tokenExpires = localStorage.getItem('tokenExpires');
    if (!tokenExpires) return false;

    const expirationDate = new Date(tokenExpires);
    const now = new Date();
    const timeUntilExpiry = expirationDate.getTime() - now.getTime();

    // 如果 token 將在 5 分鐘內過期，就需要刷新
    return timeUntilExpiry < 5 * 60 * 1000;
  }

  /**
   * 自動檢查並刷新 token
   * @returns Observable<boolean> 刷新是否成功
   */
  autoRefreshToken(): Observable<boolean> {
    return new Observable(observer => {
      if (this.shouldRefreshToken()) {
        console.log('Token 即將過期，開始自動刷新...');
        const currentRefreshToken = localStorage.getItem('refreshToken');

        if (!currentRefreshToken) {
          console.error('沒有可用的 refresh token');
          observer.next(false);
          observer.complete();
          return;
        }

        this.refreshToken(currentRefreshToken).subscribe({
          next: () => {
            console.log('Token 自動刷新成功');
            observer.next(true);
            observer.complete();
          },
          error: (error) => {
            console.error('Token 自動刷新失敗:', error);
            observer.next(false);
            observer.complete();
          }
        });
      } else {
        console.log('Token 尚未需要刷新');
        observer.next(true);
        observer.complete();
      }
    });
  }

  /**
   * 獲取當前的令牌狀態
   * @returns TokenStatus 當前的令牌狀態
   */
  getTokenStatus(): any {
    const token = localStorage.getItem('token');
    const refreshToken = localStorage.getItem('refreshToken');
    const tokenExpires = localStorage.getItem('tokenExpires');
    const tokenIssued = localStorage.getItem('tokenIssued');
    const tokenType = localStorage.getItem('tokenType');
    const expiresIn = localStorage.getItem('expiresIn');

    let expiresInMs: number | null = null;
    if (tokenExpires) {
      const expirationDate = new Date(tokenExpires);
      const now = new Date();
      expiresInMs = expirationDate.getTime() - now.getTime();
    }

    return {
      hasToken: !!token,
      hasRefreshToken: !!refreshToken,
      isExpired: expiresInMs !== null ? expiresInMs <= 0 : null,
      expiresIn: expiresInMs,
      tokenType,
      tokenIssued: tokenIssued ? new Date(tokenIssued) : null,
      tokenExpires: tokenExpires ? new Date(tokenExpires) : null
    };
  }

  private refreshTimer: any = null;
  private isAutoRefreshEnabled = false;

  /**
   * 啟動自動刷新 Token 機制
   * @param checkIntervalMinutes 檢查間隔（分鐘），預設為 4 分鐘
   */
  startAutoRefresh(checkIntervalMinutes: number = 4): void {
    if (this.isAutoRefreshEnabled) {
      console.log('自動刷新機制已經啟動');
      return;
    }

    this.isAutoRefreshEnabled = true;

    // 立即檢查一次 token 狀態
    this.performInitialTokenCheck();

    // 設定定時檢查
    this.refreshTimer = setInterval(() => {
      if (this.isLoggedIn()) {
        this.autoRefreshToken().subscribe({
          next: (success) => {
            if (success) {
              console.log('定時檢查：Token 狀態正常或已成功刷新');
            } else {
              console.log('定時檢查：Token 刷新失敗，可能需要重新登入');
              this.handleRefreshFailure();
            }
          },
          error: (error) => {
            console.error('定時檢查：Token 刷新過程中發生錯誤:', error);
            this.handleRefreshFailure();
          }
        });
      }
    }, checkIntervalMinutes * 60 * 1000);

    console.log(`Token 自動刷新機制已啟動（每 ${checkIntervalMinutes} 分鐘檢查一次）`);
  }

  /**
   * 停止自動刷新機制
   */
  stopAutoRefresh(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
    this.isAutoRefreshEnabled = false;
    console.log('Token 自動刷新機制已停止');
  }

  /**
   * 執行初始 Token 檢查
   */
  private performInitialTokenCheck(): void {
    if (!this.isLoggedIn()) {
      console.log('用戶未登入，跳過初始 Token 檢查');
      return;
    }

    const status = this.getTokenStatus();
    console.log('執行初始 Token 檢查...');

    if (status.isExpired) {
      console.log('Token 已過期，嘗試刷新...');
      this.attemptTokenRefresh();
    } else if (this.shouldRefreshToken()) {
      console.log('Token 即將過期，預先刷新...');
      this.attemptTokenRefresh();
    } else {
      console.log('Token 狀態正常，無需刷新');
    }
  }

  /**
   * 嘗試刷新 Token
   */
  private attemptTokenRefresh(): void {
    const refreshToken = localStorage.getItem('refreshToken');

    if (!refreshToken) {
      console.error('沒有可用的 refresh token，無法刷新');
      this.handleRefreshFailure();
      return;
    }

    this.refreshToken(refreshToken).subscribe({
      next: (response) => {
        console.log('Token 刷新成功');
        this.notifyTokenRefreshed();
      },
      error: (error) => {
        console.error('Token 刷新失敗:', error);
        this.notifyTokenRefreshFailed();
        this.handleRefreshFailure();
      }
    });
  }

  /**
   * 處理刷新失敗的情況
   */
  private handleRefreshFailure(): void {
    console.log('Token 刷新失敗，清除認證資訊');
    this.logout();
  }

  /**
   * 通知 Token 已刷新（可用於其他組件監聽）
   */
  private notifyTokenRefreshed(): void {
    const timestamp = new Date();
    console.log('Token 刷新完成，通知相關組件');

    // 發送 token 刷新成功事件
    this.tokenRefreshedSubject.next({ success: true, timestamp });

    // 更新 token 狀態
    this.updateTokenStatus();
  }

  /**
   * 通知 Token 刷新失敗
   */
  private notifyTokenRefreshFailed(): void {
    const timestamp = new Date();
    console.log('Token 刷新失敗，通知相關組件');

    // 發送 token 刷新失敗事件
    this.tokenRefreshedSubject.next({ success: false, timestamp });

    // 更新 token 狀態
    this.updateTokenStatus();
  }

  /**
   * 更新 Token 狀態
   */
  private updateTokenStatus(): void {
    const status = this.getTokenStatus();
    this.tokenStatusSubject.next(status);
  }

  /**
   * 獲取 Token 刷新事件的 Observable（供其他組件訂閱）
   */
  getTokenRefreshEvents(): Observable<{success: boolean, timestamp: Date}> {
    return this.tokenRefreshed$;
  }

  /**
   * 獲取 Token 狀態變化的 Observable（供其他組件訂閱）
   */
  getTokenStatusChanges(): Observable<any> {
    return this.tokenStatus$;
  }

  /**
   * 啟動定時檢查 token 的機制（保留舊方法以向後兼容）
   * @deprecated 請使用 startAutoRefresh() 方法
   */
  startTokenRefreshTimer(): void {
    console.warn('startTokenRefreshTimer() 已棄用，請使用 startAutoRefresh() 方法');
    this.startAutoRefresh(4);
  }

  /**
   * 顯示詳細的令牌狀態資訊
   */
  logTokenStatus(): void {
    const status = this.getTokenStatus();
    console.log('========== Token 詳細狀態 ==========');

    // 基本令牌資訊
    console.log('Access Token 狀態:');
    console.log('- 是否存在:', status.hasToken ? '✓ 是' : '✗ 否');
    if (status.hasToken) {
      const token = localStorage.getItem('token');
      console.log('- Token 長度:', token?.length);
      console.log('- Token 前10字符:', token?.substring(0, 10) + '...');
    }

    // Refresh Token 資訊
    console.log('\nRefresh Token 狀態:');
    console.log('- 是否存在:', status.hasRefreshToken ? '✓ 是' : '✗ 否');
    if (status.hasRefreshToken) {
      const refreshToken = localStorage.getItem('refreshToken');
      console.log('- Refresh Token 長度:', refreshToken?.length);
      console.log('- Refresh Token 前10字符:', refreshToken?.substring(0, 10) + '...');
    }

    // 令牌時間資訊
    console.log('\n時間資訊:');
    if (status.tokenIssued) {
      console.log('- 建立時間:', status.tokenIssued.toLocaleString());
    }
    if (status.tokenExpires) {
      console.log('- 過期時間:', status.tokenExpires.toLocaleString());
      const now = new Date();
      const remainingTime = status.tokenExpires.getTime() - now.getTime();
      const remainingMinutes = Math.floor(remainingTime / (1000 * 60));
      const remainingSeconds = Math.floor((remainingTime % (1000 * 60)) / 1000);
      console.log('- 剩餘時間:', `${remainingMinutes}分 ${remainingSeconds}秒`);
      console.log('- 是否過期:', status.isExpired ? '✗ 已過期' : '✓ 有效');
    }

    // 令牌類型和其他資訊
    console.log('\n其他資訊:');
    console.log('- Token 類型:', status.tokenType || '未設定');

    // 用戶資訊
    console.log('\n用戶資訊:');
    console.log('- 用戶ID:', localStorage.getItem('userId') || '未設定');
    console.log('- 用戶名:', localStorage.getItem('userName') || '未設定');
    console.log('- 電子郵件:', localStorage.getItem('userEmail') || '未設定');
    console.log('- 用戶角色:', localStorage.getItem('userRole') || '未設定');

    console.log('==================================');
  }
}
