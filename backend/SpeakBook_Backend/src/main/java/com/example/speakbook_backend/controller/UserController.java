package com.example.speakbook_backend.controller;

import com.example.speakbook_backend.entity.User;
import com.example.speakbook_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.StreamUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.Collections;

/**
 * UserController 負責定義用戶相關的 API 端點，
 * 包括創建、查詢、更新、刪除以及查詢房東對應房客等操作。
 */
@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    // 頭像存儲目錄
    private final String AVATAR_UPLOAD_DIR = "src/main/resources/static/avatars";

    @PostConstruct
    public void init() {
        // 創建頭像存儲目錄
        File directory = new File(AVATAR_UPLOAD_DIR);
        if (!directory.exists()) {
            directory.mkdirs();
        }
    }

    /**
     * 建立新用戶
     * 請求範例：POST /api/users
     */
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody User user) {
        // 驗證必填欄位
        if (user.getPassword() == null || user.getPassword().isEmpty()) {
            return ResponseEntity.badRequest().body("密碼不能為空");
        }
        if (user.getName() == null || user.getName().isEmpty()) {
            return ResponseEntity.badRequest().body("用戶名不能為空");
        }
        if (user.getIdentityNumber() == null || user.getIdentityNumber().isEmpty()) {
            return ResponseEntity.badRequest().body("身份證號不能為空");
        }
        if (user.getRole() == null) {
            return ResponseEntity.badRequest().body("角色不能為空");
        }
        
        // 創建用戶
        User createdUser = userService.createUser(user);
        return ResponseEntity.ok(createdUser);
    }

    /**
     * 根據用戶 ID 查詢用戶資料
     * 請求範例：GET /api/users/{id}
     */
    @GetMapping("/{id}")
    public Optional<User> getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    /**
     * 查詢所有用戶資料（通常僅限管理員使用）
     * 請求範例：GET /api/users
     */
    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    /**
     * 更新用戶資料
     * 請求範例：PUT /api/users/{id}
     */
    @PutMapping("/{id}")
    public User updateUser(@PathVariable Long id, @RequestBody User updatedUser) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            // 根據需求更新各欄位，實際情況可能需要更嚴格的權限驗證
            user.setName(updatedUser.getName());
            user.setIdentityNumber(updatedUser.getIdentityNumber());
            user.setPassword(updatedUser.getPassword());
            user.setRole(updatedUser.getRole());
            // 如果是房客，也可設定對應的房東
            user.setLandlord(updatedUser.getLandlord());
            return userService.updateUser(user);
        }
        return null;
    }

    /**
     * 更新用戶密碼
     * 請求範例：PUT /api/users/{id}/password
     */
    @PutMapping("/{id}/password")
    public ResponseEntity<?> updatePassword(@PathVariable Long id, @RequestBody Map<String, String> passwordData) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");

            // 驗證當前密碼是否正確
            if (!user.getPassword().equals(currentPassword)) {
                return ResponseEntity.badRequest().body("當前密碼不正確");
            }

            // 更新密碼
            user.setPassword(newPassword);
            userService.updateUser(user);

            return ResponseEntity.ok(Collections.singletonMap("message", "密碼更新成功"));

        }
        return ResponseEntity.notFound().build();
    }

    /**
     * 刪除用戶
     * 請求範例：DELETE /api/users/{id}
     */
    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
    }

    /**
     * 根據房東的 ID 查詢其所有房客
     * 請求範例：GET /api/users/landlord/{landlordId}/tenants
     */
    @GetMapping("/landlord/{landlordId}/tenants")
    public List<User> getTenantsByLandlord(@PathVariable Long landlordId) {
        return userService.getTenantsByLandlordId(landlordId);
    }

    /**
     * 上傳用戶頭像
     * @param id 用戶ID
     * @param file 頭像圖片文件
     * @return 上傳結果
     */
    @PostMapping("/{id}/avatar")
    public ResponseEntity<?> uploadAvatar(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        Optional<User> userOpt = userService.getUserById(id);
        if (!userOpt.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        try {
            // 刪除舊頭像（如果存在）
            if (user.getAvatar() != null && !user.getAvatar().isEmpty()) {
                File oldAvatar = new File(AVATAR_UPLOAD_DIR, user.getAvatar());
                if (oldAvatar.exists()) {
                    oldAvatar.delete();
                }
            }

            // 獲取文件擴展名
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }

            // 生成新的文件名
            String fileName = id + "_" + UUID.randomUUID().toString() + extension;
            Path targetLocation = Paths.get(AVATAR_UPLOAD_DIR).resolve(fileName);

            // 保存文件
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            // 更新用戶頭像路徑
            user.setAvatar(fileName);
            userService.updateUser(user);

            return ResponseEntity.ok().body(Map.of(
                    "message", "頭像上傳成功",
                    "avatarPath", fileName
            ));
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("頭像上傳失敗: " + e.getMessage());
        }
    }

    /**
     * 獲取用戶頭像
     * @param id 用戶ID
     * @return 頭像圖片
     */
    @GetMapping("/{id}/avatar")
    public ResponseEntity<?> getAvatar(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (!userOpt.isPresent() || userOpt.get().getAvatar() == null || userOpt.get().getAvatar().isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        String avatarPath = user.getAvatar();

        // 檢查是否為外部 URL
        if (avatarPath.startsWith("http://") || avatarPath.startsWith("https://")) {
            // 如果是外部 URL，重定向到該 URL
            return ResponseEntity.status(HttpStatus.FOUND)
                    .header("Location", avatarPath)
                    .build();
        }

        // 處理本地文件
        try {
            // 構建文件路徑
            Path filePath = Paths.get(AVATAR_UPLOAD_DIR).resolve(avatarPath);
            File avatarFile = filePath.toFile();

            // 檢查文件是否存在
            if (!avatarFile.exists()) {
                return ResponseEntity.notFound().build();
            }

            // 讀取文件內容
            byte[] imageData = Files.readAllBytes(filePath);

            // 根據文件擴展名設置適當的 MediaType
            MediaType mediaType = MediaType.IMAGE_JPEG;
            if (avatarPath.toLowerCase().endsWith(".png")) {
                mediaType = MediaType.IMAGE_PNG;
            } else if (avatarPath.toLowerCase().endsWith(".gif")) {
                mediaType = MediaType.IMAGE_GIF;
            }

            return ResponseEntity.ok()
                    .contentType(mediaType)
                    .body(imageData);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("無法獲取頭像: " + e.getMessage());
        }
    }
}
