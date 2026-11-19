package com.kaamsetu.dto;

import com.kaamsetu.model.Role;
import com.kaamsetu.model.User;

import java.time.LocalDateTime;

public class UserProfileDto {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private Role role;
    private String city;
    private String address;
    private String avatarUrl;
    private boolean active;
    private Long workerProfileId;
    private LocalDateTime createdAt;

    public UserProfileDto() {}

    public static UserProfileDto fromEntity(User user, Long workerProfileId) {
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setCity(user.getCity());
        dto.setAddress(user.getAddress());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setActive(user.isActive());
        dto.setWorkerProfileId(workerProfileId);
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }

    // Getters and Setters
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getWorkerProfileId() {
        return workerProfileId;
    }

    public void setWorkerProfileId(Long workerProfileId) {
        this.workerProfileId = workerProfileId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

