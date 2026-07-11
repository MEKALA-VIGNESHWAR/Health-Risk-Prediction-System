package com.example.demo.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DiabetesPrediction Entity - Enhanced with advanced metrics
 * Stores comprehensive diabetes prediction results in Supabase PostgreSQL
 * Includes: predictions, probabilities, confidence levels, risk levels, and feature importance
 */
@Entity
@Table(name = "diabetes_predictions", indexes = {
    @Index(name = "idx_predictions_user_id", columnList = "user_id"),
    @Index(name = "idx_predictions_result", columnList = "prediction_result"),
    @Index(name = "idx_predictions_risk_level", columnList = "risk_level"),
    @Index(name = "idx_predictions_created_at", columnList = "created_at")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiabetesPrediction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", insertable = false, updatable = false)
    private User user;

    // ===== INPUT FEATURES =====
    @Column(nullable = false)
    private Integer pregnancies;

    @Column(nullable = false)
    private Integer glucose;

    @Column(name = "blood_pressure")
    private Integer bloodPressure;

    @Column(name = "skin_thickness")
    private Integer skinThickness;

    @Column(nullable = false)
    private Integer insulin;

    @Column(nullable = false)
    private java.math.BigDecimal bmi;

    @Column(name = "diabetes_pedigree_function")
    private java.math.BigDecimal diabetesPedigreeFunction;

    @Column(nullable = false)
    private Integer age;

    // ===== PREDICTION RESULTS =====
    @Column(name = "prediction_result")
    private Integer predictionResult;

    @Column(name = "probability_no_diabetes")
    private Double probabilityNoDiabetes;

    @Column(name = "probability_diabetes")
    private Double probabilityDiabetes;

    @Column(name = "prediction_message", length = 500)
    private String predictionMessage;

    // ===== ENHANCED METRICS =====
    @Column(name = "confidence_level")
    private Double confidenceLevel;

    @Column(name = "confidence_text", length = 255)
    private String confidenceText;

    @Column(name = "risk_level", length = 20)
    private String riskLevel;  // LOW, MEDIUM, HIGH, CRITICAL

    @Column(name = "risk_percentage")
    private Double riskPercentage;  // Risk as percentage 0-100

    @Column(name = "model_version", length = 50)
    private String modelVersion;

    // ===== FEATURE IMPORTANCE (JSON stored as string) =====
    @Column(name = "feature_importance", columnDefinition = "TEXT")
    private String featureImportance;

    // ===== RECOMMENDATIONS (JSON stored as string) =====
    @Column(name = "recommendations", columnDefinition = "TEXT")
    private String recommendations;

    // ===== METADATA =====
    @Column(name = "prediction_timestamp")
    private Long predictionTimestamp;

    @Column(name = "created_date", nullable = false, updatable = false)
    private Long createdDate;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ===== AUDIT & WORKFLOW =====
    @Column(name = "reviewed_by", length = 255)
    private String reviewedBy;

    @Column(name = "doctor_notes", columnDefinition = "TEXT")
    private String doctorNotes;

    @Column(name = "status", length = 50)
    private String status;  // PENDING, REVIEWED, CONFIRMED, ARCHIVED

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (createdDate == null) {
            createdDate = System.currentTimeMillis();
        }
        if (predictionTimestamp == null) {
            predictionTimestamp = System.currentTimeMillis();
        }
        if (status == null) {
            status = "PENDING";
        }
        if (modelVersion == null) {
            modelVersion = "Calibrated Ensemble v2.0";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
