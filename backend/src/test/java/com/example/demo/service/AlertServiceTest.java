package com.example.demo.service;

import com.example.demo.entity.Alert;
import com.example.demo.repository.AlertRepositoryJPA;
import com.example.demo.repository.DiabetesPredictionRepositoryJPA;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AlertServiceTest {

    @Mock
    private AlertRepositoryJPA alertRepository;

    @Mock
    private DiabetesPredictionRepositoryJPA predictionRepository;

    @InjectMocks
    private AlertService alertService;

    @Test
    void getAlertsByUser_ReturnsUnreadAlerts() {
        UUID userId = UUID.randomUUID();
        Alert alert = new Alert();
        alert.setId(UUID.randomUUID());
        alert.setPatientId(userId);
        alert.setTitle("High BP Warning");
        alert.setSeverity("HIGH");
        alert.setIsRead(false);

        when(alertRepository.findByPatientIdAndIsReadFalseOrderByCreatedAtDesc(userId)).thenReturn(List.of(alert));

        List<Alert> alerts = alertService.getAlertsByUser(userId);

        assertNotNull(alerts);
        assertEquals(1, alerts.size());
        assertEquals("HIGH", alerts.get(0).getSeverity());
    }

    @Test
    void acknowledgeAlert_MarksAlertAsRead() {
        UUID alertId = UUID.randomUUID();
        Alert alert = new Alert();
        alert.setId(alertId);
        alert.setIsRead(false);

        when(alertRepository.findById(alertId)).thenReturn(Optional.of(alert));

        alertService.acknowledgeAlert(alertId);

        assertTrue(alert.getIsRead());
        assertNotNull(alert.getAcknowledgedAt());
        verify(alertRepository, times(1)).save(alert);
    }

    @Test
    void getAlertStatistics_ReturnsCorrectCounts() {
        when(alertRepository.countByIsReadFalse()).thenReturn(10L);
        when(alertRepository.countBySeverityAndIsReadFalse("CRITICAL")).thenReturn(2L);
        when(alertRepository.countBySeverityAndIsReadFalse("HIGH")).thenReturn(3L);
        when(alertRepository.countBySeverityAndIsReadFalse("MEDIUM")).thenReturn(4L);
        when(alertRepository.countBySeverityAndIsReadFalse("LOW")).thenReturn(1L);

        Map<String, Long> stats = alertService.getAlertStatistics();

        assertNotNull(stats);
        assertEquals(10L, stats.get("total"));
        assertEquals(2L, stats.get("critical"));
        assertEquals(3L, stats.get("high"));
    }
}
