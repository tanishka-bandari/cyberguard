package com.cyberguard.cyberincident.service;

import com.cyberguard.cyberincident.model.AuditLog;
import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.AuditLogRepository;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final IncidentRepository incidentRepository;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            UserRepository userRepository,
            IncidentRepository incidentRepository) {

        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
        this.incidentRepository = incidentRepository;
    }

    public AuditLog createLog(
            String action,
            String details,
            String email,
            Long incidentId) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Incident incident = null;

        if (incidentId != null) {
            incident = incidentRepository.findById(incidentId)
                    .orElseThrow(() ->
                            new RuntimeException("Incident not found"));
        }

        AuditLog log = new AuditLog();

        log.setAction(action);
        log.setDetails(details);
        log.setUser(user);
        log.setIncident(incident);
        log.setCreatedAt(LocalDateTime.now());

        return auditLogRepository.save(log);
    }

    public List<AuditLog> getLogsByIncident(Long incidentId) {
        return auditLogRepository.findByIncidentId(incidentId);
    }
}