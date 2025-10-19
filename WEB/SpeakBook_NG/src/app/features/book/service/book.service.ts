import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
import { BookEditService, CreateBookRequest, BookResponse } from './book-edit.service';
import { CatboxUploadService } from '@core/services/catbox-upload.service';
import { UploadedImage } from '../edit/steps/upload-image/upload-image.component';
import { Hotspot } from '../edit/steps/image-editor/image-editor.component';
import { BookSettings } from '../edit/steps/book-settings/book-settings.component';

/**
 * 統一的教材服務
 * 集中處理所有與教材相關的 API 交互
 */
@Injectable({
  providedIn: 'root'
})
export class BookService {

  constructor(
    private bookEditService: BookEditService,
    private catboxUploadService: CatboxUploadService
  ) { }

  /**
   * 發布教材
   * 1. 上傳圖片到 Catbox.moe
   * 2. 準備教材數據
   * 3. 調用後端 API 創建教材
   * 
   * @param image 上傳的圖片
   * @param hotspots 熱區數組
   * @param settings 教材設定
   */
  publishBook(
    image: UploadedImage,
    hotspots: Hotspot[],
    settings: BookSettings
  ): Observable<BookResponse> {
    // 驗證
    if (!image || !image.file) {
      return throwError(() => new Error('請先上傳圖片'));
    }

    if (!settings.title) {
      return throwError(() => new Error('請填寫教材標題'));
    }

    // 1. 先上傳圖片到 Catbox.moe
    return this.catboxUploadService.uploadImage(image.file).pipe(
      switchMap(uploadResult => {
        console.log('圖片上傳成功:', uploadResult.url);

        // 2. 準備教材數據
        const bookData: CreateBookRequest = {
          title: settings.title,
          author: settings.author,
          description: settings.description,
          category: settings.category,
          pages: settings.pages || 0,
          targetAge: settings.targetAge,
          difficulty: settings.difficulty,
          coverImageUrl: uploadResult.url, // 使用 Catbox URL
          status: 'published',
          hotspots: hotspots.map((hotspot, index) => ({
            label: hotspot.label,
            x: hotspot.x,
            y: hotspot.y,
            width: hotspot.width,
            height: hotspot.height,
            audioUrl: hotspot.audioUrl,
            sortOrder: index + 1
          }))
        };

        console.log('準備發布教材:', bookData);

        // 3. 調用後端 API 創建教材
        return this.bookEditService.createBook(bookData);
      }),
      catchError(error => {
        console.error('發布教材失敗:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 儲存草稿
   * 1. 上傳圖片到 Catbox.moe（如果有圖片）
   * 2. 準備草稿數據
   * 3. 調用後端 API 儲存草稿
   * 
   * @param image 上傳的圖片（可選）
   * @param hotspots 熱區數組
   * @param settings 教材設定
   */
  saveDraft(
    image: UploadedImage | null,
    hotspots: Hotspot[],
    settings: BookSettings
  ): Observable<BookResponse> {
    // 如果有圖片，先上傳
    if (image && image.file) {
      return this.catboxUploadService.uploadImage(image.file).pipe(
        switchMap(uploadResult => {
          const bookData = this.prepareDraftData(
            uploadResult.url,
            hotspots,
            settings
          );
          return this.bookEditService.saveDraft(bookData);
        }),
        catchError(error => {
          console.error('儲存草稿失敗:', error);
          return throwError(() => error);
        })
      );
    } else {
      // 沒有圖片，直接儲存
      const bookData = this.prepareDraftData('', hotspots, settings);
      return this.bookEditService.saveDraft(bookData);
    }
  }

  /**
   * 更新教材
   * 1. 如果有新圖片，上傳到 Catbox.moe
   * 2. 準備更新數據
   * 3. 調用後端 API 更新教材
   * 
   * @param id 教材ID
   * @param image 上傳的圖片
   * @param hotspots 熱區數組
   * @param settings 教材設定
   * @param existingImageUrl 現有的圖片URL（如果沒有新圖片則使用）
   */
  updateBook(
    id: number,
    image: UploadedImage | null,
    hotspots: Hotspot[],
    settings: BookSettings,
    existingImageUrl?: string
  ): Observable<BookResponse> {
    // 如果有新圖片，先上傳
    if (image && image.file) {
      return this.catboxUploadService.uploadImage(image.file).pipe(
        switchMap(uploadResult => {
          const bookData = this.prepareBookData(
            uploadResult.url,
            hotspots,
            settings,
            'published'
          );
          return this.bookEditService.updateBook(id, bookData);
        }),
        catchError(error => {
          console.error('更新教材失敗:', error);
          return throwError(() => error);
        })
      );
    } else {
      // 沒有新圖片，使用現有圖片URL
      const bookData = this.prepareBookData(
        existingImageUrl || '',
        hotspots,
        settings,
        'published'
      );
      return this.bookEditService.updateBook(id, bookData);
    }
  }

  /**
   * 獲取教材詳情
   * @param id 教材ID
   */
  getBook(id: number): Observable<BookResponse> {
    return this.bookEditService.getBook(id);
  }

  /**
   * 準備教材數據
   * @private
   */
  private prepareBookData(
    imageUrl: string,
    hotspots: Hotspot[],
    settings: BookSettings,
    status: 'draft' | 'published'
  ): CreateBookRequest {
    return {
      title: settings.title,
      author: settings.author,
      description: settings.description,
      category: settings.category,
      pages: settings.pages || 0,
      targetAge: settings.targetAge,
      difficulty: settings.difficulty,
      coverImageUrl: imageUrl,
      status: status,
      hotspots: hotspots.map((hotspot, index) => ({
        label: hotspot.label,
        x: hotspot.x,
        y: hotspot.y,
        width: hotspot.width,
        height: hotspot.height,
        audioUrl: hotspot.audioUrl,
        sortOrder: index + 1
      }))
    };
  }

  /**
   * 準備草稿數據
   * @private
   */
  private prepareDraftData(
    imageUrl: string,
    hotspots: Hotspot[],
    settings: BookSettings
  ): CreateBookRequest {
    return this.prepareBookData(imageUrl, hotspots, settings, 'draft');
  }
}
