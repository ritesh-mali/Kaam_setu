package com.kaamsetu.dto;

import com.kaamsetu.model.UrgencyLevel;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class BookingCreateRequest {

    @NotNull(message = "Worker ID is required")
    private Long workerId;

    private Long categoryId;

    @NotBlank(message = "Service title is required")
    private String serviceTitle;

    @NotBlank(message = "Problem description is required")
    private String problemDescription;

    @NotNull(message = "Scheduled date is required")
    @FutureOrPresent(message = "Date cannot be in the past")
    private LocalDate scheduledDate;

    @NotBlank(message = "Scheduled time slot is required")
    private String scheduledTimeSlot; // e.g. "09:00 AM - 11:00 AM"

    @NotBlank(message = "Address is required")
    private String address;

    private String city;

    @NotBlank(message = "Contact phone is required")
    private String contactPhone;

    private UrgencyLevel urgency = UrgencyLevel.NORMAL;

    private Double customerLatitude;
    private Double customerLongitude;

    public BookingCreateRequest() {}

    // Getters and Setters
    public Long getWorkerId() {
        return workerId;
    }

    public void setWorkerId(Long workerId) {
        this.workerId = workerId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
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
}

