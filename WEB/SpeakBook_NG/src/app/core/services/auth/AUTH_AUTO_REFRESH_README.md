# AuthService 自動刷新 Token 功能說明

## 概述

本文檔說明如何使用 `AuthService` 中新增的自動刷新 Token 功能。這個功能可以自動監控 Token 的過期狀態，並在需要時自動刷新，確保用戶的登入狀態持續有效。

## 主要功能

### 1. 自動刷新機制
- **自動檢查**: 定期檢查 Token 是否即將過期
- **預先刷新**: 在 Token 過期前 5 分鐘自動刷新
- **失敗處理**: 刷新失敗時自動登出用戶
- **事件通知**: 提供 Observable 讓其他組件監聽刷新事件

### 2. 新增的方法

#### `startAutoRefresh(checkIntervalMinutes?: number)`
啟動自動刷新機制
- **參數**: `checkIntervalMinutes` - 檢查間隔（分鐘），預設為 4 分鐘
- **功能**: 立即檢查 Token 狀態，然後定期檢查並刷新

```typescript
// 啟動自動刷新，每 4 分鐘檢查一次（預設）
this.authService.startAutoRefresh();

// 啟動自動刷新，每 3 分鐘檢查一次
this.authService.startAutoRefresh(3);
```

#### `stopAutoRefresh()`
停止自動刷新機制

```typescript
this.authService.stopAutoRefresh();
```

#### `getTokenRefreshEvents()`
獲取 Token 刷新事件的 Observable

```typescript
this.authService.getTokenRefreshEvents().subscribe(event => {
  if (event.success) {
    console.log('Token 刷新成功:', event.timestamp);
  } else {
    console.log('Token 刷新失敗:', event.timestamp);
  }
});
```

#### `getTokenStatusChanges()`
獲取 Token 狀態變化的 Observable

```typescript
this.authService.getTokenStatusChanges().subscribe(status => {
  console.log('Token 狀態:', {
    hasToken: status.hasToken,
    isExpired: status.isExpired,
    expiresIn: status.expiresIn
  });
});
```

## 使用方式

### 1. 在 App Component 中啟動

```typescript
// app.component.ts
import { Component, OnInit } from '@angular/core';
import { AuthService } from './@services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit {
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // 如果用戶已登入，啟動自動刷新
    if (this.authService.isLoggedIn()) {
      this.authService.startAutoRefresh(4); // 每 4 分鐘檢查一次
      
      // 監聽刷新事件
      this.authService.getTokenRefreshEvents().subscribe(event => {
        if (!event.success) {
          // Token 刷新失敗，可能需要重新登入
          console.warn('Token 刷新失敗，請重新登入');
        }
      });
    }
  }
}
```

### 2. 在登入成功後啟動

```typescript
// login.component.ts
login() {
  this.authService.login(credentials).subscribe({
    next: (response) => {
      if (response.success) {
        // 登入成功後啟動自動刷新
        this.authService.startAutoRefresh();
        this.router.navigate(['/dashboard']);
      }
    },
    error: (error) => {
      console.error('登入失敗:', error);
    }
  });
}
```

### 3. 在組件中監聽 Token 狀態

```typescript
// some.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from '../@services/auth.service';

@Component({
  selector: 'app-some-component',
  templateUrl: './some.component.html'
})
export class SomeComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription[] = [];
  
  constructor(private authService: AuthService) {}
  
  ngOnInit(): void {
    // 監聽 Token 狀態變化
    const statusSub = this.authService.getTokenStatusChanges().subscribe(status => {
      if (status.isExpired) {
        // Token 已過期，停止相關操作
        this.handleTokenExpired();
      }
    });
    
    // 監聽刷新事件
    const refreshSub = this.authService.getTokenRefreshEvents().subscribe(event => {
      if (event.success) {
        // Token 刷新成功，可以繼續操作
        this.handleTokenRefreshed();
      }
    });
    
    this.subscriptions.push(statusSub, refreshSub);
  }
  
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  private handleTokenExpired(): void {
    // 處理 Token 過期的邏輯
  }
  
  private handleTokenRefreshed(): void {
    // 處理 Token 刷新成功的邏輯
  }
}
```

## 配置建議

### 1. 檢查間隔設定
- **開發環境**: 建議設定較短的間隔（2-3 分鐘）以便測試
- **生產環境**: 建議設定 4-5 分鐘的間隔，平衡效能和及時性

### 2. Token 過期時間設定
- 確保 Token 的過期時間足夠長，避免頻繁刷新
- 建議 Token 有效期至少 15-30 分鐘

### 3. 錯誤處理
- 監聽刷新失敗事件，及時提示用戶重新登入
- 在關鍵操作前檢查 Token 狀態

## 注意事項

1. **記憶體管理**: 記得在組件銷毀時取消訂閱，避免記憶體洩漏
2. **網路狀況**: 在網路不穩定的情況下，刷新可能會失敗
3. **多標籤頁**: 如果應用在多個標籤頁中打開，每個標籤頁都會有自己的刷新機制
4. **伺服器時間**: 確保客戶端和伺服器時間同步，避免時間差導致的問題

## 除錯和監控

### 1. 控制台日誌
自動刷新功能會在控制台輸出詳細的日誌信息：
- Token 檢查狀態
- 刷新成功/失敗信息
- 定時器啟動/停止信息

### 2. Token 狀態檢查
使用 `getTokenStatus()` 方法檢查當前 Token 狀態：

```typescript
const status = this.authService.getTokenStatus();
console.log('Token 狀態:', status);
```

### 3. 手動刷新測試
可以手動調用刷新方法進行測試：

```typescript
const refreshToken = localStorage.getItem('refreshToken');
if (refreshToken) {
  this.authService.refreshToken(refreshToken).subscribe({
    next: (response) => console.log('手動刷新成功'),
    error: (error) => console.error('手動刷新失敗', error)
  });
}
```

## 範例文件

參考 `auth-auto-refresh-example.ts` 文件，其中包含完整的使用範例和最佳實踐。

## 向後兼容性

舊的 `startTokenRefreshTimer()` 方法仍然可用，但已標記為棄用。建議遷移到新的 `startAutoRefresh()` 方法。

```typescript
// 舊方法（已棄用）
this.authService.startTokenRefreshTimer();

// 新方法（推薦）
this.authService.startAutoRefresh();
```