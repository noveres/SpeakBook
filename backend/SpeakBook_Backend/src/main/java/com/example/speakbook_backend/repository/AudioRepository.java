package com.example.speakbook_backend.repository;

import com.example.speakbook_backend.entity.Audio;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AudioRepository extends JpaRepository<Audio, Long> {
    
    /**
     * 根據分類查詢音訊
     */
    List<Audio> findByCategory(String category);
    
    /**
     * 分頁查詢所有音訊
     */
    Page<Audio> findAll(Pageable pageable);

    /**
     * 分頁查詢音訊（支援搜尋）
     */
    @Query("SELECT a FROM Audio a WHERE " +
           "LOWER(a.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(a.category) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    Page<Audio> findByKeyword(@Param("keyword") String keyword, Pageable pageable);

    /**
     * 根據分類分頁查詢
     */
    Page<Audio> findByCategory(String category, Pageable pageable);
}
