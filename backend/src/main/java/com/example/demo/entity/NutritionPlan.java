package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "nutrition_plans")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NutritionPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "target_calories", nullable = false)
    private Integer targetCalories;

    @Column(name = "target_protein")
    private Integer targetProtein;

    @Column(name = "target_carbs")
    private Integer targetCarbs;

    @Column(name = "target_fats")
    private Integer targetFats;

    @Column(name = "meals_json", nullable = false, columnDefinition = "TEXT")
    private String mealsJson;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
