package com.example.speakbook_backend.service;

import com.example.speakbook_backend.converter.BookConverter;
import com.example.speakbook_backend.dto.BookDTO;
import com.example.speakbook_backend.entity.Book;
import com.example.speakbook_backend.repository.BookRepository;
import com.example.speakbook_backend.repository.HotspotRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookServiceImpl implements BookService {

    @Autowired
    private BookRepository bookRepository;

    @Autowired
    private HotspotRepository hotspotRepository;

    @Override
    @Transactional
    public Long createBook(BookDTO bookDTO) {
        // 驗證必填欄位
        validateBookDTO(bookDTO);

        // 設置狀態為已發布
        bookDTO.setStatus("published");
        bookDTO.setPublishedAt(LocalDateTime.now());

        // 轉換並保存
        Book book = BookConverter.convertToEntity(bookDTO);
        Book savedBook = bookRepository.save(book);

        return savedBook.getId();
    }

    @Override
    @Transactional
    public Long saveDraft(BookDTO bookDTO) {
        // 設置狀態為草稿
        bookDTO.setStatus("draft");

        // 轉換並保存
        Book book = BookConverter.convertToEntity(bookDTO);
        Book savedBook = bookRepository.save(book);

        return savedBook.getId();
    }

    @Override
    @Transactional
    public Long updateBook(Long id, BookDTO bookDTO) {
        // 查找現有教材
        Book existingBook = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("教材不存在，ID: " + id));

        // 刪除舊的熱區
        hotspotRepository.deleteByBookId(id);

        // 更新教材信息
        existingBook.setTitle(bookDTO.getTitle());
        existingBook.setAuthor(bookDTO.getAuthor());
        existingBook.setDescription(bookDTO.getDescription());
        existingBook.setCategory(bookDTO.getCategory());
        existingBook.setPages(bookDTO.getPages());
        existingBook.setTargetAge(bookDTO.getTargetAge());
        existingBook.setDifficulty(bookDTO.getDifficulty());
        existingBook.setCoverImageUrl(bookDTO.getCoverImageUrl());
        existingBook.setStatus(bookDTO.getStatus());

        // 如果狀態改為已發布，設置發布時間
        if ("published".equals(bookDTO.getStatus()) && existingBook.getPublishedAt() == null) {
            existingBook.setPublishedAt(LocalDateTime.now());
        }

        // 清空舊的熱區列表
        existingBook.getHotspots().clear();

        // 添加新的熱區
        if (bookDTO.getHotspots() != null) {
            bookDTO.getHotspots().forEach(hotspotDTO -> {
                existingBook.addHotspot(BookConverter.convertHotspotToEntity(hotspotDTO));
            });
        }

        // 保存更新
        Book updatedBook = bookRepository.save(existingBook);

        return updatedBook.getId();
    }

    @Override
    public BookDTO getBookById(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("教材不存在，ID: " + id));

        return BookConverter.convertToDTO(book);
    }

    @Override
    public List<BookDTO> getAllPublishedBooks() {
        List<Book> books = bookRepository.findByStatus("published");
        return books.stream()
                .map(BookConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public List<BookDTO> getBooksByCategory(String category) {
        List<Book> books = bookRepository.findByStatusAndCategory("published", category);
        return books.stream()
                .map(BookConverter::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteBook(Long id) {
        Book book = bookRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("教材不存在，ID: " + id));

        bookRepository.delete(book);
    }

    /**
     * 驗證教材數據
     */
    private void validateBookDTO(BookDTO bookDTO) {
        if (bookDTO.getTitle() == null || bookDTO.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("教材標題不能為空");
        }

        if (bookDTO.getCoverImageUrl() == null || bookDTO.getCoverImageUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("封面圖片URL不能為空");
        }

        if (bookDTO.getCategory() == null || bookDTO.getCategory().trim().isEmpty()) {
            throw new IllegalArgumentException("分類不能為空");
        }
    }
}
