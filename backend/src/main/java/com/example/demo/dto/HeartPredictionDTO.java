package com.example.demo.dto;

import com.example.demo.entity.HeartPrediction;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class HeartPredictionDTO {
    private String id;
    private String userId;
    private Integer age;
    private Integer sex;
    private Integer cp;
    private Double trestbps;
    private Double chol;
    private Integer fbs;
    private Integer restecg;
    private Double thalch;
    private Integer exang;
    private Double oldpeak;
    private Integer slope;
    private Integer ca;
    private Integer thal;
    private Integer predictionResult;
    private Double diseaseProbability;
    private Double noDiseaseProbability;
    private String predictionMessage;
    private Double confidenceLevel;
    private String riskLevel;
    private Double riskPercentage;
    private String modelVersion;
    private String featureImportance;
    private String recommendations;
    private Long predictionTimestamp;
    private LocalDateTime createdAt;

    public static HeartPredictionDTO fromEntity(HeartPrediction p) {
        if (p == null) return null;
        return HeartPredictionDTO.builder()
                .id(p.getId() != null ? p.getId().toString() : null)
                .userId(p.getUserId() != null ? p.getUserId().toString() : null)
                .age(p.getAge())
                .sex(p.getSex())
                .cp(p.getCp())
                .trestbps(p.getTrestbps())
                .chol(p.getChol())
                .fbs(p.getFbs())
                .restecg(p.getRestecg())
                .thalch(p.getThalch())
                .exang(p.getExang())
                .oldpeak(p.getOldpeak())
                .slope(p.getSlope())
                .ca(p.getCa())
                .thal(p.getThal())
                .predictionResult(p.getPredictionResult())
                .diseaseProbability(p.getDiseaseProbability())
                .noDiseaseProbability(p.getNoDiseaseProbability())
                .predictionMessage(p.getPredictionMessage())
                .confidenceLevel(p.getConfidenceLevel())
                .riskLevel(p.getRiskLevel())
                .riskPercentage(p.getRiskPercentage())
                .modelVersion(p.getModelVersion())
                .featureImportance(p.getFeatureImportance())
                .recommendations(p.getRecommendations())
                .predictionTimestamp(p.getPredictionTimestamp())
                .createdAt(p.getCreatedAt())
                .build();
    }
}
