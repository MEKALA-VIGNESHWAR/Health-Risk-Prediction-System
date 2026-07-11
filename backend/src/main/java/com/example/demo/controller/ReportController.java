package com.example.demo.controller;

import com.example.demo.entity.MedicalReport;
import com.example.demo.service.MedicalReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class ReportController {

    private final MedicalReportService reportService;

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("userId") String userId) {
        log.info("Received request to analyze report: {} for user: {}", file.getOriginalFilename(), userId);
        
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("File is empty");
            }
            if (userId == null || userId.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("User ID is required");
            }

            MedicalReport report = reportService.analyzeReport(
                    file.getOriginalFilename(),
                    file.getContentType(),
                    file.getBytes(),
                    UUID.fromString(userId)
            );
            return ResponseEntity.ok(report);

        } catch (IllegalArgumentException e) {
            log.error("Invalid user ID format: {}", userId);
            return ResponseEntity.badRequest().body("Invalid user ID format");
        } catch (Exception e) {
            log.error("Failed to analyze report: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to parse report: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MedicalReport>> getReportsForUser(@PathVariable String userId) {
        try {
            List<MedicalReport> reports = reportService.getReportsByUserId(UUID.fromString(userId));
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Failed to fetch reports: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
