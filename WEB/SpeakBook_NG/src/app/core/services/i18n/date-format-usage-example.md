# DateFormatService 使用說明

## 概述

`DateFormatService` 是一個專門處理日期格式化的服務，它會根據當前語言設定自動調整日期顯示格式。

## 主要功能

1. **自動語言適配**：根據 `LanguageService` 的語言變更自動調整日期格式
2. **多種日期格式**：提供標準日期格式、短日期格式和長日期格式
3. **YYYYMMDD 格式轉換**：專門處理後端常用的 8 位數字日期格式
4. **統一日期處理**：提供統一的日期格式化方法

## 實際使用範例

### 範例 1：基本使用（類似 asset-allocation.component.ts）

```typescript
import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { DateFormatService } from '@core/services/i18n/date-format.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-example',
  template: `
    <!-- 使用 Angular 日期管道 -->
    <div>更新時間: {{ updateTime | date:dateFormat }}</div>
    
    <!-- 使用自定義方法格式化 YYYYMMDD -->
    <div>收穫日期: {{ formatReceiveDate(receiveDate) }}</div>
    
    <!-- 顯示當前日期格式 -->
    <div>當前格式: {{ dateFormat }}</div>
  `
})
export class ExampleComponent implements OnInit, OnDestroy {
  // 用於模板中 date pipe 的格式
  dateFormat: string = 'yyyy/MM/dd';
  
  // 範例數據
  updateTime = new Date();
  receiveDate = '20231225'; // YYYYMMDD 格式
  
  private dateFormatSubscription!: Subscription;

  constructor(
    private dateFormatService: DateFormatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 訂閱日期格式變更
    this.dateFormatSubscription = this.dateFormatService.dateFormat$.subscribe(formatConfig => {
      this.dateFormat = formatConfig.dateFormat;
      this.cdr.detectChanges(); // 觸發 UI 更新
    });
  }

  ngOnDestroy(): void {
    if (this.dateFormatSubscription) {
      this.dateFormatSubscription.unsubscribe();
    }
  }

  // 格式化 YYYYMMDD 字符串
  formatReceiveDate(dateStr: string): string {
    return this.dateFormatService.formatReceiveDate(dateStr);
  }
}
```

### 範例 2：不同語言下的顯示效果

```typescript
// 當語言為中文 (zh-TW) 時：
receiveDate = '20231225'
formatReceiveDate(receiveDate) // 返回: '2023/12/25'
updateTime | date:dateFormat   // 顯示: '2023/12/25'

// 當語言為英文 (en-US) 時：
receiveDate = '20231225'
formatReceiveDate(receiveDate) // 返回: '12/25/2023'
updateTime | date:dateFormat   // 顯示: '12/25/2023'
```

### 範例 3：在服務中使用

```typescript
import { Injectable } from '@angular/core';
import { DateFormatService } from '@core/services/i18n/date-format.service';

@Injectable()
export class DataService {
  constructor(private dateFormatService: DateFormatService) {}

  processData(data: any[]): any[] {
    return data.map(item => ({
      ...item,
      // 格式化 YYYYMMDD 日期
      formattedReceiveDate: this.dateFormatService.formatReceiveDate(item.receiveDate),
      // 格式化一般日期
      formattedUpdateTime: this.dateFormatService.formatDate(item.updateTime)
    }));
  }

  getCurrentFormats() {
    return {
      standard: this.dateFormatService.getCurrentDateFormat(),      // 'yyyy/MM/dd' 或 'MM/dd/yyyy'
      short: this.dateFormatService.getCurrentShortDateFormat(),    // 'MM/dd'
      long: this.dateFormatService.getCurrentLongDateFormat()       // 'yyyy年MM月dd日' 或 'MMMM dd, yyyy'
    };
  }
}
```

## 快速開始指南

### 步驟 1：導入並注入服務

```typescript
import { DateFormatService } from '@core/services/i18n/date-format.service';

@Component({
  selector: 'app-your-component',
  // ...
})
export class YourComponent implements OnInit, OnDestroy {
  dateFormat: string = 'yyyy/MM/dd'; // 用於模板中的 date pipe
  private dateFormatSubscription!: Subscription;

  constructor(
    private dateFormatService: DateFormatService,
    private cdr: ChangeDetectorRef
  ) {}
}
```

### 步驟 2：在 ngOnInit 中訂閱格式變更

```typescript
ngOnInit(): void {
  // 訂閱日期格式變更，當語言切換時自動更新
  this.dateFormatSubscription = this.dateFormatService.dateFormat$.subscribe(formatConfig => {
    this.dateFormat = formatConfig.dateFormat;
    this.cdr.detectChanges(); // 重要：觸發 UI 更新
  });
}
```

### 步驟 3：在 ngOnDestroy 中取消訂閱

```typescript
ngOnDestroy(): void {
  if (this.dateFormatSubscription) {
    this.dateFormatSubscription.unsubscribe();
  }
}
```

### 步驟 4：在組件中使用格式化方法

```typescript
// 格式化後端的 YYYYMMDD 字符串（如：'20231225' → '2023/12/25' 或 '12/25/2023'）
formatReceiveDate(dateStr: string): string {
  return this.dateFormatService.formatReceiveDate(dateStr);
}
```

### 步驟 5：在模板中使用

