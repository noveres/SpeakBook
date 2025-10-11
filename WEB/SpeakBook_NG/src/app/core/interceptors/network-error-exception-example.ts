/**
 * 網路錯誤處理例外清單使用範例
 * 
 * 這個檔案展示如何使用 AuthInterceptor 中的網路錯誤例外清單功能
 */

import { Injectable } from '@angular/core';
import { AuthInterceptor } from './auth.interceptor';

@Injectable({
  providedIn: 'root'
})
export class NetworkErrorExceptionService {

  constructor(private authInterceptor: AuthInterceptor) {}

  /**
   * 初始化例外清單配置
   * 在應用啟動時調用此方法來設置預設的例外清單
   */
  initializeExceptionList(): void {
    // 添加健康檢查 API 到例外清單（不顯示錯誤訊息但會記錄）
    this.authInterceptor.addUrlToExceptionList('/api/health-check');
    this.authInterceptor.addUrlToExceptionList('/api/ping');
    
    // 添加可選服務到例外清單
    this.authInterceptor.addUrlToExceptionList('/api/optional-service');
    this.authInterceptor.addUrlToExceptionList('/api/analytics');
    
    // 添加背景同步服務到完全跳過清單（連記錄都不執行）
    this.authInterceptor.addUrlToSkipList('/api/background-sync');
    this.authInterceptor.addUrlToSkipList('/api/telemetry');
    
    // 添加特定狀態碼到例外清單
    this.authInterceptor.addStatusCodeToExceptionList(503); // Service Unavailable
    this.authInterceptor.addStatusCodeToExceptionList(502); // Bad Gateway
    
    console.log('網路錯誤例外清單已初始化');
  }
  
  /**
   * 動態管理例外清單
   * 根據應用狀態動態添加或移除例外
   */
  manageExceptionList(): void {
    // 獲取當前配置
    const currentConfig = this.authInterceptor.getExceptionListConfig();
    console.log('當前例外清單配置:', currentConfig);
    
    // 動態添加新的例外
    this.authInterceptor.addUrlToExceptionList('/api/new-optional-feature');
    
    // 移除不再需要的例外
    this.authInterceptor.removeUrlFromExceptionList('/api/old-service');
  }
  
  /**
   * 為特定功能模組設置例外
   */
  setupModuleSpecificExceptions(): void {
    // 報表模組 - 某些報表生成可能會超時，不需要顯示錯誤給用戶
    this.authInterceptor.addUrlToExceptionList('/api/reports/generate');
    this.authInterceptor.addUrlToExceptionList('/api/reports/export');
    
    // 檔案上傳 - 大檔案上傳可能會有網路問題
    this.authInterceptor.addUrlToExceptionList('/api/files/upload');
    
    // 即時通知 - 連線問題不需要顯示錯誤
    this.authInterceptor.addUrlToSkipList('/api/notifications/realtime');
    this.authInterceptor.addUrlToSkipList('/api/websocket');
  }
  
  /**
   * 開發環境專用設置
   */
  setupDevelopmentExceptions(): void {
    // 開發環境可能會有更多的測試 API
    this.authInterceptor.addUrlToExceptionList('/api/dev');
    this.authInterceptor.addUrlToExceptionList('/api/test');
    this.authInterceptor.addUrlToSkipList('/api/debug');
  }
  
  /**
   * 生產環境專用設置
   */
  setupProductionExceptions(): void {
    // 生產環境的監控和分析服務
    this.authInterceptor.addUrlToSkipList('/api/monitoring');
    this.authInterceptor.addUrlToSkipList('/api/metrics');
  }
}

/**
 * 使用方式範例：
 * 
 * 1. 在 app.component.ts 或 main.ts 中初始化：
 * 
 * constructor(private networkErrorService: NetworkErrorExceptionService) {
 *   this.networkErrorService.initializeExceptionList();
 * }
 * 
 * 2. 在特定組件中動態管理：
 * 
 * // 在組件初始化時添加例外
 * ngOnInit() {
 *   this.authInterceptor.addUrlToExceptionList('/api/component-specific');
 * }
 * 
 * // 在組件銷毀時移除例外
 * ngOnDestroy() {
 *   this.authInterceptor.removeUrlFromExceptionList('/api/component-specific');
 * }
 * 
 * 3. 條件性設置例外：
 * 
 * if (environment.production) {
 *   this.networkErrorService.setupProductionExceptions();
 * } else {
 *   this.networkErrorService.setupDevelopmentExceptions();
 * }
 */