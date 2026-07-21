package com.example.demo.service;

import com.example.demo.dto.DiabetesPredictionRequest;
import com.example.demo.dto.DiabetesPredictionResponse;
import com.example.demo.entity.DiabetesPrediction;
import com.example.demo.repository.AlertRepositoryJPA;
import com.example.demo.repository.DiabetesPredictionRepositoryJPA;
import com.example.demo.repository.UserRepositoryJPA;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DiabetesPredictionServiceTest {

    @Mock
    private DiabetesPredictionRepositoryJPA predictionRepository;

    @Mock
    private AlertRepositoryJPA alertRepository;

    @Mock
    private UserRepositoryJPA userRepository;

    @InjectMocks
    private DiabetesPredictionService predictionService;

    @BeforeEach
    void setUp() {
        predictionService.init();
    }

    @Test
    void predictDiabetes_HighRiskSample() {
        DiabetesPredictionRequest req = new DiabetesPredictionRequest();
        req.setPregnancies(6);
        req.setGlucose(148);
        req.setBloodPressure(72);
        req.setSkinThickness(35);
        req.setInsulin(0);
        req.setBmi(33.6);
        req.setDiabetesPedigreeFunction(0.627);
        req.setAge(50);
        req.setUserId(UUID.randomUUID().toString());

        when(predictionRepository.save(any(DiabetesPrediction.class))).thenAnswer(invocation -> {
            DiabetesPrediction saved = invocation.getArgument(0);
            saved.setId(UUID.randomUUID());
            return saved;
        });

        DiabetesPredictionResponse res = predictionService.predictDiabetes(req);

        assertNotNull(res);
        assertNotNull(res.getProbabilityDiabetes());
        assertNotNull(res.getProbabilityNoDiabetes());
        assertEquals(1.0, res.getProbabilityDiabetes() + res.getProbabilityNoDiabetes(), 0.001);
        assertNotNull(res.getRiskLevel());
        verify(predictionRepository, times(1)).save(any(DiabetesPrediction.class));
    }

    @Test
    void predictDiabetes_LowRiskSample() {
        DiabetesPredictionRequest req = new DiabetesPredictionRequest();
        req.setPregnancies(1);
        req.setGlucose(85);
        req.setBloodPressure(66);
        req.setSkinThickness(29);
        req.setInsulin(0);
        req.setBmi(26.6);
        req.setDiabetesPedigreeFunction(0.351);
        req.setAge(31);

        when(predictionRepository.save(any(DiabetesPrediction.class))).thenAnswer(i -> {
            DiabetesPrediction p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        DiabetesPredictionResponse res = predictionService.predictDiabetes(req);

        assertNotNull(res);
        assertTrue(res.getProbabilityNoDiabetes() > res.getProbabilityDiabetes());
        assertEquals("LOW", res.getRiskLevel());
    }

    @Test
    void getPredictionHistory_ReturnsSavedUserRecords() {
        UUID userId = UUID.randomUUID();
        DiabetesPrediction pred = new DiabetesPrediction();
        pred.setId(UUID.randomUUID());
        pred.setUserId(userId);
        pred.setGlucose(120);
        pred.setBmi(BigDecimal.valueOf(25.0));

        when(predictionRepository.findByUserId(userId)).thenReturn(List.of(pred));

        List<DiabetesPrediction> history = predictionService.getPredictionHistory(userId.toString());

        assertNotNull(history);
        assertEquals(1, history.size());
        assertEquals(120, history.get(0).getGlucose());
    }
}
