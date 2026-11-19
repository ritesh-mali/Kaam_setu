package com.kaamsetu.service;

import com.kaamsetu.dto.ChatMessageDto;
import com.kaamsetu.model.Booking;
import com.kaamsetu.model.ChatMessage;
import com.kaamsetu.model.User;
import com.kaamsetu.repository.BookingRepository;
import com.kaamsetu.repository.ChatMessageRepository;
import com.kaamsetu.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ChatMessageService(ChatMessageRepository chatMessageRepository,
                              BookingRepository bookingRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.chatMessageRepository = chatMessageRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public List<ChatMessageDto> getMessagesForBooking(Long bookingId, String userEmail) {
        User currentUser = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        // Ensure user is participant
        boolean isCustomer = booking.getCustomer().getId().equals(currentUser.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(currentUser.getId());

        if (!isCustomer && !isWorker) {
            throw new RuntimeException("Access denied: You are not part of this booking conversation.");
        }

        List<ChatMessage> messages = chatMessageRepository.findByBookingIdOrderByCreatedAtAsc(bookingId);

        // Mark incoming messages as read
        for (ChatMessage m : messages) {
            if (m.getRecipient().getId().equals(currentUser.getId()) && !m.isRead()) {
                m.setRead(true);
                chatMessageRepository.save(m);
            }
        }

        return messages.stream().map(ChatMessageDto::fromEntity).collect(Collectors.toList());
    }

    @Transactional
    public ChatMessageDto sendMessage(Long bookingId, String senderEmail, String text) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));

        boolean isCustomer = booking.getCustomer().getId().equals(sender.getId());
        boolean isWorker = booking.getWorker().getUser().getId().equals(sender.getId());

        if (!isCustomer && !isWorker) {
            throw new RuntimeException("Access denied: You are not part of this booking conversation.");
        }

        User recipient = isCustomer ? booking.getWorker().getUser() : booking.getCustomer();

        ChatMessage chatMessage = new ChatMessage(booking, sender, recipient, text);
        ChatMessage saved = chatMessageRepository.save(chatMessage);

        // Notify recipient of new message
        notificationService.createNotification(
                recipient,
                "New message from " + sender.getName(),
                text.length() > 60 ? text.substring(0, 57) + "..." : text,
                "CHAT_MESSAGE",
                isCustomer ? "/worker/dashboard" : "/customer/dashboard"
        );

        return ChatMessageDto.fromEntity(saved);
    }
}

