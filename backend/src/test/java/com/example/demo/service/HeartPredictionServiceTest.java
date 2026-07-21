package com.example.demo.service;

import com.example.demo.dto.HeartPredictionRequest;
import com.example.demo.dto.HeartPredictionResponse;
import com.example.demo.entity.HeartPrediction;
import com.example.demo.repository.HeartPredictionRepositoryJPA;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class HeartPredictionServiceTest {

    @Mock
    private HeartPredictionRepositoryJPA predictionRepository;

    @InjectMocks
    private HeartPredictionService predictionService;

    @BeforeEach
    void setUp() {
        predictionService.init();
    }

    @Test
    void predictHeartDisease_HighRiskSample() {
        HeartPredictionRequest req = new HeartPredictionRequest();
        req.setAge(67);
        req.setSex(1);
        req.setCp(0);
        req.setTrestbps(160.0);
        req.setChol(286.0);
        req.setFbs(0);
        req.setRestecg(0);
        req.setThalach(108.0);
        req.setExang(1);
        req.setOldpeak(1.5);
        req.setSlope(1);
        req.setCa(2);
        req.setThal(2);
        req.setUserId(UUID.randomUUID().toString());

        when(predictionRepository.save(any(HeartPrediction.class))).thenAnswer(i -> {
            HeartPrediction p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        HeartPredictionResponse res = predictionService.predictHeartDisease(req);

        assertNotNull(res);
        assertNotNull(res.getDiseaseProbability());
        assertNotNull(res.getNoDiseaseProbability());
        assertEquals(1.0, res.getDiseaseProbability() + res.getNoDiseaseProbability(), 0.001);
        assertNotNull(res.getRisk());
        verify(predictionRepository, times(1)).save(any(HeartPrediction.class));
    }

    @Test
    void predictHeartDisease_LowRiskSample() {
        HeartPredictionRequest req = new HeartPredictionRequest();
        req.setAge(37);
        req.setSex(1);
        req.setCp(2);
        req.setTrestbps(130.0);
        req.setChol(250.0);
        req.setFbs(0);
        req.setRestecg(1);
        req.setThalach(187.0);
        req.setExang(0);
        req.setOldpeak(0.0);
        req.setSlope(0);
        req.setCa(0);
        req.setThal(0);

        when(predictionRepository.save(any(HeartPrediction.class))).thenAnswer(i -> {
            HeartPrediction p = i.getArgument(0);
            p.setId(UUID.randomUUID());
            return p;
        });

        HeartPredictionResponse res = predictionService.predictHeartDisease(req);

        assertNotNull(res);
        assertTrue(res.getNoDiseaseProbability() > res.getDiseaseProbability());
        assertEquals("LOW", res.getRisk());
    }
}
