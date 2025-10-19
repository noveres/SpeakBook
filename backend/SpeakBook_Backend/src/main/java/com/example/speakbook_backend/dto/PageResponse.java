package com.example.speakbook_backend.dto;

import java.util.List;

/**
 * 通用分頁響應 DTO
 * @param <T> 數據類型
 */
public class PageResponse<T> {
    private List<T> content;          // 當前頁數據
    private int currentPage;          // 當前頁碼（從1開始）
    private int pageSize;             // 每頁大小
    private long totalElements;       // 總記錄數
    private int totalPages;           // 總頁數
    private boolean first;            // 是否第一頁
    private boolean last;             // 是否最後一頁
    private boolean empty;            // 是否為空

    public PageResponse() {
    }

    public PageResponse(List<T> content, int currentPage, int pageSize, long totalElements) {
        this.content = content;
        this.currentPage = currentPage;
        this.pageSize = pageSize;
        this.totalElements = totalElements;
        this.totalPages = (int) Math.ceil((double) totalElements / pageSize);
        this.first = currentPage == 1;
        this.last = currentPage >= totalPages;
        this.empty = content == null || content.isEmpty();
    }

    // Getters and Setters
    public List<T> getContent() {
        return content;
    }

    public void setContent(List<T> content) {
        this.content = content;
    }

    public int getCurrentPage() {
        return currentPage;
    }

    public void setCurrentPage(int currentPage) {
        this.currentPage = currentPage;
    }

    public int getPageSize() {
        return pageSize;
    }

    public void setPageSize(int pageSize) {
        this.pageSize = pageSize;
    }

    public long getTotalElements() {
        return totalElements;
    }

    public void setTotalElements(long totalElements) {
        this.totalElements = totalElements;
    }

    public int getTotalPages() {
        return totalPages;
    }

    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }

    public boolean isFirst() {
        return first;
    }

    public void setFirst(boolean first) {
        this.first = first;
    }

    public boolean isLast() {
        return last;
    }

    public void setLast(boolean last) {
        this.last = last;
    }

    public boolean isEmpty() {
        return empty;
    }

    public void setEmpty(boolean empty) {
        this.empty = empty;
    }
}
