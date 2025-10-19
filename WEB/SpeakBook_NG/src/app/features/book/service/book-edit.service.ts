import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

// 請求接口
export interface CreateBookRequest {
  title: string;
  author?: string;
  description?: string;
  category: string;
  pages: number;
  targetAge: string;
  difficulty: string;
  coverImageUrl: string;
  status: 'draft' | 'published';
  hotspots: HotspotRequest[];
}

export interface HotspotRequest {
  id?: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  audioUrl?: string;
  sortOrder: number;
}

// 響應接口
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

export interface BookResponse {
  id: number;
  title: string;
  author?: string;
  description?: string;
  category: string;
  pages: number;
  targetAge: string;
  difficulty: string;
  coverImageUrl: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt?: string;
  publishedAt?: string;
  hotspots: HotspotResponse[];
}

export interface HotspotResponse {
  id: number;
  label: string;
  x: number;
  y: number;
  width: number;
  height: number;
  audioUrl?: string;
  sortOrder: number;
}

@Injectable({
  providedIn: 'root'
})
export class BookEditService {
  private apiUrl = `${environment.apiBaseUrl}/api/books`;
  private uploadApiUrl = `${environment.apiBaseUrl}/api/upload/image`;

  constructor(private http: HttpClient) { }

  /**
   * 創建教材（發布）
   * @param bookData 教材數據
   */
  createBook(bookData: CreateBookRequest): Observable<BookResponse> {
    return this.http.post<ApiResponse<BookResponse>>(this.apiUrl, bookData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '創建教材失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 儲存草稿
   * @param bookData 教材數據
   */
  saveDraft(bookData: CreateBookRequest): Observable<BookResponse> {
    bookData.status = 'draft';
    return this.http.post<ApiResponse<BookResponse>>(`${this.apiUrl}/draft`, bookData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '儲存草稿失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 更新教材
   * @param id 教材ID
   * @param bookData 教材數據
   */
  updateBook(id: number, bookData: CreateBookRequest): Observable<BookResponse> {
    return this.http.put<ApiResponse<BookResponse>>(`${this.apiUrl}/${id}`, bookData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '更新教材失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 獲取教材詳情
   * @param id 教材ID
   */
  getBook(id: number): Observable<BookResponse> {
    return this.http.get<ApiResponse<BookResponse>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取教材失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 上傳圖片
   * @param file 圖片檔案
   * @param type 圖片類型
   */
  uploadImage(file: File, type: string = 'cover'): Observable<{ url: string; fileName: string; fileSize: number }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.http.post<ApiResponse<any>>(this.uploadApiUrl, formData)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '上傳圖片失敗');
          }
          return response.data;
        })
      );
  }
}
