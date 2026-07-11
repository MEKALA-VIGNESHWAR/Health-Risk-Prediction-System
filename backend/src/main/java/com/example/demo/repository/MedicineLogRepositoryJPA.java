package com.example.demo.repository;

import com.example.demo.entity.MedicineLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MedicineLogRepositoryJPA extends JpaRepository<MedicineLog, UUID> {
    List<MedicineLog> findByReminderId(UUID reminderId);
    Optional<MedicineLog> findByReminderIdAndScheduledTime(UUID reminderId, LocalDateTime scheduledTime);

    @Query("SELECT ml FROM MedicineLog ml JOIN MedicineReminder mr ON ml.reminderId = mr.id WHERE mr.userId = :userId ORDER BY ml.scheduledTime DESC")
    List<MedicineLog> findRecentLogsByUserId(@Param("userId") UUID userId);
}
