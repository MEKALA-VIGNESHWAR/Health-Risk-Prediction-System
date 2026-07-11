package com.example.demo.service;

import com.example.demo.entity.MedicineLog;
import com.example.demo.entity.MedicineReminder;
import com.example.demo.repository.MedicineLogRepositoryJPA;
import com.example.demo.repository.MedicineReminderRepositoryJPA;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class MedicineReminderService {

    private final MedicineReminderRepositoryJPA reminderRepository;
    private final MedicineLogRepositoryJPA logRepository;

    public MedicineReminder createReminder(MedicineReminder reminder) {
        log.info("Creating medicine reminder for user: {}", reminder.getUserId());
        return reminderRepository.save(reminder);
    }

    public List<MedicineReminder> getRemindersByUserId(UUID userId) {
        return reminderRepository.findByUserId(userId);
    }

    public List<MedicineReminder> getActiveRemindersByUserId(UUID userId) {
        return reminderRepository.findByUserIdAndActiveTrue(userId);
    }

    @Transactional
    public MedicineReminder toggleReminder(UUID id) {
        log.info("Toggling reminder status for: {}", id);
        MedicineReminder reminder = reminderRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reminder not found: " + id));
        reminder.setActive(!reminder.getActive());
        return reminderRepository.save(reminder);
    }

    public void deleteReminder(UUID id) {
        log.info("Deleting reminder: {}", id);
        reminderRepository.deleteById(id);
    }

    public List<MedicineLog> getRecentLogsByUserId(UUID userId) {
        return logRepository.findRecentLogsByUserId(userId);
    }

    @Transactional
    public MedicineLog logIntake(UUID reminderId, LocalDateTime scheduledTime, String status) {
        log.info("Logging intake for reminder: {}, time: {}, status: {}", reminderId, scheduledTime, status);
        
        Optional<MedicineLog> existing = logRepository.findByReminderIdAndScheduledTime(reminderId, scheduledTime);
        MedicineLog logEntry;
        if (existing.isPresent()) {
            logEntry = existing.get();
            logEntry.setLoggedTime(LocalDateTime.now());
            logEntry.setStatus(status);
        } else {
            logEntry = new MedicineLog();
            logEntry.setReminderId(reminderId);
            logEntry.setScheduledTime(scheduledTime);
            logEntry.setLoggedTime(LocalDateTime.now());
            logEntry.setStatus(status);
        }
        return logRepository.save(logEntry);
    }

    /**
     * Background scheduler executing every minute.
     * Detects if an active reminder is scheduled at this current minute.
     * Initializes a log record with status 'MISSED' (by default, users will mark it 'TAKEN' from UI).
     */
    @Scheduled(cron = "0 * * * * *")
    @Transactional
    public void checkReminders() {
        LocalDateTime now = LocalDateTime.now();
        LocalTime timeNow = LocalTime.of(now.getHour(), now.getMinute(), 0);
        LocalDate dateNow = now.toLocalDate();
        
        List<MedicineReminder> activeReminders = reminderRepository.findByActiveTrue();
        for (MedicineReminder reminder : activeReminders) {
            // Check if within date range
            if (dateNow.isBefore(reminder.getStartDate()) || 
                (reminder.getEndDate() != null && dateNow.isAfter(reminder.getEndDate()))) {
                continue;
            }
            
            // Check times
            String[] times = reminder.getTimes().split(",");
            for (String tStr : times) {
                try {
                    LocalTime t = LocalTime.parse(tStr.trim());
                    if (t.getHour() == timeNow.getHour() && t.getMinute() == timeNow.getMinute()) {
                        LocalDateTime scheduledDateTime = LocalDateTime.of(dateNow, t);
                        
                        // Check if log already exists
                        if (logRepository.findByReminderIdAndScheduledTime(reminder.getId(), scheduledDateTime).isEmpty()) {
                            MedicineLog logEntry = new MedicineLog();
                            logEntry.setReminderId(reminder.getId());
                            logEntry.setScheduledTime(scheduledDateTime);
                            logEntry.setStatus("MISSED");
                            logRepository.save(logEntry);
                            
                            log.info("Reminder background task: Marked dose of {} scheduled at {} as MISSED", 
                                    reminder.getMedicineName(), scheduledDateTime);
                        }
                    }
                } catch (Exception e) {
                    log.error("Failed to parse time string '{}' in reminder: {}", tStr, reminder.getId(), e);
                }
            }
        }
    }
}
