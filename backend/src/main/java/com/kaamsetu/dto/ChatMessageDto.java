package com.kaamsetu.dto;

import com.kaamsetu.model.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageDto {
    private Long id;
    private Long bookingId;
    private Long senderId;
    private String senderName;
    private String senderAvatarUrl;
    private String senderRole;
    private Long recipientId;
    private String recipientName;
    private String message;
    private boolean read;
    private LocalDateTime createdAt;

    public ChatMessageDto() {}

    public static ChatMessageDto fromEntity(ChatMessage msg) {
        if (msg == null) return null;
        ChatMessageDto dto = new ChatMessageDto();
        dto.setId(msg.getId());
        if (msg.getBooking() != null) {
            dto.setBookingId(msg.getBooking().getId());
        }
        if (msg.getSender() != null) {
            dto.setSenderId(msg.getSender().getId());
            dto.setSenderName(msg.getSender().getName());
            dto.setSenderAvatarUrl(msg.getSender().getAvatarUrl());
            dto.setSenderRole(msg.getSender().getRole().name());
        }
        if (msg.getRecipient() != null) {
            dto.setRecipientId(msg.getRecipient().getId());
            dto.setRecipientName(msg.getRecipient().getName());
        }
        dto.setMessage(msg.getMessage());
        dto.setRead(msg.isRead());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getBookingId() {
        return bookingId;
    }

    public void setBookingId(Long bookingId) {
        this.bookingId = bookingId;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getSenderAvatarUrl() {
        return senderAvatarUrl;
    }

    public void setSenderAvatarUrl(String senderAvatarUrl) {
        this.senderAvatarUrl = senderAvatarUrl;
    }

    public String getSenderRole() {
        return senderRole;
    }

    public void setSenderRole(String senderRole) {
        this.senderRole = senderRole;
    }

    public Long getRecipientId() {
        return recipientId;
    }

    public void setRecipientId(Long recipientId) {
        this.recipientId = recipientId;
    }

    public String getRecipientName() {
        return recipientName;
    }

    public void setRecipientName(String recipientName) {
        this.recipientName = recipientName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public boolean isRead() {
        return read;
    }

    public void setRead(boolean read) {
        this.read = read;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

