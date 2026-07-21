package com.example.demo.dto;

import com.example.demo.entity.Alert;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AlertDTO {
    private String id;
    private String patientId;
    private String doctorId;
    private String predictionId;
    private String title;
    private String message;
    private String severity;
    private String alertType;
    private Double triggerValue;
    private Double thresholdValue;
    private String triggerMetric;
    private Boolean isRead;
    private LocalDateTime acknowledgedAt;
    private String acknowledgedBy;
    private String patientName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static AlertDTO fromEntity(Alert alert) {
        if (alert == null) return null;
        return AlertDTO.builder()
                .id(alert.getId() != null ? alert.getId().toString() : null)
                .patientId(alert.getPatientId() != null ? alert.getPatientId().toString() : null)
                .doctorId(alert.getDoctorId() != null ? alert.getDoctorId().toString() : null)
                .predictionId(alert.getPredictionId() != null ? alert.getPredictionId().toString() : null)
                .title(alert.getTitle())
                .message(alert.getMessage())
                .severity(alert.getSeverity())
                .alertType(alert.getAlertType())
                .triggerValue(alert.getTriggerValue())
                .thresholdValue(alert.getThresholdValue())
                .triggerMetric(alert.getTriggerMetric())
                .isRead(alert.getIsRead())
                .acknowledgedAt(alert.getAcknowledgedAt())
                .acknowledgedBy(alert.getAcknowledgedBy())
                .patientName(alert.getPatientName())
                .createdAt(alert.getCreatedAt())
                .updatedAt(alert.getUpdatedAt())
                .build();
    }
}
