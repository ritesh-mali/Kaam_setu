package com.kaamsetu.dto;

import com.kaamsetu.model.WorkerProfile;

public class WorkerProfileDto {
    private Long id;
    private Long userId;
    private String name;
    private String email;
    private String phone;
    private String avatarUrl;
    private Long categoryId;
    private String categoryName;
    private String categorySlug;
    private String skills;
    private String bio;
    private Integer experienceYears;
    private Double visitingCharge;
    private Double hourlyRate;
    private Double emergencyCharge;
    private boolean available;
    private boolean verified;
    private String verificationStatus;
    private String verificationNotes;
    private String idProofType;
    private String idProofNumber;
    private Double rating;
    private Integer totalReviews;
    private Integer completedJobsCount;
    private String city;
    private String serviceArea;
    private Double latitude;
    private Double longitude;
    private String currentLocationName;
    private String lastLocationUpdate;
    private Double distanceKm;
    private Integer estimatedArrivalMinutes;

    public WorkerProfileDto() {}

    public static WorkerProfileDto fromEntity(WorkerProfile profile) {
        if (profile == null) return null;
        WorkerProfileDto dto = new WorkerProfileDto();
        dto.setId(profile.getId());
        if (profile.getUser() != null) {
            dto.setUserId(profile.getUser().getId());
            dto.setName(profile.getUser().getName());
            dto.setEmail(profile.getUser().getEmail());
            dto.setPhone(profile.getUser().getPhone());
            dto.setAvatarUrl(profile.getUser().getAvatarUrl());
        }
        if (profile.getCategory() != null) {
            dto.setCategoryId(profile.getCategory().getId());
            dto.setCategoryName(profile.getCategory().getName());
            dto.setCategorySlug(profile.getCategory().getSlug());
        }
        dto.setSkills(profile.getSkills());
        dto.setBio(profile.getBio());
        dto.setExperienceYears(profile.getExperienceYears());
        dto.setVisitingCharge(profile.getVisitingCharge());
        dto.setHourlyRate(profile.getHourlyRate());
        dto.setEmergencyCharge(profile.getEmergencyCharge());
        dto.setAvailable(profile.isAvailable());
        dto.setVerified(profile.isVerified());
        dto.setVerificationStatus(profile.getVerificationStatus());
        dto.setVerificationNotes(profile.getVerificationNotes());
        dto.setIdProofType(profile.getIdProofType());
        dto.setIdProofNumber(profile.getIdProofNumber());
        dto.setRating(profile.getRating());
        dto.setTotalReviews(profile.getTotalReviews());
        dto.setCompletedJobsCount(profile.getCompletedJobsCount());
        dto.setCity(profile.getCity());
        dto.setServiceArea(profile.getServiceArea());
        dto.setLatitude(profile.getLatitude());
        dto.setLongitude(profile.getLongitude());
        dto.setCurrentLocationName(profile.getCurrentLocationName());
        if (profile.getLastLocationUpdate() != null) {
            dto.setLastLocationUpdate(profile.getLastLocationUpdate().toString());
        }
        dto.setDistanceKm(profile.getDistanceKm());
        dto.setEstimatedArrivalMinutes(profile.getEstimatedArrivalMinutes());
        return dto;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
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

    public String getAvatarUrl() {
        return avatarUrl;
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = avatarUrl;
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

    public String getCategorySlug() {
        return categorySlug;
    }

    public void setCategorySlug(String categorySlug) {
        this.categorySlug = categorySlug;
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

    public boolean isAvailable() {
        return available;
    }

    public void setAvailable(boolean available) {
        this.available = available;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public String getVerificationStatus() {
        return verificationStatus;
    }

    public void setVerificationStatus(String verificationStatus) {
        this.verificationStatus = verificationStatus;
    }

    public String getVerificationNotes() {
        return verificationNotes;
    }

    public void setVerificationNotes(String verificationNotes) {
        this.verificationNotes = verificationNotes;
    }

    public String getIdProofType() {
        return idProofType;
    }

    public void setIdProofType(String idProofType) {
        this.idProofType = idProofType;
    }

    public String getIdProofNumber() {
        return idProofNumber;
    }

    public void setIdProofNumber(String idProofNumber) {
        this.idProofNumber = idProofNumber;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getTotalReviews() {
        return totalReviews;
    }

    public void setTotalReviews(Integer totalReviews) {
        this.totalReviews = totalReviews;
    }

    public Integer getCompletedJobsCount() {
        return completedJobsCount;
    }

    public void setCompletedJobsCount(Integer completedJobsCount) {
        this.completedJobsCount = completedJobsCount;
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

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }

    public String getCurrentLocationName() {
        return currentLocationName;
    }

    public void setCurrentLocationName(String currentLocationName) {
        this.currentLocationName = currentLocationName;
    }

    public String getLastLocationUpdate() {
        return lastLocationUpdate;
    }

    public void setLastLocationUpdate(String lastLocationUpdate) {
        this.lastLocationUpdate = lastLocationUpdate;
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
}

