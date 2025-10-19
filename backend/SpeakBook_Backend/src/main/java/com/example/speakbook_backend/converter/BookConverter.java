package com.example.speakbook_backend.converter;

import com.example.speakbook_backend.dto.BookDTO;
import com.example.speakbook_backend.dto.HotspotDTO;
import com.example.speakbook_backend.entity.Book;
import com.example.speakbook_backend.entity.Hotspot;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

public class BookConverter {

    public static BookDTO convertToDTO(Book book) {
        if (book == null) {
            return null;
        }

        BookDTO dto = new BookDTO();
        dto.setId(book.getId());
        dto.setTitle(book.getTitle());
        dto.setAuthor(book.getAuthor());
        dto.setDescription(book.getDescription());
        dto.setCategory(book.getCategory());
        dto.setPages(book.getPages());
        dto.setTargetAge(book.getTargetAge());
        dto.setDifficulty(book.getDifficulty());
        dto.setCoverImageUrl(book.getCoverImageUrl());
        dto.setStatus(book.getStatus());
        dto.setCreatedAt(book.getCreatedAt());
        dto.setUpdatedAt(book.getUpdatedAt());
        dto.setPublishedAt(book.getPublishedAt());

        // 轉換熱區
        if (book.getHotspots() != null) {
            List<HotspotDTO> hotspotDTOs = book.getHotspots().stream()
                    .map(BookConverter::convertHotspotToDTO)
                    .collect(Collectors.toList());
            dto.setHotspots(hotspotDTOs);
        }

        return dto;
    }

    public static Book convertToEntity(BookDTO dto) {
        if (dto == null) {
            return null;
        }

        Book book = new Book();
        book.setId(dto.getId());
        book.setTitle(dto.getTitle());
        book.setAuthor(dto.getAuthor());
        book.setDescription(dto.getDescription());
        book.setCategory(dto.getCategory());
        book.setPages(dto.getPages());
        book.setTargetAge(dto.getTargetAge());
        book.setDifficulty(dto.getDifficulty());
        book.setCoverImageUrl(dto.getCoverImageUrl());
        book.setStatus(dto.getStatus());

        // 設置發布時間
        if ("published".equals(dto.getStatus()) && dto.getPublishedAt() == null) {
            book.setPublishedAt(LocalDateTime.now());
        } else {
            book.setPublishedAt(dto.getPublishedAt());
        }

        // 轉換熱區
        if (dto.getHotspots() != null) {
            for (HotspotDTO hotspotDTO : dto.getHotspots()) {
                Hotspot hotspot = convertHotspotToEntity(hotspotDTO);
                book.addHotspot(hotspot);
            }
        }

        return book;
    }

    public static HotspotDTO convertHotspotToDTO(Hotspot hotspot) {
        if (hotspot == null) {
            return null;
        }

        HotspotDTO dto = new HotspotDTO();
        dto.setId(hotspot.getId());
        dto.setLabel(hotspot.getLabel());
        dto.setX(hotspot.getX());
        dto.setY(hotspot.getY());
        dto.setWidth(hotspot.getWidth());
        dto.setHeight(hotspot.getHeight());
        dto.setAudioUrl(hotspot.getAudioUrl());
        dto.setSortOrder(hotspot.getSortOrder());

        return dto;
    }

    public static Hotspot convertHotspotToEntity(HotspotDTO dto) {
        if (dto == null) {
            return null;
        }

        Hotspot hotspot = new Hotspot();
        hotspot.setId(dto.getId());
        hotspot.setLabel(dto.getLabel());
        hotspot.setX(dto.getX());
        hotspot.setY(dto.getY());
        hotspot.setWidth(dto.getWidth());
        hotspot.setHeight(dto.getHeight());
        hotspot.setAudioUrl(dto.getAudioUrl());
        hotspot.setSortOrder(dto.getSortOrder());

        return hotspot;
    }
}
