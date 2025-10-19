package com.example.speakbook_backend.dto;

public class UploadResponse {

    private String url;
    private String fileName;

    public UploadResponse() {
    }

    public UploadResponse(String url, String fileName) {
        this.url = url;
        this.fileName = fileName;
    }

    // Getters and Setters
    public String getUrl() {
        return url;
    }

    public void setUrl(String url) {
        this.url = url;
    }

    public String getFileName() {
        return fileName;
    }

    public void setFileName(String fileName) {
        this.fileName = fileName;
    }
}
