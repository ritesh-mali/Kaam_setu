package com.kaamsetu.service;

import com.kaamsetu.dto.ReviewCreateRequest;
import com.kaamsetu.dto.ReviewDto;
import com.kaamsetu.model.Booking;
import com.kaamsetu.model.BookingStatus;
import com.kaamsetu.model.Review;
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
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         UserRepository userRepository,
                         WorkerProfileRepository workerProfileRepository,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.workerProfileRepository = workerProfileRepository;
        this.notificationService = notificationService;
    }

    @Transactional
    public ReviewDto addReview(String customerEmail, ReviewCreateRequest req) {
        User customer = userRepository.findByEmail(customerEmail)
                .orElseThrow(() -> new RuntimeException("Customer not found: " + customerEmail));

        Booking booking = bookingRepository.findById(req.getBookingId())
                .orElseThrow(() -> new RuntimeException("Booking not found: " + req.getBookingId()));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new RuntimeException("You can only review your own bookings");
        }

        if (booking.getStatus() != BookingStatus.COMPLETED) {
            throw new RuntimeException("Reviews can only be submitted for completed jobs");
        }

        if (reviewRepository.findByBookingId(booking.getId()).isPresent()) {
            throw new RuntimeException("A review has already been submitted for this booking");
        }

        Review review = new Review();
        review.setBooking(booking);
        review.setCustomer(customer);
        review.setWorker(booking.getWorker());
        review.setRating(req.getRating());
        review.setComment(req.getComment());

        Review saved = reviewRepository.save(review);

        // Update worker's average rating and total reviews
        WorkerProfile worker = booking.getWorker();
        Double avgRating = reviewRepository.calculateAverageRatingForWorker(worker.getId());
        long count = reviewRepository.countByWorkerId(worker.getId());

        if (avgRating != null) {
            worker.setRating(Math.round(avgRating * 10.0) / 10.0);
        }
        worker.setTotalReviews((int) count);
        workerProfileRepository.save(worker);

        // Notify Worker of review received
        notificationService.createNotification(
                worker.getUser(),
                "New " + req.getRating() + "★ Review Received!",
                customer.getName() + " left a review: \"" + (req.getComment() != null ? req.getComment() : "Excellent service!") + "\"",
                "REVIEW_RECEIVED",
                "/worker/dashboard"
        );

        return ReviewDto.fromEntity(saved);
    }

    public List<ReviewDto> getReviewsForWorker(Long workerId) {
        List<Review> reviews = reviewRepository.findByWorkerIdOrderByCreatedAtDesc(workerId);
        return reviews.stream().map(ReviewDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ReviewDto replyToReview(String workerEmail, Long reviewId, String reply) {
        User workerUser = userRepository.findByEmail(workerEmail)
                .orElseThrow(() -> new RuntimeException("User not found: " + workerEmail));

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found with ID: " + reviewId));

        if (!review.getWorker().getUser().getId().equals(workerUser.getId())) {
            throw new RuntimeException("Unauthorized to reply to this review");
        }

        review.setWorkerReply(reply);
        Review saved = reviewRepository.save(review);
        return ReviewDto.fromEntity(saved);
    }
}

