package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_vitals", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "log_date"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyVitals {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "log_date", nullable = false)
    private LocalDate logDate;

    @Column(name = "water_intake_ml")
    private Integer waterIntakeMl = 0;

    @Column(name = "sleep_hours")
    private Double sleepHours = 0.0;

    @Column(name = "calories_consumed")
    private Integer caloriesConsumed = 0;

    @Column(name = "calories_burned")
    private Integer caloriesBurned = 0;

    @Column(name = "exercise_minutes")
    private Integer exerciseMinutes = 0;

    @Column(name = "weight_kg")
    private Double weightKg;

    @Column(name = "systolic_bp")
    private Integer systolicBp;

    @Column(name = "diastolic_bp")
    private Integer diastolicBp;

    @Column(name = "blood_sugar")
    private Integer bloodSugar;

    @Column(name = "heart_rate")
    private Integer heartRate;
}
