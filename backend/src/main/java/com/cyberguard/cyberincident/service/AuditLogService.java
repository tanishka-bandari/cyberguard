package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.cyberguard.cyberincident.dto.AuditLogResponseDto;
import com.cyberguard.cyberincident.model.AuditLog;
import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.AuditLogRepository;

@Service
public class AuditLogService {

    private static final int MAX_DETAILS_LENGTH = 255;

    private static final Set<String> REPORTER_VISIBLE = Set.of(
            "INCIDENT_CREATED", "STATUS_CHANGED",
            "INCIDENT_ASSIGNED", "INCIDENT_UNASSIGNED");

    private final AuditLogRepository auditLogRepository;
    private final AccessControl access;

    public AuditLogService(
            AuditLogRepository auditLogRepository,
            AccessControl access) {

        this.auditLogRepository = auditLogRepository;
        this.access = access;
    }

    /** Records an action; incident is null for entries that outlive it. */
    public void log(User user, Incident incident, String action, String details) {

        AuditLog log = new AuditLog();

        log.setUser(user);
        log.setIncident(incident);
        log.setAction(action);
        log.setDetails(details.length() > MAX_DETAILS_LENGTH
                ? details.substring(0, MAX_DETAILS_LENGTH)
                : details);
        log.setCreatedAt(LocalDateTime.now());

        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLogResponseDto> getLogsByIncident(
            Long incidentId, Authentication authentication) {

        User user = access.currentUser(authentication);
        access.requireStaffOrReporter(user, access.findIncident(incidentId));

        boolean staff = AccessControl.isStaff(user);

        // A reporter only sees status and assignment changes, without who made them.
        return auditLogRepository.findByIncidentIdOrderByIdAsc(incidentId).stream()
                .filter(entry -> staff || REPORTER_VISIBLE.contains(entry.getAction()))
                .map(entry -> AuditLogResponseDto.from(entry, staff))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AuditLog> getRecentLogs(int limit, Authentication authentication) {

        access.requireStaff(authentication);

        int size = Math.max(1, Math.min(limit, 200));

        return auditLogRepository.findAllByOrderByIdDesc(
                PageRequest.of(0, size));
    }

    public void deleteByIncident(Long incidentId) {
        auditLogRepository.deleteByIncidentId(incidentId);
    }
}
