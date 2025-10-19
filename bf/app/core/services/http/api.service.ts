import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { HttpErrorHandlerService } from './http-error-handler.service';
import { LanguageService } from '../i18n/language.service';

/**
 * 統一 API 服務
 * 提供標準化的 HTTP 請求封裝，整合錯誤處理和通用參數
 */
@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private http: HttpClient,
    private errorHandler: HttpErrorHandlerService,
    private languageService: LanguageService
  ) {}

  /**
   * 獲取認證 Token
   * @returns Token 字串或 null
   */
  private getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * 建立標準 HTTP Headers
   * @param customHeaders 自定義 headers
   * @returns HttpHeaders
   */
  private createHeaders(customHeaders?: { [key: string]: string }): HttpHeaders {
    const token = this.getToken();
    let headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });

    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    if (customHeaders) {
      Object.keys(customHeaders).forEach(key => {
        headers = headers.set(key, customHeaders[key]);
      });
    }

    return headers;
  }

  /**
   * 建立標準請求 Payload
   * @param data 業務資料
   * @param includeLanguage 是否包含語言參數
   * @returns 標準請求格式
   */
  private createPayload(data: any, includeLanguage: boolean = true): any {
    if (!includeLanguage) {
      return data;
    }

    return {
      language: this.languageService.getCurrentLanguage(),
      resultObject: data
    };
  }

  /**
   * 處理 API 響應
   * @param response API 響應
   * @param operation 操作描述
   * @returns 處理後的資料
   */
  private handleResponse(response: any, operation: string): any {
    console.log(`${operation} API 回應:`, response);
    
    if (response && response.success !== undefined) {
      if (response.success) {
        return response.resultObject || response;
      } else {
        // 優先使用後端的錯誤訊息
        const errorMessage = response.resultMessage || response.message || `${operation}失敗`;
        throw new Error(errorMessage);
      }
    }
    
    return response;
  }

  /**
   * GET 請求
   * @param url API 端點
   * @param params 查詢參數
   * @param operation 操作描述（用於錯誤處理）
   * @param customHeaders 自定義 headers
   * @returns Observable
   */
  get<T>(url: string, params?: HttpParams | { [key: string]: any }, operation: string = 'GET 請求', customHeaders?: { [key: string]: string }): Observable<T> {
    const headers = this.createHeaders(customHeaders);
    let httpParams = new HttpParams();

    if (params) {
      if (params instanceof HttpParams) {
        httpParams = params;
      } else {
        Object.keys(params).forEach(key => {
          if (params[key] !== null && params[key] !== undefined) {
            httpParams = httpParams.set(key, params[key].toString());
          }
        });
      }
    }

    return this.http.get<T>(url, { headers, params: httpParams }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }

  /**
   * POST 請求
   * @param url API 端點
   * @param data 請求資料
   * @param operation 操作描述
   * @param customHeaders 自定義 headers
   * @param includeLanguage 是否包含語言參數
   * @returns Observable
   */
  post<T>(url: string, data: any, operation: string = 'POST 請求', customHeaders?: { [key: string]: string }, includeLanguage: boolean = true): Observable<T> {
    const headers = this.createHeaders(customHeaders);
    const payload = this.createPayload(data, includeLanguage);

    return this.http.post<T>(url, payload, { headers }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }

  /**
   * PUT 請求
   * @param url API 端點
   * @param data 請求資料
   * @param operation 操作描述
   * @param customHeaders 自定義 headers
   * @param includeLanguage 是否包含語言參數
   * @returns Observable
   */
  put<T>(url: string, data: any, operation: string = 'PUT 請求', customHeaders?: { [key: string]: string }, includeLanguage: boolean = true): Observable<T> {
    const headers = this.createHeaders(customHeaders);
    const payload = this.createPayload(data, includeLanguage);

    return this.http.put<T>(url, payload, { headers }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }

  /**
   * DELETE 請求
   * @param url API 端點
   * @param operation 操作描述
   * @param customHeaders 自定義 headers
   * @returns Observable
   */
  delete<T>(url: string, operation: string = 'DELETE 請求', customHeaders?: { [key: string]: string }): Observable<T> {
    const headers = this.createHeaders(customHeaders);

    return this.http.delete<T>(url, { headers }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }

  /**
   * PATCH 請求
   * @param url API 端點
   * @param data 請求資料
   * @param operation 操作描述
   * @param customHeaders 自定義 headers
   * @param includeLanguage 是否包含語言參數
   * @returns Observable
   */
  patch<T>(url: string, data: any, operation: string = 'PATCH 請求', customHeaders?: { [key: string]: string }, includeLanguage: boolean = true): Observable<T> {
    const headers = this.createHeaders(customHeaders);
    const payload = this.createPayload(data, includeLanguage);

    return this.http.patch<T>(url, payload, { headers }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }

  /**
   * 通用分頁查詢請求
   * @param url API 端點
   * @param page 頁碼
   * @param pageSize 每頁筆數
   * @param sortField 排序欄位
   * @param sortDirection 排序方向
   * @param searchConditions 搜尋條件
   * @param operation 操作描述
   * @returns Observable
   */
  getByAdvancedQuery<T>(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'Id',
    sortDirection: 'Asc' | 'Desc' = 'Asc',
    searchConditions: Array<{ FieldName: string; Value: any; Operator: string }> = [],
    operation: string = '分頁查詢'
  ): Observable<{ data: T[], total: number }> {
    const queryData = {
      Page: page,
      PageSize: pageSize,
      SortOptions: [{
        FieldName: sortField,
        Direction: sortDirection
      }],
      SearchConditions: searchConditions
    };

    return this.post<any>(url, queryData, operation).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length
          };
        }
        return {
          data: response.data || response.resultObject || [],
          total: response.total || response.totalCount || 0
        };
      })
    );
  }

  /**
   * 文件上傳請求
   * @param url API 端點
   * @param file 文件
   * @param operation 操作描述
   * @param additionalData 額外資料
   * @returns Observable
   */
  uploadFile<T>(url: string, file: File, operation: string = '文件上傳', additionalData?: { [key: string]: any }): Observable<T> {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
      Object.keys(additionalData).forEach(key => {
        formData.append(key, additionalData[key]);
      });
    }

    const token = this.getToken();
    let headers = new HttpHeaders();
    if (token) {
      headers = headers.set('Authorization', `Bearer ${token}`);
    }

    return this.http.post<T>(url, formData, { headers }).pipe(
      map(response => this.handleResponse(response, operation)),
      catchError((error: HttpErrorResponse) => {
        console.error(`${operation} API 錯誤:`, error);
        this.errorHandler.handleError(error, operation, false);
        return throwError(() => error);
      })
    );
  }
}