import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PageRequest, PageResponse } from '@core/models';

// 音訊響應接口
export interface AudioResponse {
  id: number;
  name: string;           // 音訊名稱
  url: string;            // 音訊 URL
  fileSize: number;       // 檔案大小（字節）
  duration?: number;      // 時長（秒）
  category?: string;      // 分類
  createdAt: string;      // 創建時間
}

// API 響應接口
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private apiUrl = `${environment.apiBaseUrl}/api/audios`;
  private uploadApiUrl = `${environment.apiBaseUrl}/api/upload/audio`;
  private uploadAndSaveApiUrl = `${environment.apiBaseUrl}/api/audios/upload`;

  constructor(private http: HttpClient) { }

  /**
   * 獲取音訊列表（分頁）
   * @param pageRequest 分頁請求參數
   * @param searchKeyword 搜尋關鍵字
   */
  getAudios(pageRequest: PageRequest, searchKeyword?: string): Observable<PageResponse<AudioResponse>> {
    let params = new HttpParams()
      .set('page', pageRequest.page.toString())
      .set('size', pageRequest.pageSize.toString());

    if (searchKeyword && searchKeyword.trim()) {
      params = params.set('keyword', searchKeyword.trim());
    }

    if (pageRequest.sortBy) {
      params = params.set('sort', pageRequest.sortBy);
    }

    return this.http.get<ApiResponse<PageResponse<AudioResponse>>>(`${this.apiUrl}/page`, { params })
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取音訊列表失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 根據 ID 獲取音訊詳情
   * @param id 音訊 ID
   */
  getAudioById(id: number): Observable<AudioResponse> {
    return this.http.get<ApiResponse<AudioResponse>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取音訊詳情失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 上傳音訊檔案（僅上傳到 Catbox，不保存到數據庫）
   * @param file 音訊檔案
   */
  uploadAudio(file: File): Observable<AudioResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<AudioResponse>>(this.uploadApiUrl, formData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '上傳音訊失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 上傳音訊並保存到數據庫
   * @param file 音訊檔案
   * @param name 音訊名稱（可選，默認使用檔案名）
   * @param category 音訊分類（可選）
   */
  uploadAndSaveAudio(file: File, name?: string, category?: string): Observable<AudioResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (name) {
      formData.append('name', name);
    }
    
    if (category) {
      formData.append('category', category);
    }

    return this.http.post<ApiResponse<AudioResponse>>(this.uploadAndSaveApiUrl, formData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '上傳音訊失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 刪除音訊
   * @param id 音訊 ID
   */
  deleteAudio(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || '刪除音訊失敗');
          }
        })
      );
  }

  /**
   * 格式化檔案大小
   * @param bytes 位元組數
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * 格式化音訊時長
   * @param seconds 秒數
   */
  formatDuration(seconds: number): string {
    if (!seconds) return '未知';
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }
}
