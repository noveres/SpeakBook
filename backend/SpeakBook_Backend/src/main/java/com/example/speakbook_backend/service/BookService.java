package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.BookDTO;
import com.example.speakbook_backend.dto.PageRequest;
import com.example.speakbook_backend.dto.PageResponse;

import java.util.List;

public interface BookService {

    /**
     * 創建教材（發布）
     */
    Long createBook(BookDTO bookDTO);

    /**
     * 儲存草稿
     */
    Long saveDraft(BookDTO bookDTO);

    /**
     * 更新教材
     */
    Long updateBook(Long id, BookDTO bookDTO);

    /**
     * 獲取教材詳情
     */
    BookDTO getBookById(Long id);

    /**
     * 獲取所有已發布的教材
     */
    List<BookDTO> getAllPublishedBooks();

    /**
     * 根據分類獲取教材
     */
    List<BookDTO> getBooksByCategory(String category);

    /**
     * 刪除教材
     */
    void deleteBook(Long id);

    /**
     * 分頁查詢已發布的教材
     */
    PageResponse<BookDTO> getPublishedBooksWithPagination(PageRequest pageRequest);
}
