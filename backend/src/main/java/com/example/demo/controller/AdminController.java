package com.example.demo.controller;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class AdminController {

    @PersistenceContext
    private EntityManager entityManager;

    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        log.info("Fetching admin statistics");
        Map<String, Object> stats = new HashMap<>();

        try {
            long userCount = ((Number) entityManager.createQuery("SELECT COUNT(u) FROM User u").getSingleResult()).longValue();
            long diabetesCount = ((Number) entityManager.createQuery("SELECT COUNT(d) FROM DiabetesPrediction d").getSingleResult()).longValue();
            long heartCount = ((Number) entityManager.createQuery("SELECT COUNT(h) FROM HeartPrediction h").getSingleResult()).longValue();
            long reportsCount = ((Number) entityManager.createQuery("SELECT COUNT(r) FROM MedicalReport r").getSingleResult()).longValue();

            stats.put("activeUsersCount", userCount);
            stats.put("totalPredictionsCount", diabetesCount + heartCount);
            stats.put("totalReportsCount", reportsCount);

            // Server telemetry
            Runtime runtime = Runtime.getRuntime();
            stats.put("cpuCount", runtime.availableProcessors());
            stats.put("totalMemoryMb", runtime.totalMemory() / (1024 * 1024));
            stats.put("freeMemoryMb", runtime.freeMemory() / (1024 * 1024));
            stats.put("usedMemoryMb", (runtime.totalMemory() - runtime.freeMemory()) / (1024 * 1024));
            stats.put("systemStatus", "OK");

        } catch (Exception e) {
            log.error("Failed to retrieve admin dashboard stats: {}", e.getMessage(), e);
            stats.put("systemStatus", "DEGRADED");
            stats.put("error", e.getMessage());
        }

        return ResponseEntity.ok(stats);
    }
}
