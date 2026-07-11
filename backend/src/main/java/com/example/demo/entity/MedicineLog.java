package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "medicine_logs", indexes = {
    @Index(name = "idx_med_logs_reminder", columnList = "reminder_id"),
    @Index(name = "idx_med_logs_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicineLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "reminder_id", nullable = false)
    private UUID reminderId;

    @Column(name = "scheduled_time", nullable = false)
    private LocalDateTime scheduledTime;

    @Column(name = "logged_time")
    private LocalDateTime loggedTime;

    @Column(nullable = false)
    private String status; // TAKEN, MISSED, SNOOZED
}
