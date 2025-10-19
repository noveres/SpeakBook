package com.example.speakbook_backend.repository;

import com.example.speakbook_backend.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    List<Book> findByStatus(String status);
    
    List<Book> findByCategory(String category);
    
    List<Book> findByStatusAndCategory(String status, String category);

    /**
     * 分頁查詢已發布的教材
     */
    Page<Book> findByStatus(String status, Pageable pageable);

    /**
     * 分頁查詢已發布的教材（支援搜尋）
     */
    @Query("SELECT b FROM Book b WHERE b.status = :status " +
           "AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.author) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(b.description) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    Page<Book> findByStatusAndKeyword(@Param("status") String status, 
                                      @Param("keyword") String keyword, 
                                      Pageable pageable);
}
