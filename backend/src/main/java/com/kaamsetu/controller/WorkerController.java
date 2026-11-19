package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.dto.LocationUpdateRequest;
import com.kaamsetu.dto.WorkerProfileDto;
import com.kaamsetu.dto.WorkerUpdateRequest;
import com.kaamsetu.service.WorkerService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workers")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<WorkerProfileDto>>> searchWorkers(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String city,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) Boolean availableOnly,
            @RequestParam(required = false) Double maxRate,
            @RequestParam(required = false) Double customerLat,
            @RequestParam(required = false) Double customerLon,
            @RequestParam(required = false) Double maxDistanceKm,
            @RequestParam(required = false) Boolean sortByDistance) {
        List<WorkerProfileDto> results = workerService.searchWorkers(
                category, city, verifiedOnly, availableOnly, maxRate,
                customerLat, customerLon, maxDistanceKm, sortByDistance
        );
        return ResponseEntity.ok(ApiResponse.ok(results));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> getWorkerById(@PathVariable Long id) {
        try {
            WorkerProfileDto worker = workerService.getWorkerById(id);
            return ResponseEntity.ok(ApiResponse.ok(worker));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> getCurrentWorkerProfile(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            WorkerProfileDto worker = workerService.getWorkerByUserEmail(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(worker));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> updateWorkerProfile(
            Authentication authentication,
            @RequestBody WorkerUpdateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            WorkerProfileDto updated = workerService.updateProfile(authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Worker profile updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/me/availability")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> toggleAvailability(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            WorkerProfileDto updated = workerService.toggleAvailability(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok("Availability status updated", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/me/location")
    public ResponseEntity<ApiResponse<WorkerProfileDto>> updateWorkerLocation(
            Authentication authentication,
            @RequestBody LocationUpdateRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            WorkerProfileDto updated = workerService.updateWorkerLocation(authentication.getName(), request);
            return ResponseEntity.ok(ApiResponse.ok("Worker live location updated successfully", updated));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}
