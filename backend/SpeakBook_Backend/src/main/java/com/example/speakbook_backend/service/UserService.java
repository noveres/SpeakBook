package com.example.speakbook_backend.service;


import com.example.speakbook_backend.entity.User;
import com.example.speakbook_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

/**
 * UserService 負責處理用戶相關的業務邏輯，
 * 包括新增、查詢、更新、刪除以及房東與房客關係的操作。
 */
@Service
public class UserService {

    // 注入 UserRepository 用於資料存取
    @Autowired
    private UserRepository userRepository;

    /**
     * 創建新用戶
     */
    public User createUser(User user) {
        return userRepository.save(user);
    }

    /**
     * 根據 ID 查詢用戶
     */
    public Optional<User> getUserById(Long id) {
        return userRepository.findById(id);
    }

    /**
     * 查詢所有用戶（通常僅供管理員使用）
     */
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    /**
     * 更新用戶資料
     */
    public User updateUser(User user) {
        return userRepository.save(user);
    }

    /**
     * 刪除用戶
     */
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }

    /**
     * 根據身份證號查詢用戶（用於房客初次登入驗證）
     * 由於可能存在多個具有相同身份證號的用戶，返回一個列表
     */
    public List<User> getUserByIdentityNumber(String identityNumber) {
        return userRepository.findByIdentityNumber(identityNumber);
    }

    /**
     * 根據房東ID查詢其所有房客
     * @param landlordId 房東的ID
     * @return 該房東所擁有的房客列表
     */
    public List<User> getTenantsByLandlordId(Long landlordId) {
        return userRepository.findByLandlordId(landlordId);
    }
}
