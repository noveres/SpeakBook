import { Injectable } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of } from 'rxjs';

/**
 * 前端HTTP錯誤處理服務
 * 可主動呼叫的錯誤處理與訊息轉換工具
 * 這在需要局部覆蓋處理或不想由攔截器顯示通知時使用
 * 需要將API編碼進例外清單
 * 並且要在需要主動呼叫的地方注入此服務
 */
@Injectable({
  providedIn: 'root'
})
export class HttpErrorHandlerService {

  constructor(private snackBar: MatSnackBar) {}

  /**
   * 處理HTTP錯誤並顯示用戶友善的錯誤訊息
   * @param error HTTP錯誤響應
   * @param operation 操作描述（如：'載入資料'、'新增部門'等）
   * @param showSnackBar 是否顯示SnackBar提示（預設為true）
   * @returns 用戶友善的錯誤訊息
   */
  handleError(error: HttpErrorResponse, operation: string = '操作', showSnackBar: boolean = true): string {
    let errorMessage = this.getErrorMessage(error, operation);
    
    // 記錄詳細錯誤到控制台
    console.error(`${operation}失敗:`, error);
    console.error('錯誤詳情:', {
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      url: error.url,
      error: error.error
    });

    // 顯示用戶友善的錯誤訊息
    if (showSnackBar) {
      this.snackBar.open(errorMessage, '關閉', { duration: 3000 });
    }

    return errorMessage;
  }

  /**
   * 根據HTTP狀態碼獲取用戶友善的錯誤訊息
   * @param error HTTP錯誤響應
   * @param operation 操作描述
   * @returns 用戶友善的錯誤訊息
   */
  private getErrorMessage(error: HttpErrorResponse, operation: string): string {
    // 優先檢查後端是否有返回具體錯誤訊息
    if (error.error && error.error.resultMessage) {
      return `${operation}失敗: ${error.error.resultMessage}`;
    }
    
    let errorMessage = `${operation}失敗`;

    switch (error.status) {
      case 0:
        errorMessage = `${operation}失敗: 網路連線失敗，請檢查網路連線`;
        break;
      case 400:
        errorMessage = `${operation}失敗: 請求參數錯誤`;
        break;
      case 401:
        errorMessage = `${operation}失敗: 認證失敗，請重新登入`;
        break;
      case 403:
        errorMessage = `${operation}失敗: 權限不足，無法執行此操作`;
        break;
      case 404:
        errorMessage = `${operation}失敗: 找不到指定的資源`;
        break;
      case 409:
        errorMessage = `${operation}失敗: 資料衝突，請重新整理後再試`;
        break;
      case 422:
        errorMessage = `${operation}失敗: 資料驗證失敗`;
        break;
      case 429:
        errorMessage = `${operation}失敗: 請求過於頻繁，請稍後再試`;
        break;
      case 500:
        errorMessage = `${operation}失敗: 伺服器內部錯誤，請稍後再試`;
        break;
      case 502:
        errorMessage = `${operation}失敗: 伺服器暫時無法回應，請稍後再試`;
        break;
      case 503:
        errorMessage = `${operation}失敗: 服務暫時無法使用，請稍後再試`;
        break;
      case 504:
        errorMessage = `${operation}失敗: 請求逾時，請稍後再試`;
        break;
      default:
        // 如果沒有後端錯誤訊息，使用其他錯誤訊息
        if (error.error && typeof error.error === 'string') {
          errorMessage = `${operation}失敗: ${error.error}`;
        } else if (error.message) {
          errorMessage = `${operation}失敗: ${error.message}`;
        } else {
          errorMessage = `${operation}失敗: 未知錯誤 (狀態碼: ${error.status})`;
        }
        break;
    }

    return errorMessage;
  }

  /**
   * 處理HTTP錯誤並返回Observable，適用於服務層使用
   * @param error HTTP錯誤響應
   * @param operation 操作描述
   * @param defaultValue 預設返回值
   * @param showSnackBar 是否顯示SnackBar提示
   * @returns Observable包裝的預設值
   */
  handleErrorWithObservable<T>(error: HttpErrorResponse, operation: string, defaultValue: T, showSnackBar: boolean = false): Observable<T> {
    this.handleError(error, operation, showSnackBar);
    return of(defaultValue);
  }

  /**
   * 僅獲取錯誤訊息，不顯示SnackBar
   * @param error HTTP錯誤響應
   * @param operation 操作描述
   * @returns 用戶友善的錯誤訊息
   */
  getErrorMessageOnly(error: HttpErrorResponse, operation: string = '操作'): string {
    return this.getErrorMessage(error, operation);
  }

  /**
   * 檢查是否為特定的HTTP錯誤狀態碼
   * @param error HTTP錯誤響應
   * @param statusCode 要檢查的狀態碼
   * @returns 是否匹配指定的狀態碼
   */
  isHttpError(error: HttpErrorResponse, statusCode: number): boolean {
    return error.status === statusCode;
  }

  /**
   * 檢查是否為伺服器錯誤（5xx）
   * @param error HTTP錯誤響應
   * @returns 是否為伺服器錯誤
   */
  isServerError(error: HttpErrorResponse): boolean {
    return error.status >= 500 && error.status < 600;
  }

  /**
   * 檢查是否為客戶端錯誤（4xx）
   * @param error HTTP錯誤響應
   * @returns 是否為客戶端錯誤
   */
  isClientError(error: HttpErrorResponse): boolean {
    return error.status >= 400 && error.status < 500;
  }

  /**
   * 檢查是否為網路錯誤
   * @param error HTTP錯誤響應
   * @returns 是否為網路錯誤
   */
  isNetworkError(error: HttpErrorResponse): boolean {
    return error.status === 0;
  }
}