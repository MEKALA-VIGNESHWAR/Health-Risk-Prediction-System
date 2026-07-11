package com.example.demo.repository;

import com.example.demo.entity.DailyVitals;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyVitalsRepositoryJPA extends JpaRepository<DailyVitals, UUID> {
    Optional<DailyVitals> findByUserIdAndLogDate(UUID userId, LocalDate logDate);
    List<DailyVitals> findByUserIdAndLogDateBetweenOrderByLogDateAsc(UUID userId, LocalDate start, LocalDate end);
    List<DailyVitals> findByUserIdOrderByLogDateAsc(UUID userId);
}
