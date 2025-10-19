import { Injectable } from '@angular/core';
import { Observable, forkJoin, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ApiService } from './api.service';

/**
 * 排序方向枚舉
 */
export enum SortDirection {
  Asc = 'Asc',
  Desc = 'Desc'
}

/**
 * 搜尋操作符枚舉
 */
export enum SearchOperator {
  Equal = 'Equal',
  Contains = 'Contains',
  StartsWith = 'StartsWith',
  EndsWith = 'EndsWith',
  GreaterThan = 'GreaterThan',
  LessThan = 'LessThan',
  GreaterThanOrEqual = 'GreaterThanOrEqual',
  LessThanOrEqual = 'LessThanOrEqual',
  NotEqual = 'NotEqual'
}

/**
 * 搜尋條件介面
 */
export interface SearchCondition {
  FieldName: string;
  Value: any;
  Operator: SearchOperator;
}

/**
 * 排序選項介面
 */
export interface SortOption {
  FieldName: string;
  Direction: SortDirection;
}

/**
 * 分頁查詢請求介面
 */
export interface PaginatedQueryRequest {
  Page: number;
  PageSize: number;
  SortOptions: SortOption[];
  SearchConditions: SearchCondition[];
}

/**
 * 分頁查詢響應介面
 */
export interface PaginatedQueryResponse<T> {
  data: T[];
  total: number;
  currentPage?: number;
  pageSize?: number;
  totalPages?: number;
}

/**
 * 多欄位搜尋配置介面
 */
export interface MultiFieldSearchConfig {
  fieldName: string;
  searchTerm: string;
  operator?: SearchOperator;
}

/**
 * 通用查詢與分頁服務
 * 封裝常見的分頁查詢、多欄位搜尋等模式
 */
@Injectable({
  providedIn: 'root'
})
export class QueryPaginationService {

  constructor(private apiService: ApiService) {}

