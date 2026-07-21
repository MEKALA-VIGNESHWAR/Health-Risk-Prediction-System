package com.example.demo.controller;

import com.example.demo.dto.DiabetesPredictionRequest;
import com.example.demo.dto.DiabetesPredictionResponse;
import com.example.demo.entity.DiabetesPrediction;
import com.example.demo.service.DiabetesPredictionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

/**
 * DiabetesPredictionController - REST endpoints for diabetes prediction
 * 
 * Workflow:
 * 1. User enters patient data from webpage
 * 2. Data is sent to /api/predict endpoint as JSON
 * 3. Spring Boot receives and validates the data
 * 4. ML model processes the input and makes prediction
 * 5. Results are displayed on webpage
 * 6. Prediction record is stored in database for history
 */
@RestController
@RequestMapping("/api/predict")
@RequiredArgsConstructor
@Slf4j
public class DiabetesPredictionController {

    private final DiabetesPredictionService predictionService;

    /**
     * Main prediction endpoint - receives patient data and returns prediction
     * 
     * Request Example:
     * {
     *   "pregnancies": 6,
     *   "glucose": 148,
     *   "bloodPressure": 72,
     *   "skinThickness": 35,
     *   "insulin": 0,
     *   "bmi": 33.6,
     *   "diabetesPedigreeFunction": 0.627,
     *   "age": 50,
     *   "userId": null
     * }
     */
    @PostMapping("/diabetes")
    public ResponseEntity<DiabetesPredictionResponse> predictDiabetes(
            @RequestBody DiabetesPredictionRequest request) {
        log.info("POST /api/predict/diabetes - Received prediction request");
        
        try {
            // Validate input
            if (request == null) {
                return ResponseEntity.badRequest().build();
            }

            // Call prediction service
            DiabetesPredictionResponse response = predictionService.predictDiabetes(request);
            
            log.info("Prediction successful: {}", response.getMessage());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error in prediction endpoint: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get prediction history for a specific user
     */
    @GetMapping("/history/user/{userId}")
    public ResponseEntity<?> getPredictionHistory(
            @PathVariable String userId) {
        log.info("GET /api/predict/history/user/{} - Fetching prediction history", userId);
        
        try {
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(new ErrorResponse("User ID is required", 400));
            }

            UUID userUUID = UUID.fromString(userId);
            log.info("Converted userId to UUID: {}", userUUID);

            List<DiabetesPrediction> history = predictionService.getPredictionHistory(userId);
            List<com.example.demo.dto.DiabetesPredictionDTO> dtos = history.stream()
                    .map(com.example.demo.dto.DiabetesPredictionDTO::fromEntity)
                    .toList();
            log.info("Found {} predictions for user {}", dtos.size(), userId);
            
            return ResponseEntity.ok(dtos);
        } catch (IllegalArgumentException e) {
            log.error("Invalid UUID format for userId: {}", userId);
            return ResponseEntity.badRequest()
                    .body(new ErrorResponse("Invalid user ID format", 400));
        } catch (Exception e) {
            log.error("Error fetching prediction history: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ErrorResponse("Error fetching history: " + e.getMessage(), 500));
        }
    }

    /**
     * Get all high-risk predictions (diabetes positive)
     */
    @GetMapping("/high-risk")
    public ResponseEntity<List<com.example.demo.dto.DiabetesPredictionDTO>> getHighRiskPredictions() {
        log.info("GET /api/predict/high-risk - Fetching high-risk predictions");
        
        try {
            List<DiabetesPrediction> predictions = predictionService.getHighRiskPredictions();
            List<com.example.demo.dto.DiabetesPredictionDTO> dtos = predictions.stream()
                    .map(com.example.demo.dto.DiabetesPredictionDTO::fromEntity)
                    .toList();
            return ResponseEntity.ok(dtos);
        } catch (Exception e) {
            log.error("Error fetching high-risk predictions: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get specific prediction result
     */
    @GetMapping("/{predictionId}")
    public ResponseEntity<com.example.demo.dto.DiabetesPredictionDTO> getPrediction(
            @PathVariable String predictionId) {
        log.info("GET /api/predict/{} - Fetching prediction", predictionId);
        
        try {
            DiabetesPrediction prediction = predictionService.getPredictionById(predictionId);
            if (prediction != null) {
                return ResponseEntity.ok(com.example.demo.dto.DiabetesPredictionDTO.fromEntity(prediction));
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Error fetching prediction: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Error Response DTO
    static class ErrorResponse {
        public String message;
        public int status;

        public ErrorResponse(String message, int status) {
            this.message = message;
            this.status = status;
        }

        public String getMessage() {
            return message;
        }

        public int getStatus() {
            return status;
        }
    }

}
