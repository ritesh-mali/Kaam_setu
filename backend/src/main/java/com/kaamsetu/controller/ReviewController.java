package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.dto.ReviewCreateRequest;
import com.kaamsetu.dto.ReviewDto;
import com.kaamsetu.dto.ReviewResponseRequest;
import com.kaamsetu.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ReviewDto>> addReview(
            Authentication authentication,
            @Valid @RequestBody ReviewCreateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            ReviewDto review = reviewService.addReview(authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", review));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/worker/{workerId}")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getWorkerReviews(@PathVariable Long workerId) {
        List<ReviewDto> list = reviewService.getReviewsForWorker(workerId);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PostMapping("/{reviewId}/reply")
    public ResponseEntity<ApiResponse<ReviewDto>> replyToReview(
            @PathVariable Long reviewId,
            Authentication authentication,
            @Valid @RequestBody ReviewResponseRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            ReviewDto updated = reviewService.replyToReview(authentication.getName(), reviewId, request.getWorkerReply());
            return ResponseEntity.ok(ApiResponse.ok("Reply added successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

