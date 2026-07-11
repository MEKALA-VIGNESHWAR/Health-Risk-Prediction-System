package com.example.demo.repository;

import com.example.demo.entity.MedicineReminder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface MedicineReminderRepositoryJPA extends JpaRepository<MedicineReminder, UUID> {
    List<MedicineReminder> findByUserId(UUID userId);
    List<MedicineReminder> findByUserIdAndActiveTrue(UUID userId);
    List<MedicineReminder> findByActiveTrue();
}
