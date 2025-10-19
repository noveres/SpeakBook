package com.example.speakbook_backend.repository;

import com.example.speakbook_backend.entity.Hotspot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface HotspotRepository extends JpaRepository<Hotspot, Long> {
    
    List<Hotspot> findByBookId(Long bookId);
    
    void deleteByBookId(Long bookId);
}
