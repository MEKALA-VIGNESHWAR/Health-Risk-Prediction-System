package com.example.demo.repository;

import com.example.demo.entity.FitnessPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface FitnessPlanRepositoryJPA extends JpaRepository<FitnessPlan, UUID> {
    Optional<FitnessPlan> findTopByUserIdOrderByCreatedAtDesc(UUID userId);
}
