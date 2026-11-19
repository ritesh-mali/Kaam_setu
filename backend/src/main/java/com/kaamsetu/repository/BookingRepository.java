package com.kaamsetu.repository;

import com.kaamsetu.model.Booking;
import com.kaamsetu.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BookingRepository extends JpaRepository<Booking, Long> {
    Optional<Booking> findByBookingNumber(String bookingNumber);
    List<Booking> findByCustomerIdOrderByCreatedAtDesc(Long customerId);
    List<Booking> findByWorkerIdOrderByCreatedAtDesc(Long workerId);
    List<Booking> findByWorkerUserIdOrderByCreatedAtDesc(Long userId);
    List<Booking> findByWorkerIdAndStatusIn(Long workerId, List<BookingStatus> statuses);
    List<Booking> findByStatus(BookingStatus status);

    long countByStatus(BookingStatus status);

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.status = 'COMPLETED'")
    Double calculateTotalRevenue();

    @Query("SELECT COALESCE(SUM(b.totalAmount), 0) FROM Booking b WHERE b.worker.id = :workerId AND b.status = 'COMPLETED'")
    Double calculateWorkerEarnings(Long workerId);
}