```html
<!-- 方式 1：使用 Angular 內建的 date pipe -->
<div>更新時間: {{ item.updateTime | date:dateFormat }}</div>

<!-- 方式 2：使用自定義方法處理 YYYYMMDD 格式 -->
<div>收穫日期: {{ formatReceiveDate(item.receiveDate) }}</div>
```

## 完整範例對比

### 使用前（舊方式）
```typescript
export class OldComponent {
  dateFormat: string = 'yyyy/MM/dd';

  ngOnInit(): void {
    // 手動監聽語言變更
    this.languageService.currentLanguage$.subscribe(lang => {
      this.setDateFormat(lang);
      this.cdr.detectChanges();
    });
  }

  private setDateFormat(language: string): void {
    if (language === 'zh-TW') {
      this.dateFormat = 'yyyy/MM/dd';
    } else if (language === 'en-US') {
      this.dateFormat = 'MM/dd/yyyy';
    }
  }

  formatReceiveDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return '';
    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);
    
    if (this.dateFormat === 'MM/dd/yyyy') {
      return `${month}/${day}/${year}`;
    } else {
      return `${year}/${month}/${day}`;
    }
  }
}
```

### 使用後（新方式）
```typescript
export class NewComponent implements OnInit, OnDestroy {
  dateFormat: string = 'yyyy/MM/dd';
  private dateFormatSubscription!: Subscription;

  constructor(
    private dateFormatService: DateFormatService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // 簡單訂閱，自動處理所有語言邏輯
    this.dateFormatSubscription = this.dateFormatService.dateFormat$.subscribe(formatConfig => {
      this.dateFormat = formatConfig.dateFormat;
      this.cdr.detectChanges();
    });
  }

  ngOnDestroy(): void {
    if (this.dateFormatSubscription) {
      this.dateFormatSubscription.unsubscribe();
    }
  }

  // 簡化為一行代碼
  formatReceiveDate(dateStr: string): string {
    return this.dateFormatService.formatReceiveDate(dateStr);
  }
}
```

## 支援的語言格式

| 語言 | 日期格式 | 短日期格式 | 長日期格式 |
|------|----------|------------|------------|
| zh-TW | yyyy/MM/dd | MM/dd | yyyy年MM月dd日 |
| en-US | MM/dd/yyyy | MM/dd | MMMM dd, yyyy |
| ja-JP | yyyy/MM/dd | MM/dd | yyyy年MM月dd日 |

## 方法說明

### getCurrentDateFormat()
獲取當前語言對應的日期格式字符串。

### getCurrentShortDateFormat()
獲取當前語言對應的短日期格式字符串。

### getCurrentLongDateFormat()
獲取當前語言對應的長日期格式字符串。

### formatReceiveDate(dateStr: string)
將 YYYYMMDD 格式的字符串轉換為當前語言對應的日期格式。

**參數：**
- `dateStr`: 8 位數字的日期字符串（如："20231225"）

**返回：**
- 格式化後的日期字符串（如："2023/12/25" 或 "12/25/2023"）

### formatDate(date: any)
將日期對象、字符串或時間戳格式化為標準的 YYYY-MM-DD 格式。

**參數：**
- `date`: Date 對象、日期字符串或時間戳

**返回：**
- YYYY-MM-DD 格式的日期字符串

## 優勢

1. **集中管理**：所有日期格式邏輯集中在一個服務中
2. **自動同步**：語言變更時自動更新所有使用該服務的組件
3. **類型安全**：提供完整的 TypeScript 類型定義
4. **易於維護**：新增語言或修改格式只需修改服務
5. **性能優化**：避免在每個組件中重複實現相同邏輯

## 常見問題與解答

### Q1: 為什麼需要 `this.cdr.detectChanges()`？
**A:** 當語言切換時，Angular 的變更檢測可能不會立即更新 UI。手動觸發變更檢測確保日期格式立即更新。

### Q2: 可以不訂閱 `dateFormat$` 嗎？
**A:** 可以，但這樣語言切換時日期格式不會自動更新。建議訂閱以獲得最佳用戶體驗。

### Q3: `formatReceiveDate` 和 `formatDate` 有什麼區別？
**A:** 
- `formatReceiveDate`: 專門處理 YYYYMMDD 格式字符串（如 '20231225'）
- `formatDate`: 處理 Date 對象、時間戳等一般日期格式

### Q4: 如何添加新的語言支持？
**A:** 在 `DateFormatService` 的 `getDateFormatConfig` 方法中添加新語言的格式配置。

## 遷移檢查清單

從舊的日期格式邏輯遷移到 `DateFormatService` 時，請確認以下項目：

- [ ] 已導入 `DateFormatService`
- [ ] 已在構造函數中注入服務
- [ ] 已移除本地的 `setDateFormat` 方法
- [ ] 已訂閱 `dateFormat$` 來更新 `dateFormat` 屬性
- [ ] 已將 `formatReceiveDate` 方法替換為調用服務方法
- [ ] 已在 `ngOnDestroy` 中取消訂閱
- [ ] 已測試語言切換功能
- [ ] 已確認日期格式在不同語言下正確顯示

## 效益總結

使用 `DateFormatService` 後，你將獲得：

1. **代碼減少 70%**：從 20+ 行日期格式邏輯減少到 1 行
2. **統一管理**：所有日期格式邏輯集中在一個地方
3. **自動同步**：語言切換時所有組件自動更新
4. **易於維護**：新增語言或修改格式只需修改服務
5. **類型安全**：完整的 TypeScript 支持