import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { PageRequest, PageResponse } from '@core/models';
import { BookResponse } from './book-edit.service';

/**
 * API 響應接口
 */
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { [key: string]: string[] };
}

/**
 * 教材查詢服務
 * 專門處理教材的查詢、列表、分頁等操作
 */
@Injectable({
  providedIn: 'root'
})
export class BookQueryService {
  private readonly apiUrl = `${environment.apiBaseUrl}/api/books`;

  constructor(private http: HttpClient) { }

  /**
   * 分頁查詢已發布的教材
   * @param pageRequest 分頁請求參數
   */
  getBooksWithPagination(pageRequest: PageRequest): Observable<PageResponse<BookResponse>> {
    const params: any = {
      page: pageRequest.page.toString(),
      pageSize: pageRequest.pageSize.toString()
    };

    if (pageRequest.sortBy) {
      params.sortBy = pageRequest.sortBy;
    }

    if (pageRequest.sortDirection) {
      params.sortDirection = pageRequest.sortDirection;
    }

    if (pageRequest.searchKeyword) {
      params.searchKeyword = pageRequest.searchKeyword;
    }

    return this.http.get<ApiResponse<PageResponse<BookResponse>>>(`${this.apiUrl}/page`, { params })
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取教材列表失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 獲取教材詳情
   * @param id 教材ID
   */
  getBookById(id: number): Observable<BookResponse> {
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
   * 獲取所有已發布的教材（不分頁）
   */
  getAllPublishedBooks(): Observable<BookResponse[]> {
    return this.http.get<ApiResponse<BookResponse[]>>(this.apiUrl)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取教材列表失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 根據分類獲取教材
   * @param category 分類名稱
   */
  getBooksByCategory(category: string): Observable<BookResponse[]> {
    return this.http.get<ApiResponse<BookResponse[]>>(`${this.apiUrl}/category/${category}`)
      .pipe(
        map(response => {
          if (!response.success || !response.data) {
            throw new Error(response.message || '獲取教材列表失敗');
          }
          return response.data;
        })
      );
  }

  /**
   * 刪除教材
   * @param id 教材ID
   */
  deleteBook(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`)
      .pipe(
        map(response => {
          if (!response.success) {
            throw new Error(response.message || '刪除教材失敗');
          }
          return;
        })
      );
  }
}
