package com.example.speakbook_backend.converter;

import com.example.speakbook_backend.dto.AudioDTO;
import com.example.speakbook_backend.entity.Audio;
import org.springframework.stereotype.Component;

@Component
public class AudioConverter {

    /**
     * Entity 轉 DTO
     */
    public AudioDTO toDTO(Audio audio) {
        if (audio == null) {
            return null;
        }

        AudioDTO dto = new AudioDTO();
        dto.setId(audio.getId());
        dto.setName(audio.getName());
        dto.setUrl(audio.getUrl());
        dto.setDuration(audio.getDuration());
        dto.setFileSize(audio.getFileSize());
        dto.setCategory(audio.getCategory());
        dto.setCreatedAt(audio.getCreatedAt());

        return dto;
    }

    /**
     * DTO 轉 Entity
     */
    public Audio toEntity(AudioDTO dto) {
        if (dto == null) {
            return null;
        }

        Audio audio = new Audio();
        audio.setId(dto.getId());
        audio.setName(dto.getName());
        audio.setUrl(dto.getUrl());
        audio.setDuration(dto.getDuration());
        audio.setFileSize(dto.getFileSize());
        audio.setCategory(dto.getCategory());
        audio.setCreatedAt(dto.getCreatedAt());

        return audio;
    }

    /**
     * 更新 Entity
     */
    public void updateEntity(Audio audio, AudioDTO dto) {
        if (audio == null || dto == null) {
            return;
        }

        audio.setName(dto.getName());
        audio.setUrl(dto.getUrl());
        audio.setDuration(dto.getDuration());
        audio.setFileSize(dto.getFileSize());
        audio.setCategory(dto.getCategory());
    }
}
