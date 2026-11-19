package com.kaamsetu.dto;

import com.kaamsetu.model.Review;
import java.time.LocalDateTime;

public class ReviewDto {
    private Long id;
    private Long bookingId;
    private String bookingNumber;
    private Long customerId;
    private String customerName;
    private String customerAvatarUrl;
    private Long workerId;
    private String workerName;
    private Integer rating;
    private String comment;
    private String workerReply;
    private LocalDateTime createdAt;

    public ReviewDto() {}

    public static ReviewDto fromEntity(Review r) {
        if (r == null) return null;
        ReviewDto dto = new ReviewDto();
        dto.setId(r.getId());
        if (r.getBooking() != null) {
            dto.setBookingId(r.getBooking().getId());
            dto.setBookingNumber(r.getBooking().getBookingNumber());
        }
        if (r.getCustomer() != null) {
            dto.setCustomerId(r.getCustomer().getId());
            dto.setCustomerName(r.getCustomer().getName());
            dto.setCustomerAvatarUrl(r.getCustomer().getAvatarUrl());
        }
        if (r.getWorker() != null && r.getWorker().getUser() != null) {
            dto.setWorkerId(r.getWorker().getId());
            dto.setWorkerName(r.getWorker().getUser().getName());
        }
        dto.setRating(r.getRating());
        dto.setComment(r.getComment());
        dto.setWorkerReply(r.getWorkerReply());
        dto.setCreatedAt(r.getCreatedAt());
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

    public String getBookingNumber() {
        return bookingNumber;
    }

    public void setBookingNumber(String bookingNumber) {
        this.bookingNumber = bookingNumber;
    }

    public Long getCustomerId() {
        return customerId;
    }

    public void setCustomerId(Long customerId) {
        this.customerId = customerId;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public String getCustomerAvatarUrl() {
        return customerAvatarUrl;
    }

    public void setCustomerAvatarUrl(String customerAvatarUrl) {
        this.customerAvatarUrl = customerAvatarUrl;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public String getComment() {
        return comment;
    }

    public void setComment(String comment) {
        this.comment = comment;
    }

    public String getWorkerReply() {
        return workerReply;
    }

    public void setWorkerReply(String workerReply) {
        this.workerReply = workerReply;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}

