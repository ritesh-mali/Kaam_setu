package com.kaamsetu.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "worker_profiles")
public class WorkerProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private ServiceCategory category;

    @Column(length = 255)
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "experience_years")
    private Integer experienceYears = 1;

    @Column(name = "visiting_charge")
    private Double visitingCharge = 199.0;

    @Column(name = "hourly_rate")
    private Double hourlyRate = 299.0;

    @Column(name = "emergency_charge")
    private Double emergencyCharge = 150.0;

    @Column(name = "is_available", nullable = false)
    private boolean available = true;

    @Column(name = "is_verified", nullable = false)
    private boolean verified = false;

    @Column(name = "verification_status", length = 30)
    private String verificationStatus = "PENDING"; // PENDING, VERIFIED, REJECTED

    @Column(name = "verification_notes", length = 500)
    private String verificationNotes;

    @Column(name = "id_proof_type", length = 50)
    private String idProofType; // AADHAAR, PAN, DRIVING_LICENSE, VOTER_ID

    @Column(name = "id_proof_number", length = 50)
    private String idProofNumber;

    @Column(name = "rating")
    private Double rating = 5.0;

    @Column(name = "total_reviews")
    private Integer totalReviews = 0;

    @Column(name = "completed_jobs_count")
    private Integer completedJobsCount = 0;

    @Column(length = 100)
    private String city;

    @Column(name = "service_area", length = 255)
    private String serviceArea;

    @Column(name = "latitude")
    private Double latitude = 28.5355; // Default Delhi NCR

    @Column(name = "longitude")
    private Double longitude = 77.2078;

    @Column(name = "current_location_name", length = 150)
    private String currentLocationName = "South Delhi, Delhi";

    @Column(name = "last_location_update")
    private LocalDateTime lastLocationUpdate;

    @Transient
    private Double distanceKm;

    @Transient
    private Integer estimatedArrivalMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public WorkerProfile() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.createdAt == null) {
            this.createdAt = LocalDateTime.now();
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public ServiceCategory getCategory() {
        return category;
    }

    public void setCategory(ServiceCategory category) {
        this.category = category;
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

    public LocalDateTime getLastLocationUpdate() {
        return lastLocationUpdate;
    }

    public void setLastLocationUpdate(LocalDateTime lastLocationUpdate) {
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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
