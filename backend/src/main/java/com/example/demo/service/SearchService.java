package com.example.demo.service;

import com.example.demo.entity.DiabetesPrediction;
import com.example.demo.entity.HeartPrediction;
import com.example.demo.entity.MedicalReport;
import com.example.demo.entity.MedicineReminder;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchService {

    @PersistenceContext
    private EntityManager entityManager;

    public Map<String, Object> compositeSearch(UUID userId, String query) {
        log.info("Performing composite search for user: {}, query: {}", userId, query);
        Map<String, Object> results = new HashMap<>();

        try {
            // 1. Search Medical Reports
            List<MedicalReport> matchedReports = entityManager.createQuery(
                    "SELECT r FROM MedicalReport r WHERE r.userId = :userId AND " +
                    "(LOWER(r.fileName) LIKE LOWER(:q) OR LOWER(r.extractedText) LIKE LOWER(:q))",
                    MedicalReport.class)
                    .setParameter("userId", userId)
                    .setParameter("q", "%" + query + "%")
                    .setMaxResults(10)
                    .getResultList();
            results.put("reports", matchedReports);

            // 2. Search Diabetes Predictions
            List<DiabetesPrediction> matchedDiabetes = entityManager.createQuery(
                    "SELECT d FROM DiabetesPrediction d WHERE d.userId = :userId AND " +
                    "(LOWER(d.riskLevel) LIKE LOWER(:q) OR (d.recommendations IS NOT NULL AND LOWER(d.recommendations) LIKE LOWER(:q)))",
                    DiabetesPrediction.class)
                    .setParameter("userId", userId)
                    .setParameter("q", "%" + query + "%")
                    .setMaxResults(10)
                    .getResultList();
            results.put("diabetes", matchedDiabetes);

            // 3. Search Heart Predictions
            List<HeartPrediction> matchedHeart = entityManager.createQuery(
                    "SELECT h FROM HeartPrediction h WHERE h.userId = :userId AND " +
                    "(LOWER(h.riskLevel) LIKE LOWER(:q) OR (h.recommendations IS NOT NULL AND LOWER(h.recommendations) LIKE LOWER(:q)))",
                    HeartPrediction.class)
                    .setParameter("userId", userId)
                    .setParameter("q", "%" + query + "%")
                    .setMaxResults(10)
                    .getResultList();
            results.put("heart", matchedHeart);

            // 4. Search Medicine Reminders
            List<MedicineReminder> matchedReminders = entityManager.createQuery(
                    "SELECT m FROM MedicineReminder m WHERE m.userId = :userId AND " +
                    "LOWER(m.medicineName) LIKE LOWER(:q)",
                    MedicineReminder.class)
                    .setParameter("userId", userId)
                    .setParameter("q", "%" + query + "%")
                    .setMaxResults(10)
                    .getResultList();
            results.put("reminders", matchedReminders);

        } catch (Exception e) {
            log.error("Composite search execution failed: {}", e.getMessage(), e);
        }

        return results;
    }
}
