package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.dto.NotificationDto;
import com.kaamsetu.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NotificationDto>>> getNotifications(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            List<NotificationDto> list = notificationService.getUserNotifications(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(list));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            long count = notificationService.getUnreadCount(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(count));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<String>> markAllRead(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            notificationService.markAllAsRead(authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

