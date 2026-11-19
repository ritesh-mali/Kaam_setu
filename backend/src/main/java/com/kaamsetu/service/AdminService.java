package com.kaamsetu.service;

import com.kaamsetu.dto.AdminStatsDto;
import com.kaamsetu.dto.BookingDto;
import com.kaamsetu.dto.UserProfileDto;
import com.kaamsetu.dto.WorkerProfileDto;
import com.kaamsetu.dto.WorkerVerificationRequest;
import com.kaamsetu.model.Booking;
import com.kaamsetu.model.BookingStatus;
import com.kaamsetu.model.Role;
import com.kaamsetu.model.User;
import com.kaamsetu.model.WorkerProfile;
import com.kaamsetu.repository.BookingRepository;
import com.kaamsetu.repository.ReviewRepository;
import com.kaamsetu.repository.UserRepository;
import com.kaamsetu.repository.WorkerProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    public AdminService(UserRepository userRepository,
                        WorkerProfileRepository workerProfileRepository,
                        BookingRepository bookingRepository,
                        ReviewRepository reviewRepository) {
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.bookingRepository = bookingRepository;
        this.reviewRepository = reviewRepository;
    }

    public AdminStatsDto getPlatformStats() {
        AdminStatsDto stats = new AdminStatsDto();
        stats.setTotalUsers(userRepository.count());
        stats.setTotalCustomers(userRepository.countByRole(Role.ROLE_CUSTOMER));
        stats.setTotalWorkers(userRepository.countByRole(Role.ROLE_WORKER));
        stats.setVerifiedWorkers(workerProfileRepository.countByVerifiedTrue());
        stats.setPendingWorkers(workerProfileRepository.countByVerificationStatus("PENDING"));

        stats.setTotalBookings(bookingRepository.count());
        stats.setPendingBookings(bookingRepository.countByStatus(BookingStatus.PENDING));
        stats.setInProgressBookings(bookingRepository.countByStatus(BookingStatus.IN_PROGRESS));
        stats.setCompletedBookings(bookingRepository.countByStatus(BookingStatus.COMPLETED));
        stats.setCancelledBookings(bookingRepository.countByStatus(BookingStatus.CANCELLED));

        Double revenue = bookingRepository.calculateTotalRevenue();
        stats.setTotalRevenue(revenue != null ? Math.round(revenue * 100.0) / 100.0 : 0.0);

        return stats;
    }

    public List<WorkerProfileDto> getAllWorkers() {
        return workerProfileRepository.findAll().stream()
                .map(WorkerProfileDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public WorkerProfileDto verifyWorker(Long workerId, WorkerVerificationRequest req) {
        WorkerProfile profile = workerProfileRepository.findById(workerId)
                .orElseThrow(() -> new RuntimeException("Worker profile not found with ID: " + workerId));

        boolean isVerified = "VERIFIED".equalsIgnoreCase(req.getStatus());
        profile.setVerified(isVerified);
        profile.setVerificationStatus(req.getStatus().toUpperCase());
        if (req.getNotes() != null) {
            profile.setVerificationNotes(req.getNotes());
        }

        WorkerProfile saved = workerProfileRepository.save(profile);
        return WorkerProfileDto.fromEntity(saved);
    }

    public List<BookingDto> getAllBookings() {
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(b -> {
                    BookingDto dto = BookingDto.fromEntity(b);
                    dto.setHasReviewed(reviewRepository.findByBookingId(b.getId()).isPresent());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<UserProfileDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    Long workerId = null;
                    if (u.getRole() == Role.ROLE_WORKER) {
                        workerId = workerProfileRepository.findByUserId(u.getId())
                                .map(WorkerProfile::getId)
                                .orElse(null);
                    }
                    return UserProfileDto.fromEntity(u, workerId);
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public UserProfileDto toggleUserActiveStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + userId));

        user.setActive(!user.isActive());
        User saved = userRepository.save(user);

        Long workerId = null;
        if (saved.getRole() == Role.ROLE_WORKER) {
            workerId = workerProfileRepository.findByUserId(saved.getId())
                    .map(WorkerProfile::getId)
                    .orElse(null);
        }

        return UserProfileDto.fromEntity(saved, workerId);
    }
}

