package com.example.demo.dto;

import java.time.LocalDate;

/**
 * Editable health-profile fields. Sent as a full snapshot by the profile form,
 * so nulls are applied (clearing a field). Identity fields (username/email/role)
 * are intentionally NOT editable here.
 */
public record ProfileUpdateRequest(
        String firstName,
        String lastName,
        String avatarUrl,
        String phone,
        String gender,
        LocalDate dateOfBirth,
        Integer age,
        Double heightCm,
        Double weightKg,
        Double bmi,
        String bloodGroup,
        String medicalHistory,
        String currentMedications,
        String allergies,
        String emergencyContactName,
        String emergencyContactPhone,
        String emergencyContactRelation,
        String smokingStatus,
        String alcoholUse,
        String exerciseLevel,
        Double sleepHours,
        Double waterIntakeLiters
) {
}
