package com.example.demo.controller;

import com.example.demo.dto.ProfileDTO;
import com.example.demo.dto.ProfileUpdateRequest;
import com.example.demo.entity.User;
import com.example.demo.repository.UserRepositoryJPA;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

/**
 * Self-service health profile for the authenticated user. Additive — reuses the
 * existing User table (extended with optional profile columns) and the existing
 * token auth (the filter sets the principal to the username).
 */
@RestController
@RequestMapping("/api/profile")
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProfileController {

    // ~1.5MB cap on the avatar data URL to keep the row lean.
    private static final int MAX_AVATAR_LEN = 1_500_000;

    private final UserRepositoryJPA userRepository;

    public ProfileController(UserRepositoryJPA userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyProfile(Authentication auth) {
        Optional<User> user = currentUser(auth);
        return user.<ResponseEntity<?>>map(u -> ResponseEntity.ok(ProfileDTO.from(u)))
                .orElseGet(() -> unauthorized());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMyProfile(@RequestBody ProfileUpdateRequest req, Authentication auth) {
        Optional<User> found = currentUser(auth);
        if (found.isEmpty()) return unauthorized();

        if (req.avatarUrl() != null && req.avatarUrl().length() > MAX_AVATAR_LEN) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", "Profile photo is too large. Please choose a smaller image."));
        }

        User u = found.get();
        apply(u, req);
        User saved = userRepository.save(u);
        return ResponseEntity.ok(ProfileDTO.from(saved));
    }

    private void apply(User u, ProfileUpdateRequest r) {
        u.setFirstName(r.firstName());
        u.setLastName(r.lastName());
        u.setAvatarUrl(r.avatarUrl());
        u.setPhone(r.phone());
        u.setGender(r.gender());
        u.setDateOfBirth(r.dateOfBirth());
        u.setAge(r.age());
        u.setHeightCm(r.heightCm());
        u.setWeightKg(r.weightKg());
        u.setBmi(r.bmi());
        u.setBloodGroup(r.bloodGroup());
        u.setMedicalHistory(r.medicalHistory());
        u.setCurrentMedications(r.currentMedications());
        u.setAllergies(r.allergies());
        u.setEmergencyContactName(r.emergencyContactName());
        u.setEmergencyContactPhone(r.emergencyContactPhone());
        u.setEmergencyContactRelation(r.emergencyContactRelation());
        u.setSmokingStatus(r.smokingStatus());
        u.setAlcoholUse(r.alcoholUse());
        u.setExerciseLevel(r.exerciseLevel());
        u.setSleepHours(r.sleepHours());
        u.setWaterIntakeLiters(r.waterIntakeLiters());
    }

    private Optional<User> currentUser(Authentication auth) {
        if (auth == null || auth.getName() == null) return Optional.empty();
        return userRepository.findByUsername(auth.getName());
    }

    private ResponseEntity<?> unauthorized() {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                "success", false,
                "message", "Not authenticated."));
    }
}
