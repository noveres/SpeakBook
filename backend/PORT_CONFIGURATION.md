# 端口配置說明

## 問題

前端發送請求到 `http://localhost:4200/api/upload/image`，但後端運行在 `localhost:9527`，導致 404 錯誤。

## 解決方案

### 1. 前端代理配置（已完成）

**文件**: `proxy.conf.json`

```json
{
  "/api": {
    "target": "http://localhost:9527",
    "secure": false,
    "changeOrigin": true,
    "logLevel": "debug"
  }
}
```

**說明**:
- 所有 `/api/*` 的請求會被代理到 `http://localhost:9527`
- 例如：`http://localhost:4200/api/upload/image` → `http://localhost:9527/api/upload/image`

### 2. 後端端口配置

**文件**: `src/main/resources/application.properties`

請確保包含以下配置：

```properties
# 伺服器端口
server.port=9527

# 檔案上傳配置
spring.servlet.multipart.enabled=true
spring.servlet.multipart.max-file-size=20MB
spring.servlet.multipart.max-request-size=20MB

# 資料庫配置
spring.datasource.url=jdbc:mysql://localhost:3306/speakbook?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA 配置
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true
```

### 3. Angular 啟動配置

**確保使用代理配置啟動**:

在 `angular.json` 中確認：

```json
{
  "projects": {
    "SpeakBook_NG": {
      "architect": {
        "serve": {
          "options": {
            "proxyConfig": "proxy.conf.json"
          }
        }
      }
    }
  }
}
```

或使用命令行啟動：

```bash
ng serve --proxy-config proxy.conf.json
```

## 重啟步驟

### 1. 重啟前端

```bash
# 停止當前的 ng serve
Ctrl + C

# 重新啟動（確保使用代理配置）
ng serve --proxy-config proxy.conf.json
```

### 2. 確認後端運行在 9527

```bash
# 檢查後端日誌
# 應該看到類似：
# Tomcat started on port(s): 9527 (http)
```

## 測試

### 1. 測試後端 API

```bash
# 直接測試後端
curl http://localhost:9527/api/books

# 應該返回教材列表或空數組
```

### 2. 測試前端代理

```bash
# 在瀏覽器開發者工具中查看網絡請求
# 請求 URL: http://localhost:4200/api/upload/image
# 實際轉發到: http://localhost:9527/api/upload/image
```

## 端口總結

| 服務 | 端口 | 說明 |
|------|------|------|
| Angular 前端 | 4200 | 開發服務器 |
| Spring Boot 後端 | 9527 | API 服務器 |
| MySQL 資料庫 | 3306 | 資料庫服務器 |

## 請求流程

```
用戶瀏覽器
    ↓
http://localhost:4200/api/upload/image
    ↓
Angular 代理（proxy.conf.json）
    ↓
http://localhost:9527/api/upload/image
    ↓
Spring Boot 後端
    ↓
UploadController
```

## 常見問題

### Q: 仍然出現 404 錯誤？

**A**: 檢查以下項目：
1. ✅ 後端是否運行在 9527 端口？
2. ✅ 前端是否使用 `--proxy-config` 啟動？
3. ✅ `proxy.conf.json` 的 target 是否為 `http://localhost:9527`？
4. ✅ 是否重啟了前端服務？

### Q: CORS 錯誤？

**A**: 後端控制器已添加 `@CrossOrigin(origins = "*")`，但使用代理後不應該有 CORS 問題。

### Q: 如何確認代理是否生效？

**A**: 
1. 查看前端控制台，應該看到代理日誌
2. 查看網絡請求，Request URL 應該是 `localhost:4200`
3. 但實際請求會轉發到 `localhost:9527`

## 修改總結

✅ **已修改**: `proxy.conf.json` 的 target 從 8080 改為 9527
✅ **需要**: 重啟前端服務（`ng serve --proxy-config proxy.conf.json`）
✅ **確認**: 後端運行在 9527 端口
