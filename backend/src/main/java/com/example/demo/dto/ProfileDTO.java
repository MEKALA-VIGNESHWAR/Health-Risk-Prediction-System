package com.example.demo.dto;

import com.example.demo.entity.User;

import java.time.LocalDate;
import java.time.Period;

/**
 * Full health-profile view of a User, with server-computed {@code age},
 * {@code bmi} and {@code bmiCategory}. Read-only fields (username/email/role)
 * are included for display.
 */
public record ProfileDTO(
        String userId,
        String username,
        String email,
        String role,
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
        String bmiCategory,
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
    public static ProfileDTO from(User u) {
        Integer age = computeAge(u.getDateOfBirth());
        Double bmi = computeBmi(u.getHeightCm(), u.getWeightKg());
        return new ProfileDTO(
                u.getId() != null ? u.getId().toString() : null,
                u.getUsername(),
                u.getEmail(),
                u.getRole() != null ? u.getRole().name() : "PATIENT",
                u.getFirstName(),
                u.getLastName(),
                u.getAvatarUrl(),
                u.getPhone(),
                u.getGender(),
                u.getDateOfBirth(),
                age,
                u.getHeightCm(),
                u.getWeightKg(),
                bmi,
                bmiCategory(bmi),
                u.getBloodGroup(),
                u.getMedicalHistory(),
                u.getCurrentMedications(),
                u.getAllergies(),
                u.getEmergencyContactName(),
                u.getEmergencyContactPhone(),
                u.getEmergencyContactRelation(),
                u.getSmokingStatus(),
                u.getAlcoholUse(),
                u.getExerciseLevel(),
                u.getSleepHours(),
                u.getWaterIntakeLiters());
    }

    private static Integer computeAge(LocalDate dob) {
        if (dob == null) return null;
        return Period.between(dob, LocalDate.now()).getYears();
    }

    private static Double computeBmi(Double heightCm, Double weightKg) {
        if (heightCm == null || weightKg == null || heightCm <= 0) return null;
        double m = heightCm / 100.0;
        double bmi = weightKg / (m * m);
        return Math.round(bmi * 10.0) / 10.0;
    }

    private static String bmiCategory(Double bmi) {
        if (bmi == null) return null;
        if (bmi < 18.5) return "Underweight";
        if (bmi < 25) return "Healthy";
        if (bmi < 30) return "Overweight";
        return "Obese";
    }
}
