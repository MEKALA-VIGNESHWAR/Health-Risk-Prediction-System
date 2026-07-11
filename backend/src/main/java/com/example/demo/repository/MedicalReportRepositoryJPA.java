package com.example.demo.repository;

import com.example.demo.entity.MedicalReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicalReportRepositoryJPA extends JpaRepository<MedicalReport, UUID> {
    List<MedicalReport> findByUserId(UUID userId);
}
