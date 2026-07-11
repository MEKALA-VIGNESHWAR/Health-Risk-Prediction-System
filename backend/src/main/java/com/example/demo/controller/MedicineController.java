package com.example.demo.controller;

import com.example.demo.entity.MedicineLog;
import com.example.demo.entity.MedicineReminder;
import com.example.demo.service.MedicineReminderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/reminders")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class MedicineController {

    private final MedicineReminderService reminderService;

    @PostMapping
    public ResponseEntity<?> createReminder(@RequestBody MedicineReminder reminder) {
        log.info("Request to create medicine reminder for user: {}", reminder.getUserId());
        try {
            if (reminder.getUserId() == null) {
                return ResponseEntity.badRequest().body("User ID is required");
            }
            MedicineReminder saved = reminderService.createReminder(reminder);
            return ResponseEntity.ok(saved);
        } catch (Exception e) {
            log.error("Failed to create reminder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create reminder: " + e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<MedicineReminder>> getRemindersForUser(@PathVariable String userId) {
        try {
            List<MedicineReminder> list = reminderService.getRemindersByUserId(UUID.fromString(userId));
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Failed to get reminders: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}/toggle")
    public ResponseEntity<?> toggleReminder(@PathVariable String id) {
        try {
            MedicineReminder updated = reminderService.toggleReminder(UUID.fromString(id));
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            log.error("Failed to toggle reminder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReminder(@PathVariable String id) {
        try {
            reminderService.deleteReminder(UUID.fromString(id));
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to delete reminder: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/logs/user/{userId}")
    public ResponseEntity<List<MedicineLog>> getRecentLogsForUser(@PathVariable String userId) {
        try {
            List<MedicineLog> list = reminderService.getRecentLogsByUserId(UUID.fromString(userId));
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            log.error("Failed to get intake logs: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/logs")
    public ResponseEntity<?> logIntake(@RequestBody Map<String, Object> body) {
        try {
            String reminderIdStr = (String) body.get("reminderId");
            String scheduledTimeStr = (String) body.get("scheduledTime");
            String status = (String) body.get("status");

            if (reminderIdStr == null || scheduledTimeStr == null || status == null) {
                return ResponseEntity.badRequest().body("reminderId, scheduledTime, and status are required");
            }

            LocalDateTime scheduledTime = LocalDateTime.parse(scheduledTimeStr);
            MedicineLog logged = reminderService.logIntake(
                    UUID.fromString(reminderIdStr),
                    scheduledTime,
                    status
            );
            return ResponseEntity.ok(logged);
        } catch (Exception e) {
            log.error("Failed to log intake: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to log intake: " + e.getMessage());
        }
    }
}
