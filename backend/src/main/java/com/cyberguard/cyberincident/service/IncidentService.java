package com.cyberguard.cyberincident.service;

import static com.cyberguard.cyberincident.service.AuditActions.INCIDENT_ASSIGNED;
import static com.cyberguard.cyberincident.service.AuditActions.INCIDENT_CREATED;
import static com.cyberguard.cyberincident.service.AuditActions.INCIDENT_DELETED;
import static com.cyberguard.cyberincident.service.AuditActions.INCIDENT_UNASSIGNED;
import static com.cyberguard.cyberincident.service.AuditActions.STATUS_CHANGED;
import static com.cyberguard.cyberincident.service.Validation.badRequest;
import static com.cyberguard.cyberincident.service.Validation.requireText;

import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Set;

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

    // Statuses that mean someone is working on the incident.
    private static final Set<IncidentStatus> NEEDS_ASSIGNEE = EnumSet.of(
            IncidentStatus.ASSIGNED,
            IncidentStatus.UNDER_INVESTIGATION,
            IncidentStatus.CONTAINED);

    private static final Set<IncidentStatus> STARTS_INVESTIGATION_ON_ASSIGN = EnumSet.of(
            IncidentStatus.REPORTED,
            IncidentStatus.TRIAGED,
            IncidentStatus.ASSIGNED);

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

    // Any signed-in user can report; the token decides who the reporter is.
    public Incident createIncident(
            String title,
            String description,
            String type,
            String severity,
            Integer riskScore,
            Authentication authentication) {

        User user = access.currentUser(authentication);

        String cleanTitle = requireText(title, "Title", MAX_TITLE_LENGTH);
        String cleanDescription =
                requireText(description, "Description", MAX_DESCRIPTION_LENGTH);

        if (riskScore == null || riskScore < 0 || riskScore > 100) {
            throw badRequest("Risk score must be between 0 and 100");
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
        incident = incidentRepository.save(incident);

        auditLogService.log(user, incident, INCIDENT_CREATED,
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

    public Incident updateStatus(
            Long incidentId,
            String status,
            Authentication authentication) {

        User actor = access.requireStaff(authentication);
        Incident incident = access.findIncident(incidentId);
        IncidentStatus newStatus =
                Enums.parse(IncidentStatus.class, status, "status");

        if (incident.getAssignedTo() == null && NEEDS_ASSIGNEE.contains(newStatus)) {
            throw badRequest("Assign the incident before moving it to " + newStatus);
        }

        IncidentStatus oldStatus = incident.getStatus();
        incident.setStatus(newStatus);
        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, STATUS_CHANGED,
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
            throw badRequest("Only ANALYST or ADMIN users can be assigned to incidents");
        }

        if (incident.getStatus() == IncidentStatus.RESOLVED
                || incident.getStatus() == IncidentStatus.CLOSED) {
            throw badRequest("Reopen the incident before assigning it");
        }

        incident.setAssignedTo(assignee);
        if (STARTS_INVESTIGATION_ON_ASSIGN.contains(incident.getStatus())) {
            incident.setStatus(IncidentStatus.UNDER_INVESTIGATION);
        }
        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, INCIDENT_ASSIGNED,
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

        if (NEEDS_ASSIGNEE.contains(incident.getStatus())) {
            incident.setStatus(IncidentStatus.REPORTED);
        }

        incident = incidentRepository.save(incident);

        auditLogService.log(actor, incident, INCIDENT_UNASSIGNED,
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

        auditLogService.log(actor, null, INCIDENT_DELETED,
                "#" + incidentId + " " + incident.getTitle());

        incidentRepository.delete(incident);
    }
}
