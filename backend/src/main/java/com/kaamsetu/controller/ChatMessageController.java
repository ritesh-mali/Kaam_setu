package com.kaamsetu.controller;

import com.kaamsetu.dto.ApiResponse;
import com.kaamsetu.dto.ChatMessageDto;
import com.kaamsetu.dto.ChatMessageRequest;
import com.kaamsetu.service.ChatMessageService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
public class ChatMessageController {

    private final ChatMessageService chatMessageService;

    public ChatMessageController(ChatMessageService chatMessageService) {
        this.chatMessageService = chatMessageService;
    }

    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<List<ChatMessageDto>>> getMessages(
            @PathVariable Long bookingId,
            Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            List<ChatMessageDto> messages = chatMessageService.getMessagesForBooking(bookingId, authentication.getName());
            return ResponseEntity.ok(ApiResponse.ok(messages));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }

    @PostMapping("/booking/{bookingId}")
    public ResponseEntity<ApiResponse<ChatMessageDto>> sendMessage(
            @PathVariable Long bookingId,
            Authentication authentication,
            @Valid @RequestBody ChatMessageRequest request) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(ApiResponse.error("Unauthorized"));
        }
        try {
            ChatMessageDto msg = chatMessageService.sendMessage(bookingId, authentication.getName(), request.getMessage());
            return ResponseEntity.ok(ApiResponse.ok("Message sent", msg));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        }
    }
}

