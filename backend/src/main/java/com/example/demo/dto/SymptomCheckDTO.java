package com.example.demo.dto;

import com.example.demo.entity.SymptomCheck;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomCheckDTO {
    private String id;
    private String userId;
    private String symptoms;
    private String duration;
    private String severity;
    private String medicalHistory;
    private String medications;
    private String analysisResult;
    private LocalDateTime createdAt;

    public static SymptomCheckDTO fromEntity(SymptomCheck check) {
        if (check == null) return null;
        return SymptomCheckDTO.builder()
                .id(check.getId() != null ? check.getId().toString() : null)
                .userId(check.getUserId() != null ? check.getUserId().toString() : null)
                .symptoms(check.getSymptoms())
                .duration(check.getDuration())
                .severity(check.getSeverity())
                .medicalHistory(check.getMedicalHistory())
                .medications(check.getMedications())
                .analysisResult(check.getAnalysisResult())
                .createdAt(check.getCreatedAt())
                .build();
    }
}
