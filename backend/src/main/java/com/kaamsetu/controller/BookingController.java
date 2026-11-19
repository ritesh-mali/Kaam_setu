package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.dto.BookingCreateRequest;
import com.kaamsetu.dto.BookingDto;
import com.kaamsetu.dto.BookingStatusUpdateRequest;
import com.kaamsetu.dto.LocationUpdateRequest;
import com.kaamsetu.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<BookingDto>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingCreateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            BookingDto booking = bookingService.createBooking(authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Booking requested successfully", booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/customer")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getCustomerBookings(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            List<BookingDto> list = bookingService.getCustomerBookings(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/worker")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getWorkerBookings(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            List<BookingDto> list = bookingService.getWorkerBookings(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<BookingDto>> getBookingById(@PathVariable Long id) {
        try {
            BookingDto booking = bookingService.getBookingById(id);
            return ResponseEntity.ok(ApiResponse.ok(booking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingStatus(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody BookingStatusUpdateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            BookingDto updated = bookingService.updateBookingStatus(id, authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Booking status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/{id}/location")
    public ResponseEntity<ApiResponse<BookingDto>> updateBookingLocation(
            @PathVariable Long id,
            Authentication authentication,
            @RequestBody LocationUpdateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            BookingDto updated = bookingService.updateBookingLocation(id, authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Live trip location broadcasted", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/{id}/live-tracking")
    public ResponseEntity<ApiResponse<BookingDto>> getLiveTracking(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            BookingDto tracking = bookingService.getLiveTracking(id, authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok("Live tracking details", tracking));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

