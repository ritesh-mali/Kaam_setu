package com.kaamsetu.dto;

import com.kaamsetu.model.Booking;
import com.kaamsetu.model.BookingStatus;
import com.kaamsetu.model.UrgencyLevel;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class BookingDto {
    private Long id;
    private String bookingNumber;

    // Customer info
    private Long customerId;
    private String customerName;
    private String customerEmail;
    private String customerPhone;

    // Worker info
    private Long workerId;
    private Long workerUserId;
    private String workerName;
    private String workerPhone;
    private String workerAvatarUrl;
    private Double workerRating;

    // Service & Category info
    private Long categoryId;
    private String categoryName;
    private String serviceTitle;
    private String problemDescription;

    // Schedule & Location
    private LocalDate scheduledDate;
    private String scheduledTimeSlot;
    private String address;
    private String city;
    private String contactPhone;

    // Status & Tracking
    private UrgencyLevel urgency;
    private BookingStatus status;
    private String completionOtp; // Shown to customer, entered by worker to verify completion

    // Pricing & Invoicing
    private Double visitingFee;
    private Double hourlyRate;
    private Double estimatedHours;
    private Double partsCost;
    private Double totalAmount;
    private String paymentStatus;
    private String workerNotes;
    private String rejectionReason;

    // GPS & Live Tracking
    private Double customerLatitude;
    private Double customerLongitude;
    private Double workerLatitude;
    private Double workerLongitude;
    private Double distanceKm;
    private Integer estimatedArrivalMinutes;
    private String workerLocationName;
    private String lastLocationUpdate;

    private boolean hasReviewed;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    public BookingDto() {}

    public static BookingDto fromEntity(Booking b) {
        if (b == null) return null;
        BookingDto dto = new BookingDto();
        dto.setId(b.getId());
        dto.setBookingNumber(b.getBookingNumber());

        if (b.getCustomer() != null) {
            dto.setCustomerId(b.getCustomer().getId());
            dto.setCustomerName(b.getCustomer().getName());
            dto.setCustomerEmail(b.getCustomer().getEmail());
            dto.setCustomerPhone(b.getCustomer().getPhone());
        }

        if (b.getWorker() != null) {
            dto.setWorkerId(b.getWorker().getId());
            if (b.getWorker().getUser() != null) {
                dto.setWorkerUserId(b.getWorker().getUser().getId());
                dto.setWorkerName(b.getWorker().getUser().getName());
                dto.setWorkerPhone(b.getWorker().getUser().getPhone());
                dto.setWorkerAvatarUrl(b.getWorker().getUser().getAvatarUrl());
            }
            dto.setWorkerRating(b.getWorker().getRating());
        }

        if (b.getCategory() != null) {
            dto.setCategoryId(b.getCategory().getId());
            dto.setCategoryName(b.getCategory().getName());
        }

        dto.setServiceTitle(b.getServiceTitle());
        dto.setProblemDescription(b.getProblemDescription());
        dto.setScheduledDate(b.getScheduledDate());
        dto.setScheduledTimeSlot(b.getScheduledTimeSlot());
        dto.setAddress(b.getAddress());
        dto.setCity(b.getCity());
        dto.setContactPhone(b.getContactPhone());

        dto.setUrgency(b.getUrgency());
        dto.setStatus(b.getStatus());
        dto.setCompletionOtp(b.getCompletionOtp());

        dto.setVisitingFee(b.getVisitingFee());
        dto.setHourlyRate(b.getHourlyRate());
        dto.setEstimatedHours(b.getEstimatedHours());
        dto.setPartsCost(b.getPartsCost());
        dto.setTotalAmount(b.getTotalAmount());
        dto.setPaymentStatus(b.getPaymentStatus());
        dto.setWorkerNotes(b.getWorkerNotes());
        dto.setRejectionReason(b.getRejectionReason());

        dto.setCustomerLatitude(b.getCustomerLatitude());
        dto.setCustomerLongitude(b.getCustomerLongitude());
        dto.setWorkerLatitude(b.getWorkerLatitude());
        dto.setWorkerLongitude(b.getWorkerLongitude());
        dto.setDistanceKm(b.getDistanceKm());
        dto.setEstimatedArrivalMinutes(b.getEstimatedArrivalMinutes());
        dto.setWorkerLocationName(b.getWorkerLocationName());
        if (b.getLastLocationUpdate() != null) {
            dto.setLastLocationUpdate(b.getLastLocationUpdate().toString());
        }

        dto.setCreatedAt(b.getCreatedAt());
        dto.setUpdatedAt(b.getUpdatedAt());
        dto.setCompletedAt(b.getCompletedAt());

        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getCustomerEmail() {
        return customerEmail;
    }

    public void setCustomerEmail(String customerEmail) {
        this.customerEmail = customerEmail;
    }

    public String getCustomerPhone() {
        return customerPhone;
    }

    public void setCustomerPhone(String customerPhone) {
        this.customerPhone = customerPhone;
    }

    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public Long getWorkerUserId() {
        return workerUserId;
    }

    public void setWorkerUserId(Long workerUserId) {
        this.workerUserId = workerUserId;
    }

    public String getWorkerName() {
        return workerName;
    }

    public void setWorkerName(String workerName) {
        this.workerName = workerName;
    }

    public String getWorkerPhone() {
        return workerPhone;
    }

    public void setWorkerPhone(String workerPhone) {
        this.workerPhone = workerPhone;
    }

    public String getWorkerAvatarUrl() {
        return workerAvatarUrl;
    }

    public void setWorkerAvatarUrl(String workerAvatarUrl) {
        this.workerAvatarUrl = workerAvatarUrl;
    }

    public Double getWorkerRating() {
        return workerRating;
    }

    public void setWorkerRating(Double workerRating) {
        this.workerRating = workerRating;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getServiceTitle() {
        return serviceTitle;
    }

    public void setServiceTitle(String serviceTitle) {
        this.serviceTitle = serviceTitle;
    }

    public String getProblemDescription() {
        return problemDescription;
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = problemDescription;
    }

    public LocalDate getScheduledDate() {
        return scheduledDate;
    }

    public void setScheduledDate(LocalDate scheduledDate) {
        this.scheduledDate = scheduledDate;
    }

    public String getScheduledTimeSlot() {
        return scheduledTimeSlot;
    }

    public void setScheduledTimeSlot(String scheduledTimeSlot) {
        this.scheduledTimeSlot = scheduledTimeSlot;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getContactPhone() {
        return contactPhone;
    }

    public void setContactPhone(String contactPhone) {
        this.contactPhone = contactPhone;
    }

    public UrgencyLevel getUrgency() {
        return urgency;
    }

    public void setUrgency(UrgencyLevel urgency) {
        this.urgency = urgency;
    }

    public BookingStatus getStatus() {
        return status;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }

    public String getCompletionOtp() {
        return completionOtp;
    }

    public void setCompletionOtp(String completionOtp) {
        this.completionOtp = completionOtp;
    }

    public Double getVisitingFee() {
        return visitingFee;
    }

    public void setVisitingFee(Double visitingFee) {
        this.visitingFee = visitingFee;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Double getEstimatedHours() {
        return estimatedHours;
    }

    public void setEstimatedHours(Double estimatedHours) {
        this.estimatedHours = estimatedHours;
    }

    public Double getPartsCost() {
        return partsCost;
    }

    public void setPartsCost(Double partsCost) {
        this.partsCost = partsCost;
    }

    public Double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public String getWorkerNotes() {
        return workerNotes;
    }

    public void setWorkerNotes(String workerNotes) {
        this.workerNotes = workerNotes;
    }

    public String getRejectionReason() {
        return rejectionReason;
    }

    public void setRejectionReason(String rejectionReason) {
        this.rejectionReason = rejectionReason;
    }

    public boolean isHasReviewed() {
        return hasReviewed;
    }

    public void setHasReviewed(boolean hasReviewed) {
        this.hasReviewed = hasReviewed;
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

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }

    public Double getCustomerLatitude() {
        return customerLatitude;
    }

    public void setCustomerLatitude(Double customerLatitude) {
        this.customerLatitude = customerLatitude;
    }

    public Double getCustomerLongitude() {
        return customerLongitude;
    }

    public void setCustomerLongitude(Double customerLongitude) {
        this.customerLongitude = customerLongitude;
    }

    public Double getWorkerLatitude() {
        return workerLatitude;
    }

    public void setWorkerLatitude(Double workerLatitude) {
        this.workerLatitude = workerLatitude;
    }

    public Double getWorkerLongitude() {
        return workerLongitude;
    }

    public void setWorkerLongitude(Double workerLongitude) {
        this.workerLongitude = workerLongitude;
    }

    public Double getDistanceKm() {
        return distanceKm;
    }

    public void setDistanceKm(Double distanceKm) {
        this.distanceKm = distanceKm;
    }

    public Integer getEstimatedArrivalMinutes() {
        return estimatedArrivalMinutes;
    }

    public void setEstimatedArrivalMinutes(Integer estimatedArrivalMinutes) {
        this.estimatedArrivalMinutes = estimatedArrivalMinutes;
    }

    public String getWorkerLocationName() {
        return workerLocationName;
    }

    public void setWorkerLocationName(String workerLocationName) {
        this.workerLocationName = workerLocationName;
    }

    public String getLastLocationUpdate() {
        return lastLocationUpdate;
    }

    public void setLastLocationUpdate(String lastLocationUpdate) {
        this.lastLocationUpdate = lastLocationUpdate;
    }
}

