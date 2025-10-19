package com.example.speakbook_backend.repository;


import com.example.speakbook_backend.entity.Role;
import com.example.speakbook_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

/**
 * UserRepository 負責用戶資料的存取操作，繼承 JpaRepository 可獲得常用 CRUD 方法
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // 根據身份證號查詢用戶（用於房客初次登入驗證）
    // 修改返回型別，以處理可能存在的多個結果
    List<User> findByIdentityNumber(String identityNumber);

    // 新增：根據房東的 id 查詢其所有房客
    List<User> findByLandlordId(Long landlordId);

    List<User> findByIsCurrentlyResidingAndRole(Boolean isCurrentlyResiding, Role role);


}
