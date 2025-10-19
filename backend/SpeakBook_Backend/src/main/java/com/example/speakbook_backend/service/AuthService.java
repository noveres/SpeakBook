package com.example.speakbook_backend.service;

import com.example.speakbook_backend.dto.LoginRequest;
import com.example.speakbook_backend.dto.LoginResponse;
import com.example.speakbook_backend.entity.Role;
import com.example.speakbook_backend.entity.User;
import com.example.speakbook_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.UUID;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;

    /**
     * 處理用戶登錄
     * @param loginRequest 包含身份證號和密碼的請求
     * @return 登錄響應，包含用戶信息和令牌
     */
    public LoginResponse login(LoginRequest loginRequest) {
        LoginResponse response = new LoginResponse();

        // 根據身份證號查找用戶
        List<User> users = userRepository.findByIdentityNumber(loginRequest.getIdentityNumber());

        // 如果沒有找到用戶或找到多個用戶，返回錯誤
        if (users.isEmpty()) {
            response.setSuccess(false);
            response.setMessage("帳號或密碼錯誤");
            return response;
        }
        
        // 遍歷所有找到的用戶，尋找匹配密碼的用戶
        User matchedUser = null;
        for (User user : users) {
            if (user.getPassword().equals(loginRequest.getPassword())) {
                matchedUser = user;
                break;
            }
        }
        
        // 如果沒有找到匹配密碼的用戶
        if (matchedUser == null) {
            response.setSuccess(false);
            response.setMessage("帳號或密碼錯誤");
            return response;
        }

        // 檢查用戶角色是否為管理員
        if (matchedUser.getRole() != Role.admin) {
            response.setSuccess(false);
            response.setMessage("只有管理員可以登入系統");
            return response;
        }

        // 登錄成功，生成令牌
        String token = generateToken();

        // 設置響應信息
        response.setSuccess(true);
        response.setUserId(matchedUser.getId());
        response.setName(matchedUser.getName());
        response.setRole(matchedUser.getRole());
        response.setToken(token);
        response.setMessage("登錄成功");

        return response;
    }

    /**
     * 生成簡單的令牌
     * 注意：此處生成的令牌僅供測試用，實際應使用更安全的JWT實現
     */
    private String generateToken() {
        return UUID.randomUUID().toString();
    }
}