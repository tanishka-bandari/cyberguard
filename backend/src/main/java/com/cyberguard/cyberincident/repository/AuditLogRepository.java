package com.cyberguard.cyberincident.repository;

import java.util.Collection;
import java.util.List;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cyberguard.cyberincident.model.AuditLog;

public interface AuditLogRepository
        extends JpaRepository<AuditLog, Long> {

    @EntityGraph(attributePaths = {"user", "incident"})
    List<AuditLog> findByIncidentIdOrderByIdAsc(Long incidentId);

    @EntityGraph(attributePaths = {"user", "incident"})
    List<AuditLog> findByIncidentIdAndActionInOrderByIdAsc(
            Long incidentId, Collection<String> actions);

    @EntityGraph(attributePaths = {"user", "incident"})
    List<AuditLog> findAllByOrderByIdDesc(Pageable pageable);

    void deleteByIncidentId(Long incidentId);
}
