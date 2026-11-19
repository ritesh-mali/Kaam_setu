package com.kaamsetu.dto;

public class WorkerUpdateRequest {
    private Long categoryId;
    private String skills;
    private String bio;
    private Integer experienceYears;
    private Double visitingCharge;
    private Double hourlyRate;
    private Double emergencyCharge;
    private Boolean available;
    private String city;
    private String serviceArea;
    private String phone;
    private String address;

    public WorkerUpdateRequest() {}

    // Getters and Setters
    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getBio() {
        return bio;
    }

    public void setBio(String bio) {
        this.bio = bio;
    }

    public Integer getExperienceYears() {
        return experienceYears;
    }

    public void setExperienceYears(Integer experienceYears) {
        this.experienceYears = experienceYears;
    }

    public Double getVisitingCharge() {
        return visitingCharge;
    }

    public void setVisitingCharge(Double visitingCharge) {
        this.visitingCharge = visitingCharge;
    }

    public Double getHourlyRate() {
        return hourlyRate;
    }

    public void setHourlyRate(Double hourlyRate) {
        this.hourlyRate = hourlyRate;
    }

    public Double getEmergencyCharge() {
        return emergencyCharge;
    }

    public void setEmergencyCharge(Double emergencyCharge) {
        this.emergencyCharge = emergencyCharge;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getServiceArea() {
        return serviceArea;
    }

    public void setServiceArea(String serviceArea) {
        this.serviceArea = serviceArea;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }
}

