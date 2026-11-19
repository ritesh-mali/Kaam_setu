package com.kaamsetu.controller;

import com.kaamsetu.dto.*;
import com.kaamsetu.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getPlatformStats();
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/workers")
    public ResponseEntity<ApiResponse<List<WorkerProfileDto>>> getAllWorkers() {
        List<WorkerProfileDto> workers = adminService.getAllWorkers();
        return ResponseEntity.ok(ApiResponse.ok(workers));
    }

    @PostMapping("/workers/{workerId}/verify")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> verifyWorker(
            @PathVariable Long workerId,
            @Valid @RequestBody WorkerVerificationRequest request) {
        try {
            WorkerProfileDto updated = adminService.verifyWorker(workerId, request);
            return ResponseEntity.ok(ApiResponse.ok("Worker verification status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/bookings")
    public ResponseEntity<ApiResponse<List<BookingDto>>> getAllBookings() {
        List<BookingDto> bookings = adminService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.ok(bookings));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserProfileDto>>> getAllUsers() {
        List<UserProfileDto> users = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(users));
    }

    @PatchMapping("/users/{userId}/toggle-status")
    public ResponseEntity<ApiResponse<UserProfileDto>> toggleUserStatus(@PathVariable Long userId) {
        try {
            UserProfileDto updated = adminService.toggleUserActiveStatus(userId);
            return ResponseEntity.ok(ApiResponse.ok("User status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

