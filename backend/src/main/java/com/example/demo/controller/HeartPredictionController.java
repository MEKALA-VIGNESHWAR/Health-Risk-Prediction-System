package com.example.demo.controller;

import com.example.demo.dto.HeartPredictionRequest;
import com.example.demo.dto.HeartPredictionResponse;
import com.example.demo.entity.HeartPrediction;
import com.example.demo.entity.User;
import com.example.demo.service.HeartPredictionService;
import com.example.demo.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * HeartPredictionController - REST endpoints for heart disease prediction
 * SEPARATE from DiabetesPredictionController - maintains modularity
 * 
 * Workflow:
 * 1. User enters patient data from webpage
 * 2. Data is sent to /api/predict/heart endpoint as JSON
 * 3. Spring Boot receives and validates the data
 * 4. ML model processes the input and makes prediction
 * 5. Results are displayed on webpage
 * 6. Prediction record is stored in database for history
 */
@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@Slf4j
public class HeartPredictionController {

    private final HeartPredictionService predictionService;
    private final AuthService authService;

    /**
     * Main heart disease prediction endpoint - receives patient data and returns prediction
     * 
     * Request Example:
     * {
     *   "age": 63,
     *   "sex": 1,
     *   "cp": 3,
     *   "trestbps": 145.0,
     *   "chol": 233.0,
     *   "fbs": 1,
     *   "restecg": 0,
     *   "thalch": 150.0,
     *   "exang": 0,
     *   "oldpeak": 2.3,
     *   "slope": 1,
     *   "ca": 0,
     *   "thal": 1,
     *   "userId": null
     * }
     * 
     * Response Example:
     * {
     *   "prediction": 1,
     *   "disease_probability": 0.85,
     *   "no_disease_probability": 0.15,
     *   "message": "Heart Disease Risk: Positive",
     *   "risk": "HIGH",
     *   "confidence": 0.85,
     *   "model_used": "Random Forest Heart Model v1.0",
     *   "top_factors": [...],
     *   "recommendations": [...],
     *   "risk_description": "Your heart disease risk is HIGH..."
     * }
     */
    @PostMapping("/heart")
    public ResponseEntity<HeartPredictionResponse> predictHeartDisease(
            @RequestBody HeartPredictionRequest request) {
        log.info("POST /api/predict/heart - Received heart disease prediction request");
        
        try {
            // Validate input
            if (request == null) {
                return ResponseEntity.badRequest().build();
            }

            // Get authenticated user and set on request
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            if (authentication != null && authentication.isAuthenticated()) {
                String username = (String) authentication.getPrincipal();
                log.debug("Authenticated user: {}", username);
                
                User user = authService.getUserByUsername(username);
                if (user != null) {
                    request.setUserId(user.getId().toString());
                    log.debug("Set user ID on request: {}", user.getId());
                }
            }

            // Call prediction service
            HeartPredictionResponse response = predictionService.predictHeartDisease(request);
            
            log.info("Heart disease prediction successful: {}", response.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in heart disease prediction endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get prediction history for a specific user
     * 
     * Example: GET /api/predict/heart/history/user/123e4567-e89b-12d3-a456-426614174000
     */
    @GetMapping("/heart/history/user/{userId}")
    public ResponseEntity<?> getHeartPredictionHistory(
            @PathVariable String userId) {
        log.info("GET /api/predict/heart/history/user/{} - Fetching heart disease prediction history", userId);
        
        try {
            UUID userUUID = UUID.fromString(userId);
            List<HeartPrediction> history = predictionService.getPredictionHistory(userUUID);
            List<com.example.demo.dto.HeartPredictionDTO> dtos = history.stream()
                    .map(com.example.demo.dto.HeartPredictionDTO::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("data", dtos);
                put("count", dtos.size());
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            log.error("Error fetching heart disease prediction history: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching history");
        }
    }

    /**
     * Get high-risk heart disease predictions for a user
     * 
     * Example: GET /api/predict/heart/high-risk/user/123e4567-e89b-12d3-a456-426614174000
     */
    @GetMapping("/heart/high-risk/user/{userId}")
    public ResponseEntity<?> getHighRiskHeartPredictions(
            @PathVariable String userId) {
        log.info("GET /api/predict/heart/high-risk/user/{} - Fetching high-risk heart disease predictions", userId);
        
        try {
            UUID userUUID = UUID.fromString(userId);
            List<HeartPrediction> highRiskPredictions = predictionService.getHighRiskPredictions(userUUID);
            List<com.example.demo.dto.HeartPredictionDTO> dtos = highRiskPredictions.stream()
                    .map(com.example.demo.dto.HeartPredictionDTO::fromEntity)
                    .toList();
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("data", dtos);
                put("count", dtos.size());
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            log.error("Error fetching high-risk heart disease predictions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching high-risk predictions");
        }
    }

    /**
     * Get prediction statistics for a user
     * 
     * Example: GET /api/predict/heart/stats/user/123e4567-e89b-12d3-a456-426614174000
     */
    @GetMapping("/heart/stats/user/{userId}")
    public ResponseEntity<?> getHeartPredictionStats(
            @PathVariable String userId) {
        log.info("GET /api/predict/heart/stats/user/{} - Fetching heart disease prediction statistics", userId);
        
        try {
            UUID userUUID = UUID.fromString(userId);
            Map<String, Object> stats = predictionService.getPredictionStats(userUUID);
            
            return ResponseEntity.ok(new HashMap<String, Object>() {{
                put("success", true);
                put("data", stats);
            }});
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            log.error("Error fetching heart disease prediction statistics: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Error fetching statistics");
        }
    }

    /**
     * Health check for the heart prediction endpoint
     */
    @GetMapping("/heart/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok(new HashMap<String, Object>() {{
            put("status", "healthy");
            put("service", "Heart Disease Prediction");
            put("endpoint", "/api/predict/heart");
            put("version", "1.0.0");
        }});
    }

}
