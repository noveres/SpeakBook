/**
 * 通用分頁請求接口
 */
export interface PageRequest {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortDirection?: 'ASC' | 'DESC';
  searchKeyword?: string;
}

/**
 * 通用分頁響應接口
 */
export interface PageResponse<T> {
  content: T[];
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

/**
 * 分頁請求建構器
 * 方便快速建立分頁請求
 */
export class PageRequestBuilder {
  private request: PageRequest = {
    page: 1,
    pageSize: 10,
    sortDirection: 'DESC'
  };

  static create(): PageRequestBuilder {
    return new PageRequestBuilder();
  }

  page(page: number): PageRequestBuilder {
    this.request.page = page;
    return this;
  }

  pageSize(pageSize: number): PageRequestBuilder {
    this.request.pageSize = pageSize;
    return this;
  }

  sortBy(sortBy: string): PageRequestBuilder {
    this.request.sortBy = sortBy;
    return this;
  }

  sortDirection(direction: 'ASC' | 'DESC'): PageRequestBuilder {
    this.request.sortDirection = direction;
    return this;
  }

  searchKeyword(keyword: string): PageRequestBuilder {
    this.request.searchKeyword = keyword;
    return this;
  }

  build(): PageRequest {
    return this.request;
  }
}
