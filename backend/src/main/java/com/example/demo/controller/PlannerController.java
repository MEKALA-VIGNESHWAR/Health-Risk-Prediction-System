package com.example.demo.controller;

import com.example.demo.entity.NutritionPlan;
import com.example.demo.entity.FitnessPlan;
import com.example.demo.service.PlannerService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/plans")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class PlannerController {

    private final PlannerService plannerService;

    @PostMapping("/nutrition/generate")
    public ResponseEntity<?> generateNutritionPlan(@RequestBody Map<String, String> body) {
        String userIdStr = body.get("userId");
        log.info("Request to generate nutrition plan for user: {}", userIdStr);
        try {
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            NutritionPlan plan = plannerService.generateNutritionPlan(UUID.fromString(userIdStr));
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            log.error("Failed to generate nutrition plan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate nutrition plan: " + e.getMessage());
        }
    }

    @PostMapping("/fitness/generate")
    public ResponseEntity<?> generateFitnessPlan(@RequestBody Map<String, String> body) {
        String userIdStr = body.get("userId");
        log.info("Request to generate fitness plan for user: {}", userIdStr);
        try {
            if (userIdStr == null || userIdStr.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            FitnessPlan plan = plannerService.generateFitnessPlan(UUID.fromString(userIdStr));
            return ResponseEntity.ok(plan);
        } catch (Exception e) {
            log.error("Failed to generate fitness plan: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to generate fitness plan: " + e.getMessage());
        }
    }

    @GetMapping("/nutrition/user/{userId}")
    public ResponseEntity<?> getNutritionPlan(@PathVariable String userId) {
        try {
            return plannerService.getLatestNutritionPlan(UUID.fromString(userId))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (Exception e) {
            log.error("Failed to fetch nutrition plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/fitness/user/{userId}")
    public ResponseEntity<?> getFitnessPlan(@PathVariable String userId) {
        try {
            return plannerService.getLatestFitnessPlan(UUID.fromString(userId))
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.noContent().build());
        } catch (Exception e) {
            log.error("Failed to fetch fitness plan: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
