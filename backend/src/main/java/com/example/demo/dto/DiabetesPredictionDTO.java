package com.example.demo.dto;

import com.example.demo.entity.DiabetesPrediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DiabetesPredictionDTO {
    private String id;
    private String userId;
    private Integer pregnancies;
    private Integer glucose;
    private Integer bloodPressure;
    private Integer skinThickness;
    private Integer insulin;
    private BigDecimal bmi;
    private BigDecimal diabetesPedigreeFunction;
    private Integer age;
    private Integer predictionResult;
    private Double probabilityNoDiabetes;
    private Double probabilityDiabetes;
    private String predictionMessage;
    private Double confidenceLevel;
    private String confidenceText;
    private String riskLevel;
    private Double riskPercentage;
    private String modelVersion;
    private String featureImportance;
    private String recommendations;
    private Long predictionTimestamp;
    private LocalDateTime createdAt;
    private String reviewedBy;
    private String doctorNotes;
    private String status;

    public static DiabetesPredictionDTO fromEntity(DiabetesPrediction p) {
        if (p == null) return null;
        return DiabetesPredictionDTO.builder()
                .id(p.getId() != null ? p.getId().toString() : null)
                .userId(p.getUserId() != null ? p.getUserId().toString() : null)
                .pregnancies(p.getPregnancies())
                .glucose(p.getGlucose())
                .bloodPressure(p.getBloodPressure())
                .skinThickness(p.getSkinThickness())
                .insulin(p.getInsulin())
                .bmi(p.getBmi())
                .diabetesPedigreeFunction(p.getDiabetesPedigreeFunction())
                .age(p.getAge())
                .predictionResult(p.getPredictionResult())
                .probabilityNoDiabetes(p.getProbabilityNoDiabetes())
                .probabilityDiabetes(p.getProbabilityDiabetes())
                .predictionMessage(p.getPredictionMessage())
                .confidenceLevel(p.getConfidenceLevel())
                .confidenceText(p.getConfidenceText())
                .riskLevel(p.getRiskLevel())
                .riskPercentage(p.getRiskPercentage())
                .modelVersion(p.getModelVersion())
                .featureImportance(p.getFeatureImportance())
                .recommendations(p.getRecommendations())
                .predictionTimestamp(p.getPredictionTimestamp())
                .createdAt(p.getCreatedAt())
                .reviewedBy(p.getReviewedBy())
                .doctorNotes(p.getDoctorNotes())
                .status(p.getStatus())
                .build();
    }
}
