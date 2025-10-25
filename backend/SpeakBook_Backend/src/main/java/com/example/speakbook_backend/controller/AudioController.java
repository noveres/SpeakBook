package com.example.speakbook_backend.controller;

import com.example.speakbook_backend.Response;
import com.example.speakbook_backend.dto.AudioDTO;
import com.example.speakbook_backend.dto.PageRequest;
import com.example.speakbook_backend.dto.PageResponse;
import com.example.speakbook_backend.dto.UploadResponse;
import com.example.speakbook_backend.service.AudioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/audios")
@CrossOrigin(origins = "*")
public class AudioController {

    @Autowired
    private AudioService audioService;

    @Autowired
    private com.example.speakbook_backend.service.UploadService uploadService;

    /**
     * 創建音訊
     * POST /api/audios
     */
    @PostMapping
    public Response<AudioDTO> createAudio(@RequestBody AudioDTO audioDTO) {
        try {
            Long audioId = audioService.createAudio(audioDTO);
            AudioDTO createdAudio = audioService.getAudioById(audioId);
            return Response.newSuccess(createdAudio);
        } catch (IllegalArgumentException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("創建音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 更新音訊
     * PUT /api/audios/{id}
     */
    @PutMapping("/{id}")
    public Response<AudioDTO> updateAudio(@PathVariable Long id, @RequestBody AudioDTO audioDTO) {
        try {
            Long audioId = audioService.updateAudio(id, audioDTO);
            AudioDTO updatedAudio = audioService.getAudioById(audioId);
            return Response.newSuccess(updatedAudio);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("更新音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 獲取音訊詳情
     * GET /api/audios/{id}
     */
    @GetMapping("/{id}")
    public Response<AudioDTO> getAudio(@PathVariable Long id) {
        try {
            AudioDTO audio = audioService.getAudioById(id);
            return Response.newSuccess(audio);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("獲取音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 獲取所有音訊
     * GET /api/audios
     */
    @GetMapping
    public Response<List<AudioDTO>> getAllAudios() {
        try {
            List<AudioDTO> audios = audioService.getAllAudios();
            return Response.newSuccess(audios);
        } catch (Exception e) {
            return Response.newFail("獲取音訊列表失敗：" + e.getMessage());
        }
    }

    /**
     * 根據分類獲取音訊
     * GET /api/audios/category/{category}
     */
    @GetMapping("/category/{category}")
    public Response<List<AudioDTO>> getAudiosByCategory(@PathVariable String category) {
        try {
            List<AudioDTO> audios = audioService.getAudiosByCategory(category);
            return Response.newSuccess(audios);
        } catch (Exception e) {
            return Response.newFail("獲取分類音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 刪除音訊
     * DELETE /api/audios/{id}
     */
    @DeleteMapping("/{id}")
    public Response<Void> deleteAudio(@PathVariable Long id) {
        try {
            audioService.deleteAudio(id);
            return Response.newSuccess(null);
        } catch (RuntimeException e) {
            return Response.newFail(e.getMessage());
        } catch (Exception e) {
            return Response.newFail("刪除音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 分頁查詢音訊
     * GET /api/audios/page
     */
    @GetMapping("/page")
    public Response<PageResponse<AudioDTO>> getAudiosWithPagination(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String sort) {
        try {
            PageRequest pageRequest = new PageRequest();
            pageRequest.setPage(page);
            pageRequest.setPageSize(size);
            pageRequest.setSearchKeyword(keyword);
            pageRequest.setSortBy(sort);

            PageResponse<AudioDTO> pageResponse = audioService.getAudiosWithPagination(pageRequest);
            return Response.newSuccess(pageResponse);
        } catch (Exception e) {
            return Response.newFail("分頁查詢音訊失敗：" + e.getMessage());
        }
    }

    /**
     * 上傳音訊並保存到數據庫
     * POST /api/audios/upload
     */
    @PostMapping("/upload")
    public Response<AudioDTO> uploadAudio(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "name", required = false) String name,
            @RequestParam(value = "category", required = false) String category) {
        try {
            // 驗證檔案
            if (file.isEmpty()) {
                return Response.newFail("請選擇要上傳的音訊");
            }

            // 驗證檔案類型
            String contentType = file.getContentType();
            if (contentType == null || !isValidAudioType(contentType)) {
                return Response.newFail("不支援的音訊格式，請上傳 MP3、WAV、OGG 或 M4A 格式");
            }

            // 驗證檔案大小（50MB）
            long maxSize = 50 * 1024 * 1024; // 50MB
            if (file.getSize() > maxSize) {
                return Response.newFail("音訊檔案過大，請上傳小於 50MB 的音訊");
            }

            // 1. 上傳到 Catbox.moe
            UploadResponse uploadResponse = uploadService.uploadToCatbox(file);

            // 2. 準備音訊數據
            AudioDTO audioDTO = new AudioDTO();
            audioDTO.setName(name != null && !name.trim().isEmpty() ? name : file.getOriginalFilename());
            audioDTO.setUrl(uploadResponse.getUrl());
            audioDTO.setFileSize((int) file.getSize());
            audioDTO.setCategory(category);
            
            // 3. 保存到數據庫
            Long audioId = audioService.createAudio(audioDTO);
            AudioDTO createdAudio = audioService.getAudioById(audioId);
            
            return Response.newSuccess(createdAudio);

        } catch (Exception e) {
            return Response.newFail("音訊上傳失敗：" + e.getMessage());
        }
    }

    /**
     * 驗證音訊類型
     */
    private boolean isValidAudioType(String contentType) {
        return contentType.equals("audio/mpeg") ||      // MP3
               contentType.equals("audio/mp3") ||       // MP3
               contentType.equals("audio/wav") ||       // WAV
               contentType.equals("audio/wave") ||      // WAV
               contentType.equals("audio/x-wav") ||     // WAV
               contentType.equals("audio/ogg") ||       // OGG
               contentType.equals("audio/x-m4a") ||     // M4A
               contentType.equals("audio/mp4");         // M4A
    }
}
