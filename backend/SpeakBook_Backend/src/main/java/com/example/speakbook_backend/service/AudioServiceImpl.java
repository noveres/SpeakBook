package com.example.speakbook_backend.service;

import com.example.speakbook_backend.converter.AudioConverter;
import com.example.speakbook_backend.dto.AudioDTO;
import com.example.speakbook_backend.dto.PageRequest;
import com.example.speakbook_backend.dto.PageResponse;
import com.example.speakbook_backend.entity.Audio;
import com.example.speakbook_backend.repository.AudioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AudioServiceImpl implements AudioService {

    @Autowired
    private AudioRepository audioRepository;

    @Autowired
    private AudioConverter audioConverter;

    @Override
    @Transactional
    public Long createAudio(AudioDTO audioDTO) {
        // 驗證必填欄位
        if (audioDTO.getName() == null || audioDTO.getName().trim().isEmpty()) {
            throw new IllegalArgumentException("音訊名稱不能為空");
        }
        if (audioDTO.getUrl() == null || audioDTO.getUrl().trim().isEmpty()) {
            throw new IllegalArgumentException("音訊URL不能為空");
        }

        Audio audio = audioConverter.toEntity(audioDTO);
        audio.setId(null); // 確保是新建
        Audio savedAudio = audioRepository.save(audio);
        return savedAudio.getId();
    }

    @Override
    @Transactional
    public Long updateAudio(Long id, AudioDTO audioDTO) {
        Audio audio = audioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("音訊不存在，ID: " + id));

        audioConverter.updateEntity(audio, audioDTO);
        Audio updatedAudio = audioRepository.save(audio);
        return updatedAudio.getId();
    }

    @Override
    @Transactional(readOnly = true)
    public AudioDTO getAudioById(Long id) {
        Audio audio = audioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("音訊不存在，ID: " + id));
        return audioConverter.toDTO(audio);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioDTO> getAllAudios() {
        List<Audio> audios = audioRepository.findAll();
        return audios.stream()
                .map(audioConverter::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AudioDTO> getAudiosByCategory(String category) {
        List<Audio> audios = audioRepository.findByCategory(category);
        return audios.stream()
                .map(audioConverter::toDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteAudio(Long id) {
        if (!audioRepository.existsById(id)) {
            throw new RuntimeException("音訊不存在，ID: " + id);
        }
        audioRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<AudioDTO> getAudiosWithPagination(PageRequest pageRequest) {
        // 建立排序
        Sort sort = Sort.unsorted();
        if (pageRequest.getSortBy() != null && !pageRequest.getSortBy().isEmpty()) {
            String[] sortParts = pageRequest.getSortBy().split(",");
            String sortField = sortParts[0];
            Sort.Direction direction = sortParts.length > 1 && "desc".equalsIgnoreCase(sortParts[1])
                    ? Sort.Direction.DESC
                    : Sort.Direction.ASC;
            sort = Sort.by(direction, sortField);
        }

        // 建立分頁請求 (Spring 的頁碼從 0 開始,我們的從 1 開始,需要減 1)
        org.springframework.data.domain.PageRequest springPageRequest = 
                org.springframework.data.domain.PageRequest.of(
                    pageRequest.getPage() - 1,
                    pageRequest.getPageSize(),
                    sort
                );

        // 查詢資料
        Page<Audio> audioPage;
        if (pageRequest.getSearchKeyword() != null && !pageRequest.getSearchKeyword().trim().isEmpty()) {
            audioPage = audioRepository.findByKeyword(pageRequest.getSearchKeyword(), springPageRequest);
        } else {
            audioPage = audioRepository.findAll(springPageRequest);
        }

        // 轉換為 DTO
        List<AudioDTO> audioDTOs = audioPage.getContent().stream()
                .map(audioConverter::toDTO)
                .collect(Collectors.toList());

        // 建立分頁響應
        PageResponse<AudioDTO> pageResponse = new PageResponse<>();
        pageResponse.setContent(audioDTOs);
        pageResponse.setCurrentPage(audioPage.getNumber() + 1); // Spring 的頁碼從 0 開始,轉換為從 1 開始
        pageResponse.setPageSize(audioPage.getSize());
        pageResponse.setTotalElements(audioPage.getTotalElements());
        pageResponse.setTotalPages(audioPage.getTotalPages());
        pageResponse.setLast(audioPage.isLast());
        pageResponse.setFirst(audioPage.isFirst());
        pageResponse.setEmpty(audioPage.isEmpty());

        return pageResponse;
    }
}
