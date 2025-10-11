# HttpErrorHandlerService 使用範例

## 概述

`HttpErrorHandlerService` 是一個統一的 HTTP 錯誤處理服務，用於處理 Angular 應用中的 HTTP 錯誤並顯示用戶友好的錯誤訊息。

## 基本使用方法

### 1. 導入服務

```typescript
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
```

### 2. 注入服務

```typescript
constructor(
  private httpErrorHandler: HttpErrorHandlerService
) {}
```

## 使用場景

### 場景 1: 組件中的錯誤處理

```typescript
// 在組件中處理 HTTP 錯誤
addDepartment() {
  this.departmentService.createDepartment(departmentData)
    .subscribe({
      next: (response) => {
        // 處理成功回應
        this.snackBar.open('新增部門成功', '', { duration: 3000 });
      },
      error: (error) => {
        // 使用 HttpErrorHandlerService 處理錯誤
        this.httpErrorHandler.handleError(error, '新增部門失敗');
      }
    });
}
```

### 場景 2: 服務中的錯誤處理

```typescript
// 在服務中使用 handleErrorWithObservable
getDepartments(): Observable<Department[]> {
  return this.http.get<Department[]>('/api/departments')
    .pipe(
      catchError(error => 
        this.httpErrorHandler.handleErrorWithObservable(error, '載入部門資料失敗')
      )
    );
}
```

### 場景 3: 不顯示 SnackBar 的錯誤處理

```typescript
// 只記錄錯誤，不顯示 SnackBar
validateData() {
  this.dataService.validate(data)
    .subscribe({
      error: (error) => {
        this.httpErrorHandler.handleError(error, '資料驗證失敗', false);
        // 自定義錯誤處理邏輯
        this.showCustomErrorDialog();
      }
    });
}
```

## 錯誤類型檢查

### 檢查特定錯誤類型

```typescript
// 檢查是否為伺服器錯誤 (5xx)
if (this.httpErrorHandler.isServerError(error)) {
  console.log('這是伺服器錯誤');
}

// 檢查是否為客戶端錯誤 (4xx)
if (this.httpErrorHandler.isClientError(error)) {
  console.log('這是客戶端錯誤');
}

// 檢查是否為網路錯誤
if (this.httpErrorHandler.isNetworkError(error)) {
  console.log('這是網路連線錯誤');
}
```

## 支援的 HTTP 狀態碼

| 狀態碼 | 錯誤訊息 |
|--------|----------|
| 0 | 網路連線失敗，請檢查網路連線 |
| 400 | 請求格式錯誤，請檢查輸入資料 |
| 401 | 未授權，請重新登入 |
| 403 | 權限不足，無法執行此操作 |
| 404 | 找不到請求的資源 |
| 409 | 資料衝突，請重新整理後再試 |
| 422 | 資料驗證失敗，請檢查輸入內容 |
| 429 | 請求過於頻繁，請稍後再試 |
| 500 | 伺服器內部錯誤，請稍後再試 |
| 502 | 伺服器暫時無法回應，請稍後再試 |
| 503 | 服務暫時無法使用，請稍後再試 |
| 504 | 伺服器回應逾時，請稍後再試 |
| 其他 | 發生未知錯誤，請稍後再試 |

## 完整範例

### department-info.component.ts

```typescript
import { Component } from '@angular/core';
import { HttpErrorHandlerService } from '@shared/services/http-error-handler.service';
import { DepartmentService } from '../../../@services/department.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-department-info',
  templateUrl: './department-info.component.html'
})
export class DepartmentInfoComponent {
  
  constructor(
    private departmentService: DepartmentService,
    private httpErrorHandler: HttpErrorHandlerService,
    private snackBar: MatSnackBar
  ) {}

  // 新增部門
  addDepartment(departmentData: any) {
    this.departmentService.createDepartment(departmentData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('新增部門成功', '', { duration: 3000 });
          this.loadDepartments();
        },
        error: (error) => {
          this.httpErrorHandler.handleError(error, '新增部門失敗');
        }
      });
  }

  // 更新部門
  updateDepartment(id: number, departmentData: any) {
    this.departmentService.updateDepartment(id, departmentData)
      .subscribe({
        next: (response) => {
          this.snackBar.open('更新部門成功', '', { duration: 3000 });
          this.loadDepartments();
        },
        error: (error) => {
          this.httpErrorHandler.handleError(error, '更新部門失敗');
        }
      });
  }

  // 刪除部門
  deleteDepartment(id: number) {
    this.departmentService.deleteDepartment(id)
      .subscribe({
        next: (response) => {
          this.snackBar.open('刪除部門成功', '', { duration: 3000 });
          this.loadDepartments();
        },
        error: (error) => {
          this.httpErrorHandler.handleError(error, '刪除部門失敗');
        }
      });
  }

  // 載入部門列表
  loadDepartments() {
    this.departmentService.getDepartments()
      .subscribe({
        next: (departments) => {
          this.departments = departments;
        },
        error: (error) => {
          this.httpErrorHandler.handleError(error, '載入部門資料失敗');
        }
      });
  }
}
```

## 注意事項

1. **操作描述**: 第二個參數 `operation` 用於描述失敗的操作，會顯示在錯誤訊息前面
2. **SnackBar 控制**: 第三個參數 `showSnackBar` 預設為 `true`，設為 `false` 可以只記錄錯誤而不顯示 SnackBar
3. **錯誤記錄**: 所有錯誤都會在控制台記錄詳細資訊，方便開發調試
4. **Observable 處理**: 在服務中使用 `handleErrorWithObservable` 方法，會返回一個包含空陣列的 Observable

## 最佳實踐

1. **統一錯誤處理**: 在整個應用中使用相同的錯誤處理方式
2. **有意義的操作描述**: 提供清楚的操作描述，幫助用戶理解發生了什麼錯誤
3. **適當的錯誤分類**: 根據不同的錯誤類型採取不同的處理策略
4. **用戶體驗**: 避免顯示技術性錯誤訊息，提供用戶友好的錯誤提示
