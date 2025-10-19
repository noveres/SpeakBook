import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface CatboxUploadResponse {
  url: string;
  fileName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CatboxUploadService {
  private readonly UPLOAD_API_URL = `${environment.apiBaseUrl}/api/upload/image`;

  constructor(private http: HttpClient) {}

  /**
   * 上傳圖片到 Catbox.moe（通過後端代理）
   * @param file 圖片檔案
   * @returns Observable<CatboxUploadResponse>
   */
  uploadImage(file: File): Observable<CatboxUploadResponse> {
    // 驗證檔案類型
    if (!this.isValidImageType(file)) {
      return throwError(() => new Error('不支援的圖片格式，請上傳 JPG、PNG、GIF 或 WebP 格式'));
    }

    // 驗證檔案大小（限制 20MB）
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      return throwError(() => new Error('圖片檔案過大，請上傳小於 20MB 的圖片'));
    }

    // 準備 FormData
    const formData = new FormData();
    formData.append('file', file);

    // 通過後端代理上傳到 Catbox
    return this.http.post<{ success: boolean; data?: CatboxUploadResponse; errorMsg?: string }>(
      this.UPLOAD_API_URL, 
      formData
    ).pipe(
      map(response => {
        if (!response.success || !response.data) {
          throw new Error(response.errorMsg || '上傳失敗，請稍後再試');
        }

        return response.data;
      }),
      catchError(error => {
        console.error('圖片上傳錯誤:', error);
        return throwError(() => new Error('圖片上傳失敗：' + (error.message || '網絡錯誤')));
      })
    );
  }

  /**
   * 驗證圖片類型
   * @param file 檔案
   */
  private isValidImageType(file: File): boolean {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    return validTypes.includes(file.type);
  }

  /**
   * 獲取圖片預覽 URL（本地）
   * @param file 圖片檔案
   */
  getPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * 批量上傳圖片
   * @param files 圖片檔案數組
   */
  uploadMultipleImages(files: File[]): Observable<CatboxUploadResponse[]> {
    const uploadObservables = files.map(file => this.uploadImage(file));
    
    // 使用 forkJoin 等待所有上傳完成
    return new Observable(observer => {
      const results: CatboxUploadResponse[] = [];
      let completed = 0;

      uploadObservables.forEach((upload$, index) => {
        upload$.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
  }
}
