package com.example.speakbook_backend.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.time.ZoneOffset;

import java.util.List;

/**
 * User 實體類，對應資料庫中的 Users 表
 * 此實體除了基本用戶資料，還包含房客與房東間的關聯
 */
@Entity
@Table(name = "users")
public class User {

    // 主鍵，資料庫自動生成唯一ID
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 用戶名稱
    private String name;

    @Column(name = "address")
    private String address;

    // 身份證號 (房客預設用作初次登入密碼)
    @Column(name = "identity_number")
    private String identityNumber;

    // 密碼 (請務必加密後再儲存)
    private String password;

    // 用戶角色：admin / landlord / tenant
    @Enumerated(EnumType.STRING)
    private Role role;

    // 用戶頭像路徑
    @Column(name = "avatar")
    private String avatar;

    // 創建時間，預設以 UTC 時間儲存
    private LocalDateTime createdAt;

    // 更新時間，預設以 UTC 時間儲存
    private LocalDateTime updatedAt;

    // 新增：房客所對應的房東
    // 一個房東可以擁有多個房客 (多對一關係)
    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "landlord_id")
    private User landlord;

    // 使用 JsonManagedReference 序列化房東的房客清單
    @JsonManagedReference
    @OneToMany(mappedBy = "landlord", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<User> tenants;



    /**
     * 當新資料建立前，自動填入 UTC 時間
     */
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now(ZoneOffset.UTC);
        updatedAt = createdAt;
    }

    /**
     * 當資料更新前，自動更新 updatedAt 為 UTC 時間
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    // 新增：判斷房客是否仍在居住，預設為 true
    @Column(name = "is_currently_residing", nullable = false)
    private Boolean isCurrentlyResiding = true;

    // 以下為 Getter 與 Setter 方法


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getIdentityNumber() {
        return identityNumber;
    }

    public void setIdentityNumber(String identityNumber) {
        this.identityNumber = identityNumber;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    /**
     * 取得該房客對應的房東
     */
    public User getLandlord() {
        return landlord;
    }

    /**
     * 設定該房客對應的房東
     */
    public void setLandlord(User landlord) {
        this.landlord = landlord;
    }

    /**
     * 取得該房東擁有的所有房客 (反向關係)
     */
    public List<User> getTenants() {
        return tenants;
    }

    public void setTenants(List<User> tenants) {
        this.tenants = tenants;
    }

    public Boolean getIsCurrentlyResiding() {
        return isCurrentlyResiding;
    }

    public void setIsCurrentlyResiding(Boolean isCurrentlyResiding) {
        this.isCurrentlyResiding = isCurrentlyResiding;
    }
}