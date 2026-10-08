package com.cyberguard.cyberincident.repository;

import com.cyberguard.cyberincident.model.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    List<AuditLog> findByIncidentId(Long incidentId);
}

