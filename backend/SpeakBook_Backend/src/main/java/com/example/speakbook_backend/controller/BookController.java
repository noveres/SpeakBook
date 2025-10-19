package com.example.speakbook_backend.controller;

import com.example.speakbook_backend.Response;
import com.example.speakbook_backend.dto.BookDTO;
import com.example.speakbook_backend.dto.PageRequest;
import com.example.speakbook_backend.dto.PageResponse;
import com.example.speakbook_backend.service.BookService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/books")
@CrossOrigin(origins = "*")
public class BookController {

    @Autowired
    private BookService bookService;

    /**
     * 創建教材（發布）
     * POST /api/books
     */
    @PostMapping
    public Response<BookDTO> createBook(@RequestBody BookDTO bookDTO) {
        try {
            Long bookId = bookService.createBook(bookDTO);
            BookDTO createdBook = bookService.getBookById(bookId);
            return Response.newSuccess(createdBook);
        } catch (IllegalArgumentException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("創建教材失敗：" + e.getMessage());
        }
    }

    /**
     * 儲存草稿
     * POST /api/books/draft
     */
    @PostMapping("/draft")
    public Response<BookDTO> saveDraft(@RequestBody BookDTO bookDTO) {
        try {
            Long bookId = bookService.saveDraft(bookDTO);
            BookDTO savedBook = bookService.getBookById(bookId);
            return Response.newSuccess(savedBook);
        } catch (Exception e) {
            return Response.newFail("儲存草稿失敗：" + e.getMessage());
        }
    }

    /**
     * 更新教材
     * PUT /api/books/{id}
     */
    @PutMapping("/{id}")
    public Response<BookDTO> updateBook(@PathVariable Long id, @RequestBody BookDTO bookDTO) {
        try {
            Long bookId = bookService.updateBook(id, bookDTO);
            BookDTO updatedBook = bookService.getBookById(bookId);
            return Response.newSuccess(updatedBook);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("更新教材失敗：" + e.getMessage());
        }
    }

    /**
     * 獲取教材詳情
     * GET /api/books/{id}
     */
    @GetMapping("/{id}")
    public Response<BookDTO> getBook(@PathVariable Long id) {
        try {
            BookDTO book = bookService.getBookById(id);
            return Response.newSuccess(book);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("獲取教材失敗：" + e.getMessage());
        }
    }

    /**
     * 獲取所有已發布的教材
     * GET /api/books
     */
    @GetMapping
    public Response<List<BookDTO>> getAllPublishedBooks() {
        try {
            List<BookDTO> books = bookService.getAllPublishedBooks();
            return Response.newSuccess(books);
        } catch (Exception e) {
            return Response.newFail("獲取教材列表失敗：" + e.getMessage());
        }
    }

    /**
     * 根據分類獲取教材
     * GET /api/books/category/{category}
     */
    @GetMapping("/category/{category}")
    public Response<List<BookDTO>> getBooksByCategory(@PathVariable String category) {
        try {
            List<BookDTO> books = bookService.getBooksByCategory(category);
            return Response.newSuccess(books);
        } catch (Exception e) {
            return Response.newFail("獲取教材列表失敗：" + e.getMessage());
        }
    }

    /**
     * 刪除教材
     * DELETE /api/books/{id}
     */
    @DeleteMapping("/{id}")
    public Response<Void> deleteBook(@PathVariable Long id) {
        try {
            bookService.deleteBook(id);
            return Response.newSuccess(null);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("刪除教材失敗：" + e.getMessage());
        }
    }

    /**
     * 分頁查詢已發布的教材
     * GET /api/books/page
     * @param page 頁碼（從1開始）
     * @param pageSize 每頁大小
     * @param sortBy 排序欄位
     * @param sortDirection 排序方向（ASC/DESC）
     * @param searchKeyword 搜尋關鍵字
     */
    @GetMapping("/page")
    public Response<PageResponse<BookDTO>> getBooksWithPagination(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection,
            @RequestParam(required = false) String searchKeyword) {
        try {
            PageRequest pageRequest = new PageRequest();
            pageRequest.setPage(page);
            pageRequest.setPageSize(pageSize);
            pageRequest.setSortBy(sortBy);
            pageRequest.setSortDirection(sortDirection);
            pageRequest.setSearchKeyword(searchKeyword);

            PageResponse<BookDTO> result = bookService.getPublishedBooksWithPagination(pageRequest);
            return Response.newSuccess(result);
        } catch (Exception e) {
            return Response.newFail("獲取教材列表失敗：" + e.getMessage());
        }
    }
}
