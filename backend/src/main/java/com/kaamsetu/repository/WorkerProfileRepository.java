package com.kaamsetu.repository;

import com.kaamsetu.model.WorkerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkerProfileRepository extends JpaRepository<WorkerProfile, Long> {
    Optional<WorkerProfile> findByUserId(Long userId);
    Optional<WorkerProfile> findByUserEmail(String email);

    List<WorkerProfile> findByVerifiedTrueAndAvailableTrue();

    @Query("SELECT w FROM WorkerProfile w " +
           "WHERE (:categorySlug IS NULL OR w.category.slug = :categorySlug) " +
           "AND (:city IS NULL OR LOWER(w.city) LIKE LOWER(CONCAT('%', :city, '%')) OR LOWER(w.serviceArea) LIKE LOWER(CONCAT('%', :city, '%'))) " +
           "AND (:verifiedOnly IS NULL OR :verifiedOnly = false OR w.verified = true) " +
           "AND (:availableOnly IS NULL OR :availableOnly = false OR w.available = true) " +
           "AND (:maxRate IS NULL OR w.visitingCharge <= :maxRate)")
    List<WorkerProfile> searchWorkers(
            @Param("categorySlug") String categorySlug,
            @Param("city") String city,
            @Param("verifiedOnly") Boolean verifiedOnly,
            @Param("availableOnly") Boolean availableOnly,
            @Param("maxRate") Double maxRate
    );

    long countByVerifiedTrue();
    long countByVerificationStatus(String verificationStatus);
}

