package com.kaamsetu.service;

import com.kaamsetu.dto.LocationUpdateRequest;
import com.kaamsetu.dto.WorkerProfileDto;
import com.kaamsetu.dto.WorkerUpdateRequest;
import com.kaamsetu.model.Booking;
import com.kaamsetu.model.BookingStatus;
import com.kaamsetu.model.ServiceCategory;
import com.kaamsetu.model.User;
import com.kaamsetu.model.WorkerProfile;
import com.kaamsetu.repository.BookingRepository;
import com.kaamsetu.repository.ServiceCategoryRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerService {

    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;

    public WorkerService(WorkerProfileRepository workerProfileRepository,
                         ServiceCategoryRepository categoryRepository,
                         UserRepository userRepository,
                         BookingRepository bookingRepository) {
        this.workerProfileRepository = workerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<WorkerProfileDto> searchWorkers(String categorySlug, String city, Boolean verifiedOnly, Boolean availableOnly, Double maxRate) {
        return searchWorkers(categorySlug, city, verifiedOnly, availableOnly, maxRate, null, null, null, false);
    }

    public List<WorkerProfileDto> searchWorkers(String categorySlug, String city, Boolean verifiedOnly, Boolean availableOnly, Double maxRate,
                                                Double customerLat, Double customerLon, Double maxDistanceKm, Boolean sortByDistance) {
        if (categorySlug != null && (categorySlug.isBlank() || categorySlug.equalsIgnoreCase("all"))) {
            categorySlug = null;
        }
        if (city != null && (city.isBlank() || city.equalsIgnoreCase("all"))) {
            city = null;
        }

        List<WorkerProfile> profiles = workerProfileRepository.searchWorkers(categorySlug, city, verifiedOnly, availableOnly, maxRate);
        List<WorkerProfileDto> dtos = profiles.stream()
                .map(p -> {
                    WorkerProfileDto dto = WorkerProfileDto.fromEntity(p);
                    if (customerLat != null && customerLon != null && p.getLatitude() != null && p.getLongitude() != null) {
                        double dist = calculateDistance(customerLat, customerLon, p.getLatitude(), p.getLongitude());
                        int eta = calculateEtaMinutes(dist);
                        dto.setDistanceKm(dist);
                        dto.setEstimatedArrivalMinutes(eta);
                    }
                    return dto;
                })
                .collect(Collectors.toList());

        // Filter by radius if requested
        if (customerLat != null && customerLon != null && maxDistanceKm != null && maxDistanceKm > 0) {
            dtos = dtos.stream()
                    .filter(d -> d.getDistanceKm() != null && d.getDistanceKm() <= maxDistanceKm)
                    .collect(Collectors.toList());
        }

        // Sort by distance if requested
        if (Boolean.TRUE.equals(sortByDistance) && customerLat != null && customerLon != null) {
            dtos.sort(Comparator.comparing(
                    WorkerProfileDto::getDistanceKm,
                    Comparator.nullsLast(Comparator.naturalOrder())
            ));
        }

        return dtos;
    }

    public WorkerProfileDto getWorkerById(Long id) {
        WorkerProfile profile = workerProfileRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Worker profile not found with ID: " + id));
        return WorkerProfileDto.fromEntity(profile);
    }

    public WorkerProfileDto getWorkerByUserId(Long userId) {
        WorkerProfile profile = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new RuntimeException("Worker profile not found for user ID: " + userId));
        return WorkerProfileDto.fromEntity(profile);
    }

    public WorkerProfileDto getWorkerByUserEmail(String email) {
        WorkerProfile profile = workerProfileRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Worker profile not found for user: " + email));
        return WorkerProfileDto.fromEntity(profile);
    }

    @Transactional
    public WorkerProfileDto updateProfile(String userEmail, WorkerUpdateRequest req) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        WorkerProfile profile = workerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found for user"));

        if (req.getCategoryId() != null) {
            ServiceCategory cat = categoryRepository.findById(req.getCategoryId()).orElse(null);
            profile.setCategory(cat);
        }

        if (req.getSkills() != null) profile.setSkills(req.getSkills());
        if (req.getBio() != null) profile.setBio(req.getBio());
        if (req.getExperienceYears() != null) profile.setExperienceYears(req.getExperienceYears());
        if (req.getVisitingCharge() != null) profile.setVisitingCharge(req.getVisitingCharge());
        if (req.getHourlyRate() != null) profile.setHourlyRate(req.getHourlyRate());
        if (req.getEmergencyCharge() != null) profile.setEmergencyCharge(req.getEmergencyCharge());
        if (req.getAvailable() != null) profile.setAvailable(req.getAvailable());
        if (req.getCity() != null) profile.setCity(req.getCity());
        if (req.getServiceArea() != null) profile.setServiceArea(req.getServiceArea());

        if (req.getPhone() != null) user.setPhone(req.getPhone());
        if (req.getAddress() != null) user.setAddress(req.getAddress());
        if (req.getCity() != null) user.setCity(req.getCity());
        userRepository.save(user);

        WorkerProfile updated = workerProfileRepository.save(profile);
        return WorkerProfileDto.fromEntity(updated);
    }

    @Transactional
    public WorkerProfileDto toggleAvailability(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        WorkerProfile profile = workerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        profile.setAvailable(!profile.isAvailable());
        WorkerProfile saved = workerProfileRepository.save(profile);
        return WorkerProfileDto.fromEntity(saved);
    }

    @Transactional
    public WorkerProfileDto updateWorkerLocation(String userEmail, LocationUpdateRequest req) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        WorkerProfile profile = workerProfileRepository.findByUserId(user.getId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found for user"));

        profile.setLatitude(req.getLatitude());
        profile.setLongitude(req.getLongitude());
        if (req.getLocationName() != null && !req.getLocationName().isBlank()) {
            profile.setCurrentLocationName(req.getLocationName());
        }
        profile.setLastLocationUpdate(LocalDateTime.now());
        WorkerProfile saved = workerProfileRepository.save(profile);

        // Synchronize active bookings (ACCEPTED / IN_PROGRESS)
        List<Booking> activeBookings = bookingRepository.findByWorkerIdAndStatusIn(
                profile.getId(),
                List.of(BookingStatus.ACCEPTED, BookingStatus.IN_PROGRESS)
        );

        for (Booking booking : activeBookings) {
            booking.setWorkerLatitude(req.getLatitude());
            booking.setWorkerLongitude(req.getLongitude());
            if (req.getLocationName() != null && !req.getLocationName().isBlank()) {
                booking.setWorkerLocationName(req.getLocationName());
            }
            booking.setLastLocationUpdate(LocalDateTime.now());

            // Recalculate distance and ETA if customer location exists
            if (booking.getCustomerLatitude() != null && booking.getCustomerLongitude() != null) {
                double dist = calculateDistance(booking.getCustomerLatitude(), booking.getCustomerLongitude(), req.getLatitude(), req.getLongitude());
                int eta = calculateEtaMinutes(dist);
                booking.setDistanceKm(dist);
                booking.setEstimatedArrivalMinutes(eta);
            }
            bookingRepository.save(booking);
        }

        return WorkerProfileDto.fromEntity(saved);
    }

    public static double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return Math.round(R * c * 10.0) / 10.0;
    }

    public static int calculateEtaMinutes(double distanceKm) {
        return (int) Math.ceil(distanceKm * 3.5) + 4; // ~25km/h speed + 4m buffer
    }
}
