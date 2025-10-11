import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LanguageService, SupportedLanguage } from './language.service';

export interface DateFormatConfig {
  dateFormat: string;
  shortDateFormat: string;
  longDateFormat: string;
}

@Injectable({
  providedIn: 'root'
})
export class DateFormatService {
  private dateFormatSubject = new BehaviorSubject<DateFormatConfig>(this.getDateFormatConfig('zh-TW'));
  public dateFormat$: Observable<DateFormatConfig> = this.dateFormatSubject.asObservable();

  constructor(private languageService: LanguageService) {
    // 訂閱語言變更，自動更新日期格式
    this.languageService.currentLanguage$.subscribe(language => {
      const formatConfig = this.getDateFormatConfig(language);
      this.dateFormatSubject.next(formatConfig);
    });
  }

  /**
   * 根據語言獲取日期格式配置
   */
  private getDateFormatConfig(language: SupportedLanguage): DateFormatConfig {
    switch (language) {
      case 'zh-TW':
        return {
          dateFormat: 'yyyy/MM/dd',
          shortDateFormat: 'MM/dd',
          longDateFormat: 'yyyy年MM月dd日'
        };
      case 'en-US':
        return {
          dateFormat: 'MM/dd/yyyy',
          shortDateFormat: 'MM/dd',
          longDateFormat: 'MMMM dd, yyyy'
        };
      case 'ja-JP':
        return {
          dateFormat: 'yyyy/MM/dd',
          shortDateFormat: 'MM/dd',
          longDateFormat: 'yyyy年MM月dd日'
        };
      default:
        return {
          dateFormat: 'yyyy/MM/dd',
          shortDateFormat: 'MM/dd',
          longDateFormat: 'yyyy年MM月dd日'
        };
    }
  }

  /**
   * 獲取當前日期格式
   */
  getCurrentDateFormat(): string {
    return this.dateFormatSubject.value.dateFormat;
  }

  /**
   * 獲取當前短日期格式
   */
  getCurrentShortDateFormat(): string {
    return this.dateFormatSubject.value.shortDateFormat;
  }

  /**
   * 獲取當前長日期格式
   */
  getCurrentLongDateFormat(): string {
    return this.dateFormatSubject.value.longDateFormat;
  }

  /**
   * 格式化 YYYYMMDD 字符串為顯示格式
   * @param dateStr YYYYMMDD 格式的日期字符串
   * @returns 格式化後的日期字符串
   */
  formatReceiveDate(dateStr: string): string {
    if (!dateStr || dateStr.length !== 8) return '';

    // 檢查是否為純數字
    if (!/^\d{8}$/.test(dateStr)) return dateStr;

    const year = dateStr.substring(0, 4);
    const month = dateStr.substring(4, 6);
    const day = dateStr.substring(6, 8);

    const currentFormat = this.getCurrentDateFormat();
    
    // 根據當前語言設定的日期格式來顯示
    if (currentFormat === 'MM/dd/yyyy') {
      return `${month}/${day}/${year}`;
    } else {
      return `${year}/${month}/${day}`;
    }
  }

  /**
   * 格式化日期對象或字符串為標準格式
   * @param date 日期對象、字符串或時間戳
   * @returns YYYY-MM-DD 格式的日期字符串
   */
  formatDate(date: any): string {
    if (!date) return '';

    let dateObj: Date;

    if (date instanceof Date) {
      dateObj = date;
    } else if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (typeof date === 'number') {
      dateObj = new Date(date);
    } else {
      return '';
    }

    if (isNaN(dateObj.getTime())) return '';

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }
}