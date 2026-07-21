package com.example.demo.dto;

import com.example.demo.entity.DoctorNote;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorNoteDTO {
    private String id;
    private String patientId;
    private String doctorId;
    private String predictionId;
    private String content;
    private String noteType;
    private String doctorName;
    private String patientName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static DoctorNoteDTO fromEntity(DoctorNote note) {
        if (note == null) return null;
        return DoctorNoteDTO.builder()
                .id(note.getId() != null ? note.getId().toString() : null)
                .patientId(note.getPatientId() != null ? note.getPatientId().toString() : null)
                .doctorId(note.getDoctorId() != null ? note.getDoctorId().toString() : null)
                .predictionId(note.getPredictionId() != null ? note.getPredictionId().toString() : null)
                .content(note.getContent())
                .noteType(note.getNoteType())
                .doctorName(note.getDoctorName())
                .patientName(note.getPatientName())
                .createdAt(note.getCreatedAt())
                .updatedAt(note.getUpdatedAt())
                .build();
    }
}
