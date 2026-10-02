package com.cyberguard.cyberincident.repository;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.Severity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    List<Incident> findByReportedById(Long userId);

    List<Incident> findByStatus(IncidentStatus status);

    long countByStatus(IncidentStatus status);

    long countBySeverity(Severity severity);
}

