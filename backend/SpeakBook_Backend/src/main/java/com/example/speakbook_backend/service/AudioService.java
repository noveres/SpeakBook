package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.AudioDTO;
import com.example.speakbook_backend.dto.PageRequest;
import com.example.speakbook_backend.dto.PageResponse;

import java.util.List;

public interface AudioService {

    /**
     * 創建音訊
     */
    Long createAudio(AudioDTO audioDTO);

    /**
     * 更新音訊
     */
    Long updateAudio(Long id, AudioDTO audioDTO);

    /**
     * 獲取音訊詳情
     */
    AudioDTO getAudioById(Long id);

    /**
     * 獲取所有音訊
     */
    List<AudioDTO> getAllAudios();

    /**
     * 根據分類獲取音訊
     */
    List<AudioDTO> getAudiosByCategory(String category);

    /**
     * 刪除音訊
     */
    void deleteAudio(Long id);

    /**
     * 分頁查詢音訊
     */
    PageResponse<AudioDTO> getAudiosWithPagination(PageRequest pageRequest);
}
