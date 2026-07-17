package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * User Entity - represents a user in Supabase PostgreSQL
 */
@Entity
@Table(name = "users", indexes = {
    @Index(name = "idx_users_username", columnList = "username"),
    @Index(name = "idx_users_email", columnList = "email")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name")
    private String firstName;

    @Column(name = "last_name")
    private String lastName;

    @Column(name = "role", nullable = false)
    @Enumerated(EnumType.STRING)
    private UserRole role = UserRole.PATIENT;

    // ── Health profile (all optional; added additively via ddl-auto=update) ──
    @Column(name = "avatar_url", columnDefinition = "TEXT")
    private String avatarUrl;

    @Column(name = "phone")
    private String phone;

    @Column(name = "gender")
    private String gender;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Column(name = "height_cm")
    private Double heightCm;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "age")
    private Integer age;

    @Column(name = "bmi")
    private Double bmi;

    @Column(name = "blood_group")
    private String bloodGroup;

    @Column(name = "medical_history", columnDefinition = "TEXT")
    private String medicalHistory;

    @Column(name = "current_medications", columnDefinition = "TEXT")
    private String currentMedications;

    @Column(name = "allergies", columnDefinition = "TEXT")
    private String allergies;

    @Column(name = "emergency_contact_name")
    private String emergencyContactName;

    @Column(name = "emergency_contact_phone")
    private String emergencyContactPhone;

    @Column(name = "emergency_contact_relation")
    private String emergencyContactRelation;

    // Lifestyle
    @Column(name = "smoking_status")
    private String smokingStatus; // never | former | current

    @Column(name = "alcohol_use")
    private String alcoholUse; // none | occasional | regular

    @Column(name = "exercise_level")
    private String exerciseLevel; // sedentary | light | moderate | active

    @Column(name = "sleep_hours")
    private Double sleepHours;

    @Column(name = "water_intake_liters")
    private Double waterIntakeLiters;

    @Column(name = "created_date", nullable = false, updatable = false)
    private Long createdDate;

    @Column(name = "updated_date")
    private Long updatedDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (createdDate == null) {
            createdDate = System.currentTimeMillis();
        }
        updatedAt = LocalDateTime.now();
        updatedDate = System.currentTimeMillis();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
        updatedDate = System.currentTimeMillis();
    }
}

