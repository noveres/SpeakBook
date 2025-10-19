import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AvatarService {
  // 使用 BehaviorSubject 來追蹤頭像更新
  private avatarUpdateSource = new BehaviorSubject<string | null>(null);
  
  // 可觀察的頭像更新流
  avatarUpdate$ = this.avatarUpdateSource.asObservable();
  
  constructor() { }
  
  /**
   * 通知頭像已更新
   * @param avatarUrl 新的頭像URL
   */
  updateAvatar(avatarUrl: string | null): void {
    this.avatarUpdateSource.next(avatarUrl);
  }
}
