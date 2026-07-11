package com.example.demo.repository;

import com.example.demo.entity.AiMemory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiMemoryRepositoryJPA extends JpaRepository<AiMemory, UUID> {
    List<AiMemory> findByUserId(UUID userId);
    Optional<AiMemory> findByUserIdAndMemoryKey(UUID userId, String memoryKey);
}
