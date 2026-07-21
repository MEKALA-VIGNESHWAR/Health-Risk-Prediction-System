package com.example.demo.dto;

import com.example.demo.entity.MedicineReminder;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicineReminderDTO {
    private String id;
    private String userId;
    private String medicineName;
    private String dosage;
    private String frequency;
    private String times;
    private LocalDate startDate;
    private LocalDate endDate;
    private Boolean active;
    private LocalDateTime createdAt;

    public static MedicineReminderDTO fromEntity(MedicineReminder reminder) {
        if (reminder == null) return null;
        return MedicineReminderDTO.builder()
                .id(reminder.getId() != null ? reminder.getId().toString() : null)
                .userId(reminder.getUserId() != null ? reminder.getUserId().toString() : null)
                .medicineName(reminder.getMedicineName())
                .dosage(reminder.getDosage())
                .frequency(reminder.getFrequency())
                .times(reminder.getTimes())
                .startDate(reminder.getStartDate())
                .endDate(reminder.getEndDate())
                .active(reminder.getActive())
                .createdAt(reminder.getCreatedAt())
                .build();
    }
}
