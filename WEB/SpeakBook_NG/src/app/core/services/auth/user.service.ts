import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, switchMap } from 'rxjs';
import { environment } from '@environments/environment';
import { AuthService } from './auth.service';
import { AvatarService } from './avatar.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiBaseUrl}/api/users`;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private avatarService: AvatarService
  ) { }

  /**
   * 獲取當前登錄用戶的信息
   */
  getCurrentUser(): Observable<any> {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser && currentUser.id) {
      return this.http.get(`${this.apiUrl}/${currentUser.id}`);
    }
    throw new Error('No current user found');
  }

  /**
   * 更新用戶名稱
   * @param userId 用戶ID
   * @param name 新的用戶名稱
   */
  updateUserName(userId: string | number, name: string): Observable<any> {
    // 先獲取當前用戶信息，然後只更新名稱
    return this.http.get(`${this.apiUrl}/${userId}`).pipe(
      switchMap(user => {
        const updateData = { ...user, name: name };
        return this.http.put(`${this.apiUrl}/${userId}`, updateData);
      })
    );
  }

  /**
   * 更新用戶密碼
   * @param userId 用戶ID
   * @param currentPassword 當前密碼
   * @param newPassword 新密碼
   */
  updatePassword(userId: string | number, currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/${userId}/password`, {
      currentPassword,
      newPassword
    });
  }

  /**
   * 上傳用戶頭像
   * @param userId 用戶ID
   * @param file 頭像文件
   */
  uploadAvatar(userId: string | number, file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/${userId}/avatar`, formData).pipe(
      tap(() => {
        // 上傳成功後，通知頭像已更新
        const newAvatarUrl = this.getAvatarUrl(userId);
        this.avatarService.updateAvatar(newAvatarUrl);
      })
    );
  }

  /**
   * 獲取用戶頭像URL
   * @param userId 用戶ID
   */
  getAvatarUrl(userId: string | number): string {
    // 添加時間戳參數避免瀏覽器緩存
    return `${this.apiUrl}/${userId}/avatar?t=${new Date().getTime()}`;
  }
}
