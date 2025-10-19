package com.example.speakbook_backend.dto;

/**
 * 通用分頁請求參數
 */
public class PageRequest {
    private int page = 1;              // 當前頁碼（從1開始）
    private int pageSize = 10;         // 每頁大小
    private String sortBy;             // 排序欄位
    private String sortDirection = "DESC"; // 排序方向：ASC 或 DESC
    private String searchKeyword;      // 搜尋關鍵字

    public PageRequest() {
    }

    public PageRequest(int page, int pageSize) {
        this.page = page;
        this.pageSize = pageSize;
    }

    // Getters and Setters
    public int getPage() {
        return page;
    }

    public void setPage(int page) {
        this.page = Math.max(1, page); // 確保頁碼至少為1
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = Math.max(1, Math.min(pageSize, 100)); // 限制在1-100之間
    }

    public String getSortBy() {
        return sortBy;
    }

    public void setSortBy(String sortBy) {
        this.sortBy = sortBy;
    }

    public String getSortDirection() {
        return sortDirection;
    }

    public void setSortDirection(String sortDirection) {
        this.sortDirection = sortDirection;
    }

    public String getSearchKeyword() {
        return searchKeyword;
    }

    public void setSearchKeyword(String searchKeyword) {
        this.searchKeyword = searchKeyword;
    }

    /**
     * 計算偏移量（用於 SQL LIMIT OFFSET）
     */
    public int getOffset() {
        return (page - 1) * pageSize;
    }
}
