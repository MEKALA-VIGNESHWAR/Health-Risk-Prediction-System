package com.example.demo.controller;

import com.example.demo.entity.User;
import com.example.demo.repository.UserRepositoryJPA;
import com.example.demo.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

/**
 * DashboardController - REST endpoints for dashboard data
 * 
 * Main endpoints:
 * - GET /api/dashboard/summary - Dashboard summary cards
 * - GET /api/dashboard/patients - Filtered patient list
 * - GET /api/dashboard/trends - Analytics trends
 * - GET /api/dashboard/alerts - Alert list
 * - GET /api/dashboard/insights/{predictionId} - AI insights
 */
@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class DashboardController {

    private final DashboardService dashboardService;
    private final UserRepositoryJPA userRepository;

    /**
     * GET /api/dashboard/summary
     * Returns summary statistics for dashboard cards
     * 
     * Response:
     * {
     *   "totalPredictions": 120,
     *   "highRiskCount": 35,
     *   "lowRiskCount": 85,
     *   "riskPercentage": 29.1,
     *   "avgGlucose": 142,
     *   "pendingFollowups": 8,
     *   "totalPatients": 50
     * }
     */
    @GetMapping("/summary")
    public ResponseEntity<?> getDashboardSummary() {
        try {
            log.info("GET /api/dashboard/summary - Fetching dashboard summary");
            Map<String, Object> summary = dashboardService.getDashboardSummary();
            
            return ResponseEntity.ok(new ApiResponse("success", "Dashboard summary retrieved", summary));
        } catch (Exception e) {
            log.error("Error fetching dashboard summary: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to fetch dashboard summary: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard/patients
     * Returns filtered patient list with advanced filtering
     * 
     * Query Parameters:
     * - search: Search term (optional)
     * - riskLevel: high | medium | low (optional)
     * - ageRange: 40+ | 50+ | 60+ (optional)
     * - glucoseRange: 150+ | 200+ (optional)
     * - page: Page number (default: 0)
     * - pageSize: Page size (default: 10)
     * 
     * Example:
     * GET /api/dashboard/patients?riskLevel=high&page=0&pageSize=10
     * 
     * Response:
     * {
     *   "status": "success",
     *   "patients": [
     *     {
     *       "patientId": "P101",
     *       "name": "Reddy",
     *       "age": 45,
     *       "gender": "M",
     *       "glucose": 180,
     *       "bmi": 31,
     *       "riskPercentage": 76,
     *       "status": "High Risk",
     *       "lastVisit": "2026-04-02T00:00:00"
     *     }
     *   ],
     *   "data": {
     *     "totalCount": 35,
     *     "pageCount": 4,
     *     "currentPage": 0
     *   }
     * }
     */
    @GetMapping("/patients")
    public ResponseEntity<?> getPatients(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String riskLevel,
            @RequestParam(required = false) String ageRange,
            @RequestParam(required = false) String glucoseRange,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        try {
            log.info("GET /api/dashboard/patients - Filters: search={}, risk={}, age={}, glucose={}", 
                    search, riskLevel, ageRange, glucoseRange);
            
            Map<String, Object> result = dashboardService.getPatientsWithFilters(
                    search, riskLevel, ageRange, glucoseRange, page, pageSize);
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("patients", result.get("patients"));
            response.put("data", Map.of(
                    "totalCount", result.get("totalCount"),
                    "pageCount", result.get("pageCount"),
                    "currentPage", result.get("currentPage")
            ));
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching patients: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to fetch patients: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard/trends
     * Returns trend analytics for charts
     * 
     * Query Parameters:
     * - period: 7days | 30days | 6months | 1year (default: 7days)
     * 
     * Response:
     * {
    *   "status": "success",
     *   "data": {
     *     "labels": ["Day 1", "Day 2", ...],
     *     "glucoseTrend": [142, 145, ...],
     *     "riskTrend": [45, 47, ...],
     *     "bmiTrend": [28, 29, ...],
     *     "riskDistribution": {
     *       "high": 35,
     *       "medium": 30,
     *       "low": 85
     *     }
     *   }
     * }
     */
    @GetMapping("/trends")
    public ResponseEntity<?> getTrendAnalytics(
            @RequestParam(defaultValue = "7days") String period) {
        
        try {
            log.info("GET /api/dashboard/trends - Period: {}", period);
            Map<String, Object> trends = dashboardService.getTrendAnalytics(period);
            
            return ResponseEntity.ok(new ApiResponse("success", "Trends retrieved", trends));
        } catch (Exception e) {
            log.error("Error fetching trends: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to fetch trends: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard/alerts
     * Returns alert list
     * 
     * Query Parameters:
     * - severity: CRITICAL | HIGH | MEDIUM | LOW (optional)
     * 
     * Response:
     * {
     *   "status": "success",
     *   "data": [
     *     {
     *       "id": "uuid",
     *       "patientId": "P101",
     *       "severity": "CRITICAL",
     *       "message": "Critical glucose level detected",
     *       "glucoseLevel": 198,
     *       "riskLevel": "High",
     *       "timestamp": "2026-04-15T14:30:00"
     *     }
     *   ]
     * }
     */
    @GetMapping("/alerts")
    public ResponseEntity<?> getAlerts(
            @RequestParam(required = false) String severity) {
        
        try {
            log.info("GET /api/dashboard/alerts - Severity filter: {}", severity);
            List<Map<String, Object>> alerts = dashboardService.getAlerts();
            
            // Filter by severity if provided
            if (severity != null && !severity.isBlank()) {
                alerts = alerts.stream()
                        .filter(alert -> alert.get("severity").equals(severity.toUpperCase()))
                        .toList();
            }
            
            return ResponseEntity.ok(new ApiResponse("success", "Alerts retrieved", alerts));
        } catch (Exception e) {
            log.error("Error fetching alerts: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to fetch alerts: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard/insights/{predictionId}
     * Returns AI insights for a specific prediction
     * 
     * Path Parameters:
     * - predictionId: UUID of prediction
     * 
     * Response:
     * {
     *   "status": "success",
     *   "data": {
     *     "featureContributions": {
     *       "Glucose": 45,
     *       "BMI": 20,
     *       "Age": 15,
     *       "Insulin": 10,
     *       "Blood Pressure": 10
     *     },
     *     "confidenceLevel": 94.8,
     *     "probabilityDiabetic": 89.2,
     *     "probabilityNonDiabetic": 10.8,
     *     "predictionMessage": "High risk of diabetes"
     *   }
     * }
     */
    @GetMapping("/insights/{predictionId}")
    public ResponseEntity<?> getPredictionInsights(
            @PathVariable String predictionId) {
        
        try {
            log.info("GET /api/dashboard/insights/{} - Fetching insights", predictionId);
            
            UUID uuid = UUID.fromString(predictionId);
            Map<String, Object> insights = dashboardService.getPredictionInsights(uuid);
            
            return ResponseEntity.ok(new ApiResponse("success", "Insights retrieved", insights));
        } catch (IllegalArgumentException e) {
            log.warn("Invalid UUID format: {}", predictionId);
            return ResponseEntity.badRequest()
                    .body(new ApiResponse("error", "Invalid prediction ID format", null));
        } catch (Exception e) {
            log.error("Error fetching insights: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to fetch insights: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard
     * Returns personal dashboard summary for the logged-in user
     */
    @GetMapping
    public ResponseEntity<?> getPersonalDashboard(Authentication auth) {
        try {
            Optional<User> user = currentUser(auth);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse("error", "User not authenticated", null));
            }
            Map<String, Object> data = dashboardService.getPersonalDashboard(user.get().getId());
            return ResponseEntity.ok(new ApiResponse("success", "Dashboard data retrieved", data));
        } catch (Exception e) {
            log.error("Error retrieving personal dashboard: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to retrieve dashboard: " + e.getMessage(), null));
        }
    }

    /**
     * GET /api/dashboard/charts
     * Returns historical vitals charts data for the logged-in user
     */
    @GetMapping("/charts")
    public ResponseEntity<?> getChartsData(Authentication auth) {
        try {
            Optional<User> user = currentUser(auth);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse("error", "User not authenticated", null));
            }
            Map<String, Object> charts = dashboardService.getChartsData(user.get().getId());
            return ResponseEntity.ok(new ApiResponse("success", "Charts data retrieved", charts));
        } catch (Exception e) {
            log.error("Error retrieving charts data: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to retrieve charts data", null));
        }
    }

    /**
     * GET /api/dashboard/insights
     * Returns dynamic AI insights based on vitals logs for the logged-in user
     */
    @GetMapping("/insights")
    public ResponseEntity<?> getVitalsInsights(Authentication auth) {
        try {
            Optional<User> user = currentUser(auth);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse("error", "User not authenticated", null));
            }
            List<String> insights = dashboardService.getAIInsights(user.get().getId());
            return ResponseEntity.ok(new ApiResponse("success", "Insights retrieved", insights));
        } catch (Exception e) {
            log.error("Error retrieving insights: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to retrieve insights", null));
        }
    }

    /**
     * POST /api/dashboard/log
     * Logs today's vitals (water, sleep, calories, exercise, etc.)
     */
    @PostMapping("/log")
    public ResponseEntity<?> logVitals(@RequestBody Map<String, Object> payload, Authentication auth) {
        try {
            Optional<User> user = currentUser(auth);
            if (user.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new ApiResponse("error", "User not authenticated", null));
            }
            var vitals = dashboardService.logVitals(user.get().getId(), payload);
            return ResponseEntity.ok(new ApiResponse("success", "Vitals logged successfully", vitals));
        } catch (Exception e) {
            log.error("Error logging vitals: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ApiResponse("error", "Failed to log vitals: " + e.getMessage(), null));
        }
    }

    private Optional<User> currentUser(Authentication auth) {
        if (auth == null || auth.getName() == null) {
            return Optional.empty();
        }
        return userRepository.findByUsername(auth.getName());
    }

    /**
     * ApiResponse wrapper class
     */
    @lombok.Data
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    static class ApiResponse {
        private String status;
        private String message;
        private Object data;
    }
}
