package com.example.demo.dto;

import com.example.demo.entity.MedicalReport;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private String id;
    private String userId;
    private String fileName;
    private String fileType;
    private String extractedText;
    private String structuredData;
    private String abnormalities;
    private String recommendations;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static ReportDTO fromEntity(MedicalReport report) {
        if (report == null) return null;
        return ReportDTO.builder()
                .id(report.getId() != null ? report.getId().toString() : null)
                .userId(report.getUserId() != null ? report.getUserId().toString() : null)
                .fileName(report.getFileName())
                .fileType(report.getFileType())
                .extractedText(report.getExtractedText())
                .structuredData(report.getStructuredData())
                .abnormalities(report.getAbnormalities())
                .recommendations(report.getRecommendations())
                .status(report.getStatus())
                .createdAt(report.getCreatedAt())
                .updatedAt(report.getUpdatedAt())
                .build();
    }
}
