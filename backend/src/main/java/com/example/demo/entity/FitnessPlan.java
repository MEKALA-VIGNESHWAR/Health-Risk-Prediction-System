package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "fitness_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FitnessPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(nullable = false)
    private String difficulty;

    @Column(name = "weekly_frequency", nullable = false)
    private Integer weeklyFrequency;

    @Column(name = "routines_json", nullable = false, columnDefinition = "TEXT")
    private String routinesJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
