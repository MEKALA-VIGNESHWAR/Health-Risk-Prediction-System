package com.example.demo.repository;

import com.example.demo.entity.SymptomCheck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SymptomCheckRepositoryJPA extends JpaRepository<SymptomCheck, UUID> {
    List<SymptomCheck> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
