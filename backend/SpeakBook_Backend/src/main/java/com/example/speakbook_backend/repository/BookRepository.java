package com.example.speakbook_backend.repository;

import com.example.speakbook_backend.entity.Book;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    
    List<Book> findByStatus(String status);
    
    List<Book> findByCategory(String category);
    
    List<Book> findByStatusAndCategory(String status, String category);
}
