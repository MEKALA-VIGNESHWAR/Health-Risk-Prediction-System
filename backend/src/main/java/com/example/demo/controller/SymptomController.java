package com.example.demo.controller;

import com.example.demo.entity.SymptomCheck;
import com.example.demo.entity.User;
import com.example.demo.repository.SymptomCheckRepositoryJPA;
import com.example.demo.repository.UserRepositoryJPA;
import com.example.demo.ai.SymptomService;
import com.example.demo.ai.dto.SymptomRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/symptoms")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class SymptomController {

    private final SymptomService symptomService;
    private final SymptomCheckRepositoryJPA symptomCheckRepository;
    private final UserRepositoryJPA userRepository;
    private final ObjectMapper objectMapper;

    @PostMapping("/check")
    public Mono<ResponseEntity<?>> checkSymptoms(@RequestBody Map<String, Object> payload, Authentication auth) {
        log.info("Checking symptoms with payload: {}", payload);
        try {
            User user = currentUser(auth);
            
            String text = (String) payload.getOrDefault("text", "");
            String duration = (String) payload.getOrDefault("duration", "");
            String severity = (String) payload.getOrDefault("severity", "Low");
            String history = (String) payload.getOrDefault("medicalHistory", "");
            String medications = (String) payload.getOrDefault("medications", "");
            
            StringBuilder fullText = new StringBuilder(text);
            if (severity != null && !severity.isBlank()) {
                fullText.append("\nReported Severity: ").append(severity);
            }
            if (history != null && !history.isBlank()) {
                fullText.append("\nMedical History: ").append(history);
            }
            if (medications != null && !medications.isBlank()) {
                fullText.append("\nCurrent Medications: ").append(medications);
            }

            Integer age = user.getDateOfBirth() != null 
                ? java.time.Period.between(user.getDateOfBirth(), java.time.LocalDate.now()).getYears()
                : null;
            String sex = user.getGender();

            SymptomRequest req = new SymptomRequest(fullText.toString(), age, sex, duration);

            return symptomService.analyze(req)
                    .map(response -> {
                        try {
                            SymptomCheck check = new SymptomCheck();
                            check.setUserId(user.getId());
                            check.setSymptoms(text);
                            check.setDuration(duration);
                            check.setSeverity(severity);
                            check.setMedicalHistory(history);
                            check.setMedications(medications);
                            
                            String analysisJson = objectMapper.writeValueAsString(response);
                            check.setAnalysisResult(analysisJson);

                            symptomCheckRepository.save(check);
                        } catch (Exception e) {
                            log.error("Failed to save symptom check: {}", e.getMessage());
                        }
                        return ResponseEntity.ok(response);
                    });

        } catch (Exception e) {
            log.error("Error checking symptoms: {}", e.getMessage());
            return Mono.just(ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to check symptoms: " + e.getMessage())));
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication auth) {
        try {
            User user = currentUser(auth);
            List<SymptomCheck> history = symptomCheckRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
            return ResponseEntity.ok(history);
        } catch (Exception e) {
            log.error("Failed to fetch symptom history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Failed to fetch history"));
        }
    }

    private User currentUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            throw new RuntimeException("User not authenticated");
        }
        return userRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
