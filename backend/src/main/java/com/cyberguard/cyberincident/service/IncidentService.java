package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.IncidentType;
import com.cyberguard.cyberincident.model.Severity;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.InvestigationNoteRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
@Transactional
public class IncidentService {

    private static final int MAX_TITLE_LENGTH = 200;
    private static final int MAX_DESCRIPTION_LENGTH = 2000;

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;
    private final InvestigationNoteRepository noteRepository;
    private final EvidenceService evidenceService;
    private final AuditLogService auditLogService;
    private final AccessControl access;

    public IncidentService(
            IncidentRepository incidentRepository,
            UserRepository userRepository,
            InvestigationNoteRepository noteRepository,
            EvidenceService evidenceService,
            AuditLogService auditLogService,
            AccessControl access) {

        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.evidenceService = evidenceService;
        this.auditLogService = auditLogService;
        this.access = access;
    }

    // USER can report an incident; the JWT decides who the reporter is.
    public Incident createIncident(
            String title,
            String description,
            String type,
            String severity,
            Integer riskScore,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED, "User not found"));

        String cleanTitle = requireText(title, "Title", MAX_TITLE_LENGTH);
        String cleanDescription =
                requireText(description, "Description", MAX_DESCRIPTION_LENGTH);

        if (riskScore == null || riskScore < 0 || riskScore > 100) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Risk score must be between 0 and 100");
        }

        Incident incident = new Incident();

        incident.setTitle(cleanTitle);
        incident.setDescription(cleanDescription);
        incident.setType(Enums.parse(IncidentType.class, type, "type"));
        incident.setSeverity(Enums.parse(Severity.class, severity, "severity"));
        incident.setRiskScore(riskScore);
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setReportedBy(user);
        incident.setReportedAt(LocalDateTime.now());
        incident.setAssignedTo(null);

        incident = incidentRepository.save(incident);

        auditLogService.log(user, incident, "INCIDENT_CREATED",
                "Reported: " + incident.getTitle());

        return incident;
    }

    // USER -> own incidents, ANALYST/ADMIN -> all incidents
    @Transactional(readOnly = true)
    public List<Incident> getIncidentsForUser(Authentication authentication) {

        User user = access.currentUser(authentication);

        if (AccessControl.isStaff(user)) {
            return incidentRepository.findAll();
        }

        return incidentRepository.findByReportedById(user.getId());
    }

    @Transactional(readOnly = true)
    public List<Incident> getIncidentsByUser(
            Long userId,
            Authentication authentication) {

        access.requireStaff(authentication);

        return incidentRepository.findByReportedById(userId);
    }

    public Incident updateStatus(
            Long incidentId,
            String status,
            Authentication authentication) {

        User actor = access.requireStaff(authentication);
        Incident incident = access.findIncident(incidentId);
        IncidentStatus newStatus =
                Enums.parse(IncidentStatus.class, status, "status");

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(newStatus);
        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, "STATUS_CHANGED",
                "Status changed from " + oldStatus + " to " + newStatus);

        return incident;
    }

    public Incident assignIncident(
            Long incidentId,
            Long assignedUserId,
            Authentication authentication) {

        User actor = access.requireAdmin(authentication);
        Incident incident = access.findIncident(incidentId);

        User assignee = userRepository.findById(assignedUserId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Assigned user not found"));

        if (!AccessControl.isStaff(assignee)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only ANALYST or ADMIN users can be assigned to incidents");
        }

        if (incident.getStatus() == IncidentStatus.RESOLVED
                || incident.getStatus() == IncidentStatus.CLOSED) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reopen the incident before assigning it");
        }

        incident.setAssignedTo(assignee);
        incident.setStatus(IncidentStatus.UNDER_INVESTIGATION);
        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, "INCIDENT_ASSIGNED",
                "Assigned to " + assignee.getName());

        return incident;
    }

    public Incident unassignIncident(
            Long incidentId,
            Authentication authentication) {

        User actor = access.requireAdmin(authentication);
        Incident incident = access.findIncident(incidentId);

        User previous = incident.getAssignedTo();
        incident.setAssignedTo(null);

        if (incident.getStatus() == IncidentStatus.UNDER_INVESTIGATION) {
            incident.setStatus(IncidentStatus.REPORTED);
        }

        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, "INCIDENT_UNASSIGNED",
                previous != null
                        ? "Unassigned from " + previous.getName()
                        : "Assignment cleared");

        return incident;
    }

    // Child rows go first; the audit entry for the deletion itself
    // is written with no incident so it survives.
    public void deleteIncident(
            Long incidentId,
            Authentication authentication) {

        User actor = access.requireAdmin(authentication);
        Incident incident = access.findIncident(incidentId);

        auditLogService.deleteByIncident(incidentId);
        noteRepository.deleteByIncidentId(incidentId);
        evidenceService.deleteByIncident(incidentId);

        auditLogService.log(actor, null, "INCIDENT_DELETED",
                "#" + incidentId + " " + incident.getTitle());

        incidentRepository.delete(incident);
    }

    private static String requireText(String value, String field, int maxLength) {

        if (value == null || value.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, field + " is required");
        }

        String text = value.trim();

        if (text.length() > maxLength) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    field + " must be at most " + maxLength + " characters");
        }

        return text;
    }
}
