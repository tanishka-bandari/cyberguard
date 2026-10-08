package com.cyberguard.cyberincident.repository;

import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cyberguard.cyberincident.model.AuditLog;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByIncidentId(Long incidentId);

    List<AuditLog> findAllByOrderByIdDesc(Pageable pageable);

    void deleteByIncidentId(Long incidentId);
}
