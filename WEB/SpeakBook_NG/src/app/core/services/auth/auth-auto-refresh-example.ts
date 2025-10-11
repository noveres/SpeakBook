/**
 * AuthService 自動刷新 Token 使用範例
 * 
 * 這個文件展示了如何在 Angular 應用中使用 AuthService 的自動刷新功能
 */

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service'; 

@Component({
  selector: 'app-example',
  template: `
    <div class="token-status">
      <h3>Token 狀態監控</h3>
      <div *ngIf="tokenStatus">
        <p>Token 存在: {{ tokenStatus.hasToken ? '是' : '否' }}</p>
        <p>Refresh Token 存在: {{ tokenStatus.hasRefreshToken ? '是' : '否' }}</p>
        <p>Token 是否過期: {{ tokenStatus.isExpired ? '是' : '否' }}</p>
        <p *ngIf="tokenStatus.expiresIn !== null">
          剩餘時間: {{ formatTime(tokenStatus.expiresIn) }}
        </p>
      </div>
      
      <div class="refresh-events">
        <h4>刷新事件記錄</h4>
        <div *ngFor="let event of refreshEvents" class="event-item">
          <span [class]="event.success ? 'success' : 'error'">
            {{ event.timestamp.toLocaleString() }} - 
            {{ event.success ? '刷新成功' : '刷新失敗' }}
          </span>
        </div>
      </div>
      
      <div class="controls">
        <button (click)="startAutoRefresh()">啟動自動刷新</button>
        <button (click)="stopAutoRefresh()">停止自動刷新</button>
        <button (click)="manualRefresh()">手動刷新</button>
      </div>
    </div>
  `,
  styles: [`
    .token-status {
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
      margin: 20px;
    }
    
    .event-item {
      margin: 5px 0;
      padding: 5px;
      border-radius: 4px;
    }
    
    .success {
      color: green;
      background-color: #f0fff0;
    }
    
    .error {
      color: red;
      background-color: #fff0f0;
    }
    
    .controls button {
      margin: 5px;
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    
    .controls button:hover {
      background-color: #0056b3;
    }
  `]
})
export class AuthAutoRefreshExampleComponent implements OnInit, OnDestroy {
  tokenStatus: any = null;
  refreshEvents: Array<{success: boolean, timestamp: Date}> = [];
  
  private subscriptions: Subscription[] = [];

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // 訂閱 token 狀態變化
    const statusSub = this.authService.getTokenStatusChanges().subscribe(
      status => {
        this.tokenStatus = status;
        console.log('Token 狀態更新:', status);
      }
    );
    
    // 訂閱 token 刷新事件
    const refreshSub = this.authService.getTokenRefreshEvents().subscribe(
      event => {
        this.refreshEvents.unshift(event); // 新事件加到前面
        // 只保留最近 10 個事件
        if (this.refreshEvents.length > 10) {
          this.refreshEvents = this.refreshEvents.slice(0, 10);
        }
        console.log('Token 刷新事件:', event);
      }
    );
    
    this.subscriptions.push(statusSub, refreshSub);
    
    // 如果用戶已登入，自動啟動刷新機制
    if (this.authService.isLoggedIn()) {
      this.startAutoRefresh();
    }
  }

  ngOnDestroy(): void {
    // 清理訂閱
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * 啟動自動刷新（每 3 分鐘檢查一次）
   */
  startAutoRefresh(): void {
    this.authService.startAutoRefresh(3); // 3 分鐘檢查一次
  }

  /**
   * 停止自動刷新
   */
  stopAutoRefresh(): void {
    this.authService.stopAutoRefresh();
  }

  /**
   * 手動刷新 token
   */
  manualRefresh(): void {
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      this.authService.refreshToken(refreshToken).subscribe({
        next: (response) => {
          console.log('手動刷新成功:', response);
        },
        error: (error) => {
          console.error('手動刷新失敗:', error);
        }
      });
    } else {
      console.error('沒有可用的 refresh token');
    }
  }

  /**
   * 格式化時間顯示
   */
  formatTime(milliseconds: number): string {
    if (milliseconds <= 0) {
      return '已過期';
    }
    
    const minutes = Math.floor(milliseconds / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    
    return `${minutes}分 ${seconds}秒`;
  }
}

/**
 * 在 app.component.ts 中的使用範例
 */
/*
import { Component, OnInit } from '@angular/core';
import { AuthService } from './@services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // 應用啟動時自動檢查並啟動 token 刷新機制
    if (this.authService.isLoggedIn()) {
      // 啟動自動刷新，每 4 分鐘檢查一次
      this.authService.startAutoRefresh(4);
      
      // 監聽 token 刷新事件
      this.authService.getTokenRefreshEvents().subscribe(event => {
        if (event.success) {
          console.log('Token 自動刷新成功');
          // 可以在這裡顯示成功通知
        } else {
          console.log('Token 自動刷新失敗');
          // 可以在這裡顯示錯誤通知或重新登入提示
        }
      });
    }
  }
}
*/

/**
 * 在服務中使用的範例
 */
/*
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class SomeDataService {
  
  constructor(private authService: AuthService) {
    // 監聽 token 狀態變化
    this.authService.getTokenStatusChanges().subscribe(status => {
      if (status.isExpired) {
        console.log('Token 已過期，暫停數據請求');
        // 暫停或取消正在進行的請求
      } else if (status.hasToken) {
        console.log('Token 有效，可以繼續數據請求');
        // 恢復數據請求
      }
    });
  }
}
*/