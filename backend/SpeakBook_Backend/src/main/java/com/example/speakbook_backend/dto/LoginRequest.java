package com.example.speakbook_backend.dto;

public class LoginRequest {

    private String identityNumber;
    private String password;

    // Getters and Setters
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
}