  /**
   * 執行標準分頁查詢
   * @param url API端點
   * @param page 頁碼（從1開始）
   * @param pageSize 每頁筆數
   * @param sortField 排序欄位
   * @param sortDirection 排序方向
   * @param searchConditions 搜尋條件陣列
   * @param operation 操作描述
   * @returns Observable<PaginatedQueryResponse<T>>
   */
  executeStandardPaginatedQuery<T>(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'Id',
    sortDirection: SortDirection = SortDirection.Asc,
    searchConditions: SearchCondition[] = [],
    operation: string = '分頁查詢'
  ): Observable<PaginatedQueryResponse<T>> {
    const queryRequest: PaginatedQueryRequest = {
      Page: page,
      PageSize: pageSize,
      SortOptions: [{
        FieldName: sortField,
        Direction: sortDirection
      }],
      SearchConditions: searchConditions
    };

    return this.apiService.post<any>(url, queryRequest, operation).pipe(
      map(response => {
        if (Array.isArray(response)) {
          return {
            data: response,
            total: response.length,
            currentPage: page,
            pageSize: pageSize,
            totalPages: Math.ceil(response.length / pageSize)
          };
        }
        
        const data = response.data || response.resultObject || response || [];
        const total = response.total || response.totalDataCount || response.totalCount || data.length;
        
        return {
          data: data,
          total: total,
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(total / pageSize)
        };
      }),
      catchError(error => {
        console.error(`${operation} 錯誤:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 執行多欄位搜尋查詢（使用 forkJoin 合併結果）
   * @param url API端點
   * @param page 頁碼
   * @param pageSize 每頁筆數
   * @param sortField 排序欄位
   * @param sortDirection 排序方向
   * @param searchConfigs 多欄位搜尋配置陣列
   * @param operation 操作描述
   * @returns Observable<PaginatedQueryResponse<T>>
   */
  executeMultiFieldSearch<T>(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'Id',
    sortDirection: SortDirection = SortDirection.Asc,
    searchConfigs: MultiFieldSearchConfig[],
    operation: string = '多欄位搜尋'
  ): Observable<PaginatedQueryResponse<T>> {
    if (!searchConfigs || searchConfigs.length === 0) {
      return this.executeStandardPaginatedQuery<T>(url, page, pageSize, sortField, sortDirection, [], operation);
    }

    // 為每個搜尋欄位建立查詢請求
    const searchRequests = searchConfigs.map(config => {
      const searchConditions: SearchCondition[] = [{
        FieldName: config.fieldName,
        Value: config.searchTerm.trim(),
        Operator: config.operator || SearchOperator.Contains
      }];

      const queryRequest: PaginatedQueryRequest = {
        Page: page,
        PageSize: pageSize,
        SortOptions: [{
          FieldName: sortField,
          Direction: sortDirection
        }],
        SearchConditions: searchConditions
      };

      return this.apiService.post<any>(url, queryRequest, `${operation} - ${config.fieldName}`);
    });

    // 使用 forkJoin 並行執行所有搜尋請求
    return forkJoin(searchRequests).pipe(
      map(responses => {
        const allResults = new Map<string, T>();
        let maxTotal = 0;

        // 合併所有響應結果，使用 Map 去重（假設每個項目都有 id 屬性）
        responses.forEach(response => {
          const data = response.data || response.resultObject || response || [];
          const total = response.total || response.totalDataCount || response.totalCount || data.length;
          
          maxTotal = Math.max(maxTotal, total);
          
          data.forEach((item: any) => {
            if (item && item.id) {
              allResults.set(item.id, item);
            } else if (item && item.Id) {
              allResults.set(item.Id, item);
            } else {
              // 如果沒有明確的ID，使用物件的字串表示作為key（較不理想的方案）
              allResults.set(JSON.stringify(item), item);
            }
          });
        });

        const mergedData = Array.from(allResults.values());
        
        return {
          data: mergedData,
          total: Math.max(maxTotal, mergedData.length),
          currentPage: page,
          pageSize: pageSize,
          totalPages: Math.ceil(Math.max(maxTotal, mergedData.length) / pageSize)
        };
      }),
      catchError(error => {
        console.error(`${operation} 錯誤:`, error);
        return throwError(() => error);
      })
    );
  }

  /**
   * 建立搜尋條件
   * @param fieldName 欄位名稱
   * @param value 搜尋值
   * @param operator 操作符
   * @returns SearchCondition
   */
  createSearchCondition(
    fieldName: string, 
    value: any, 
    operator: SearchOperator = SearchOperator.Contains
  ): SearchCondition {
    return {
      FieldName: fieldName,
      Value: value,
      Operator: operator
    };
  }

  /**
   * 建立排序選項
   * @param fieldName 欄位名稱
   * @param direction 排序方向
   * @returns SortOption
   */
  createSortOption(
    fieldName: string, 
    direction: SortDirection = SortDirection.Asc
  ): SortOption {
    return {
      FieldName: fieldName,
      Direction: direction
    };
  }

  /**
   * 建立多欄位搜尋配置
   * @param fieldName 欄位名稱
   * @param searchTerm 搜尋關鍵字
   * @param operator 操作符
   * @returns MultiFieldSearchConfig
   */
  createMultiFieldSearchConfig(
    fieldName: string,
    searchTerm: string,
    operator: SearchOperator = SearchOperator.Contains
  ): MultiFieldSearchConfig {
    return {
      fieldName,
      searchTerm,
      operator
    };
  }

  /**
   * 執行簡單文字搜尋（在單一欄位中搜尋）
   * @param url API端點
   * @param fieldName 搜尋欄位
   * @param searchTerm 搜尋關鍵字
   * @param page 頁碼
   * @param pageSize 每頁筆數
   * @param sortField 排序欄位
   * @param sortDirection 排序方向
   * @param operation 操作描述
   * @returns Observable<PaginatedQueryResponse<T>>
   */
  executeSimpleTextSearch<T>(
    url: string,
    fieldName: string,
    searchTerm: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'Id',
    sortDirection: SortDirection = SortDirection.Asc,
    operation: string = '文字搜尋'
  ): Observable<PaginatedQueryResponse<T>> {
    const searchConditions: SearchCondition[] = searchTerm.trim() ? [{
      FieldName: fieldName,
      Value: searchTerm.trim(),
      Operator: SearchOperator.Contains
    }] : [];

    return this.executeStandardPaginatedQuery<T>(
      url, page, pageSize, sortField, sortDirection, searchConditions, operation
    );
  }

  /**
   * 執行空搜尋（獲取所有資料）
   * @param url API端點
   * @param page 頁碼
   * @param pageSize 每頁筆數
   * @param sortField 排序欄位
   * @param sortDirection 排序方向
   * @param operation 操作描述
   * @returns Observable<PaginatedQueryResponse<T>>
   */
  executeEmptySearch<T>(
    url: string,
    page: number = 1,
    pageSize: number = 10,
    sortField: string = 'Id',
    sortDirection: SortDirection = SortDirection.Asc,
    operation: string = '獲取所有資料'
  ): Observable<PaginatedQueryResponse<T>> {
    return this.executeStandardPaginatedQuery<T>(
      url, page, pageSize, sortField, sortDirection, [], operation
    );
  }

  /**
   * 轉換前端排序方向為後端格式
   * @param direction 前端排序方向 ('asc' | 'desc')
   * @returns SortDirection
   */
  convertSortDirection(direction: 'asc' | 'desc' | string): SortDirection {
    return direction.toLowerCase() === 'desc' ? SortDirection.Desc : SortDirection.Asc;
  }

  /**
   * 建立範圍搜尋條件（用於數字或日期範圍）
   * @param fieldName 欄位名稱
   * @param minValue 最小值
   * @param maxValue 最大值
   * @returns SearchCondition[]
   */
  createRangeSearchConditions(
    fieldName: string,
    minValue?: any,
    maxValue?: any
  ): SearchCondition[] {
    const conditions: SearchCondition[] = [];
    
    if (minValue !== undefined && minValue !== null) {
      conditions.push({
        FieldName: fieldName,
        Value: minValue,
        Operator: SearchOperator.GreaterThanOrEqual
      });
    }
    
    if (maxValue !== undefined && maxValue !== null) {
      conditions.push({
        FieldName: fieldName,
        Value: maxValue,
        Operator: SearchOperator.LessThanOrEqual
      });
    }
    
    return conditions;
  }
}