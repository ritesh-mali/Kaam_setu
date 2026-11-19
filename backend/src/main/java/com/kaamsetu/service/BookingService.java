package com.kaamsetu.service;

import com.kaamsetu.dto.BookingCreateRequest;
import com.kaamsetu.dto.BookingDto;
import com.kaamsetu.dto.BookingStatusUpdateRequest;
import com.kaamsetu.dto.LocationUpdateRequest;
import com.kaamsetu.model.*;
import com.kaamsetu.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final ServiceCategoryRepository categoryRepository;
    private final ReviewRepository reviewRepository;
    private final NotificationService notificationService;

    private static final SecureRandom RANDOM = new SecureRandom();

    public BookingService(BookingRepository bookingRepository,
                          UserRepository userRepository,
                          WorkerProfileRepository workerProfileRepository,
                          ServiceCategoryRepository categoryRepository,
                          ReviewRepository reviewRepository,
                          NotificationService notificationService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.categoryRepository = categoryRepository;
        this.reviewRepository = reviewRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingDto createBooking(String customerEmail, BookingCreateRequest req) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerEmail));

        WorkerProfile worker = workerProfileRepository.findById(req.getWorkerId())
                .orElseThrow(() -> new RuntimeException("Worker not found with ID: " + req.getWorkerId()));

        ServiceCategory category = null;
        if (req.getCategoryId() != null) {
            category = categoryRepository.findById(req.getCategoryId()).orElse(worker.getCategory());
        } else {
            category = worker.getCategory();
        }

        Booking booking = new Booking();
        // Unique booking number: KS-202611-XXXX
        String datePrefix = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMM"));
        int randomSuffix = 1000 + RANDOM.nextInt(9000);
        booking.setBookingNumber("KS-" + datePrefix + "-" + randomSuffix);

        booking.setCustomer(customer);
        booking.setWorker(worker);
        booking.setCategory(category);
        booking.setServiceTitle(req.getServiceTitle());
        booking.setProblemDescription(req.getProblemDescription());
        booking.setScheduledDate(req.getScheduledDate());
        booking.setScheduledTimeSlot(req.getScheduledTimeSlot());
        booking.setAddress(req.getAddress());
        booking.setCity(req.getCity() != null ? req.getCity() : customer.getCity());
        booking.setContactPhone(req.getContactPhone() != null ? req.getContactPhone() : customer.getPhone());
        booking.setUrgency(req.getUrgency() != null ? req.getUrgency() : UrgencyLevel.NORMAL);
        booking.setStatus(BookingStatus.PENDING);

        // Generate 4-digit completion verification OTP
        int otp = 1000 + RANDOM.nextInt(9000);
        booking.setCompletionOtp(String.valueOf(otp));

        // Transparent pricing calculation
        double visitingFee = worker.getVisitingCharge() != null ? worker.getVisitingCharge() : 199.0;
        double hourlyRate = worker.getHourlyRate() != null ? worker.getHourlyRate() : 299.0;
        double emergencyExtra = (booking.getUrgency() == UrgencyLevel.EMERGENCY && worker.getEmergencyCharge() != null)
                ? worker.getEmergencyCharge() : 0.0;
        double initialEstimatedHours = 1.0;
        double initialTotal = visitingFee + hourlyRate + emergencyExtra;

        booking.setVisitingFee(visitingFee + emergencyExtra);
        booking.setHourlyRate(hourlyRate);
        booking.setEstimatedHours(initialEstimatedHours);
        booking.setPartsCost(0.0);
        booking.setTotalAmount(initialTotal);
        booking.setPaymentStatus("PENDING");

        // Geolocation & Live Tracking initialization
        if (req.getCustomerLatitude() != null && req.getCustomerLongitude() != null) {
            booking.setCustomerLatitude(req.getCustomerLatitude());
            booking.setCustomerLongitude(req.getCustomerLongitude());
        }

        if (worker.getLatitude() != null && worker.getLongitude() != null) {
            booking.setWorkerLatitude(worker.getLatitude());
            booking.setWorkerLongitude(worker.getLongitude());
            booking.setWorkerLocationName(worker.getCurrentLocationName());
            booking.setLastLocationUpdate(LocalDateTime.now());

            if (req.getCustomerLatitude() != null && req.getCustomerLongitude() != null) {
                double dist = WorkerService.calculateDistance(
                        req.getCustomerLatitude(), req.getCustomerLongitude(),
                        worker.getLatitude(), worker.getLongitude()
                );
                int eta = WorkerService.calculateEtaMinutes(dist);
                booking.setDistanceKm(dist);
                booking.setEstimatedArrivalMinutes(eta);
            }
        }

        Booking saved = bookingRepository.save(booking);

        // Notify Worker of incoming request
        notificationService.createNotification(
                worker.getUser(),
                "New Booking Request #" + saved.getBookingNumber(),
                customer.getName() + " requested " + saved.getServiceTitle() + " for " + saved.getScheduledDate(),
                "BOOKING_REQUEST",
                "/worker/dashboard"
        );

        return BookingDto.fromEntity(saved);
    }

    public List<BookingDto> getCustomerBookings(String customerEmail) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<Booking> bookings = bookingRepository.findByCustomerIdOrderByCreatedAtDesc(customer.getId());
        return bookings.stream()
                .map(b -> {
                    BookingDto dto = BookingDto.fromEntity(b);
                    dto.setHasReviewed(reviewRepository.findByBookingId(b.getId()).isPresent());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public List<BookingDto> getWorkerBookings(String workerEmail) {
        User workerUser = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("Worker user not found"));

        WorkerProfile profile = workerProfileRepository.findByUserId(workerUser.getId())
                .orElseThrow(() -> new RuntimeException("Worker profile not found"));

        List<Booking> bookings = bookingRepository.findByWorkerIdOrderByCreatedAtDesc(profile.getId());
        return bookings.stream()
                .map(b -> {
                    BookingDto dto = BookingDto.fromEntity(b);
                    // Worker doesn't see OTP until customer provides it to complete the job
                    dto.setHasReviewed(reviewRepository.findByBookingId(b.getId()).isPresent());
                    return dto;
                })
                .collect(Collectors.toList());
    }

    public BookingDto getBookingById(Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found with ID: " + id));
        BookingDto dto = BookingDto.fromEntity(booking);
        dto.setHasReviewed(reviewRepository.findByBookingId(booking.getId()).isPresent());
        return dto;
    }

    @Transactional
    public BookingDto updateBookingStatus(Long bookingId, String userEmail, BookingStatusUpdateRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        // Authorization check: User must be either customer, worker or admin
        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isCustomer && !isWorker && !isAdmin) {
            throw new RuntimeException("Unauthorized to modify this booking");
        }

        BookingStatus newStatus = req.getStatus();

        if (newStatus == BookingStatus.REJECTED) {
            if (!isWorker && !isAdmin) {
                throw new RuntimeException("Only the assigned worker or admin can reject this booking");
            }
            booking.setStatus(BookingStatus.REJECTED);
            booking.setRejectionReason(req.getRejectionReason() != null ? req.getRejectionReason() : "Worker unavailable at this slot");
            notificationService.createNotification(
                    booking.getCustomer(),
                    "Booking Declined #" + booking.getBookingNumber(),
                    "Technician was unable to take this slot. You can browse other available workers.",
                    "BOOKING_DECLINED",
                    "/workers"
            );
        } else if (newStatus == BookingStatus.ACCEPTED) {
            if (!isWorker && !isAdmin) {
                throw new RuntimeException("Only the assigned worker or admin can accept this booking");
            }
            booking.setStatus(BookingStatus.ACCEPTED);
            notificationService.createNotification(
                    booking.getCustomer(),
                    "Booking Confirmed #" + booking.getBookingNumber(),
                    booking.getWorker().getUser().getName() + " confirmed your appointment for " + booking.getScheduledDate(),
                    "BOOKING_ACCEPTED",
                    "/customer/dashboard"
            );
        } else if (newStatus == BookingStatus.IN_PROGRESS) {
            if (!isWorker && !isAdmin) {
                throw new RuntimeException("Only the assigned worker can start the job");
            }
            booking.setStatus(BookingStatus.IN_PROGRESS);
            notificationService.createNotification(
                    booking.getCustomer(),
                    "Technician Arrived #" + booking.getBookingNumber(),
                    booking.getWorker().getUser().getName() + " has arrived and started the service work.",
                    "WORK_IN_PROGRESS",
                    "/customer/dashboard"
            );
        } else if (newStatus == BookingStatus.COMPLETED) {
            if (!isWorker && !isAdmin) {
                throw new RuntimeException("Only the assigned worker or admin can complete the job");
            }
            // OTP verification for secure job completion
            if (!isAdmin) {
                if (req.getOtp() == null || !req.getOtp().trim().equals(booking.getCompletionOtp())) {
                    throw new RuntimeException("Invalid completion OTP. Please ask the customer for the 4-digit OTP.");
                }
            }

            booking.setStatus(BookingStatus.COMPLETED);
            booking.setCompletedAt(LocalDateTime.now());

            if (req.getEstimatedHours() != null && req.getEstimatedHours() > 0) {
                booking.setEstimatedHours(req.getEstimatedHours());
            }
            if (req.getPartsCost() != null && req.getPartsCost() >= 0) {
                booking.setPartsCost(req.getPartsCost());
            }
            if (req.getWorkerNotes() != null) {
                booking.setWorkerNotes(req.getWorkerNotes());
            }

            // Recalculate transparent final invoice
            double total = (booking.getVisitingFee() != null ? booking.getVisitingFee() : 0.0)
                    + ((booking.getHourlyRate() != null ? booking.getHourlyRate() : 0.0) * booking.getEstimatedHours())
                    + (booking.getPartsCost() != null ? booking.getPartsCost() : 0.0);
            booking.setTotalAmount(Math.round(total * 100.0) / 100.0);
            booking.setPaymentStatus(req.getPaymentStatus() != null ? req.getPaymentStatus() : "PAID_CASH");

            // Update Worker completed count
            WorkerProfile worker = booking.getWorker();
            worker.setCompletedJobsCount(worker.getCompletedJobsCount() + 1);
            workerProfileRepository.save(worker);

            // Notify Customer that digital invoice is ready
            notificationService.createNotification(
                    booking.getCustomer(),
                    "Job Completed & Invoice Ready #" + booking.getBookingNumber(),
                    "Service verified via OTP. Total: ₹" + booking.getTotalAmount() + ". Tap to view digital invoice or leave a review.",
                    "JOB_COMPLETED",
                    "/customer/dashboard"
            );

        } else if (newStatus == BookingStatus.CANCELLED) {
            if (booking.getStatus() == BookingStatus.COMPLETED) {
                throw new RuntimeException("Cannot cancel an already completed booking");
            }
            booking.setStatus(BookingStatus.CANCELLED);
            if (req.getRejectionReason() != null) {
                booking.setRejectionReason(req.getRejectionReason());
            }
        }

        Booking updated = bookingRepository.save(booking);
        BookingDto dto = BookingDto.fromEntity(updated);
        dto.setHasReviewed(reviewRepository.findByBookingId(updated.getId()).isPresent());
        return dto;
    }

    @Transactional
    public BookingDto updateBookingLocation(Long bookingId, String userEmail, LocationUpdateRequest req) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        boolean isWorker = booking.getWorker().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isWorker && !isAdmin) {
            throw new RuntimeException("Only the assigned worker can update the live location for this booking");
        }

        booking.setWorkerLatitude(req.getLatitude());
        booking.setWorkerLongitude(req.getLongitude());
        if (req.getLocationName() != null && !req.getLocationName().isBlank()) {
            booking.setWorkerLocationName(req.getLocationName());
        }
        booking.setLastLocationUpdate(LocalDateTime.now());

        if (booking.getCustomerLatitude() != null && booking.getCustomerLongitude() != null) {
            double dist = WorkerService.calculateDistance(
                    booking.getCustomerLatitude(), booking.getCustomerLongitude(),
                    req.getLatitude(), req.getLongitude()
            );
            int eta = WorkerService.calculateEtaMinutes(dist);
            booking.setDistanceKm(dist);
            booking.setEstimatedArrivalMinutes(eta);
        }

        // Also update worker's profile location
        WorkerProfile profile = booking.getWorker();
        profile.setLatitude(req.getLatitude());
        profile.setLongitude(req.getLongitude());
        if (req.getLocationName() != null && !req.getLocationName().isBlank()) {
            profile.setCurrentLocationName(req.getLocationName());
        }
        profile.setLastLocationUpdate(LocalDateTime.now());
        workerProfileRepository.save(profile);

        Booking saved = bookingRepository.save(booking);
        return BookingDto.fromEntity(saved);
    }

    public BookingDto getLiveTracking(Long bookingId, String userEmail) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + userEmail));

        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(currentUser.getId());
        boolean isAdmin = currentUser.getRole() == Role.ROLE_ADMIN;

        if (!isCustomer && !isWorker && !isAdmin) {
            throw new RuntimeException("Unauthorized to view live tracking for this booking");
        }

        return BookingDto.fromEntity(booking);
    }
}

