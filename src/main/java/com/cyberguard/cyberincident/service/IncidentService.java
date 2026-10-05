package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public IncidentService(
            IncidentRepository incidentRepository,
            UserRepository userRepository) {

        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    // =========================================================
    // CREATE INCIDENT
    // =========================================================

    public Incident createIncident(
            String title,
            String description,
            String type,
            String severity,
            Integer riskScore,
            String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        Incident incident = new Incident();

        incident.setTitle(title);
        incident.setDescription(description);

        incident.setType(
                com.cyberguard.cyberincident.model.IncidentType
                        .valueOf(type)
        );

        incident.setSeverity(
                com.cyberguard.cyberincident.model.Severity
                        .valueOf(severity)
        );

        incident.setRiskScore(riskScore);
        incident.setStatus(IncidentStatus.REPORTED);
        incident.setReportedBy(user);
        incident.setReportedAt(LocalDateTime.now());

        // New incident is initially unassigned
        incident.setAssignedTo(null);

        return incidentRepository.save(incident);
    }

    // =========================================================
    // GET INCIDENTS
    // =========================================================

    // USER → own incidents
    // ANALYST/ADMIN → all incidents
    public List<Incident> getIncidentsForUser(
            Authentication authentication) {

        User user = getAuthenticatedUser(authentication);

        if (isStaff(user)) {
            return incidentRepository.findAll();
        }

        return incidentRepository.findByReportedById(user.getId());
    }

    // Specific user's incidents.
    // Only ANALYST/ADMIN can use this.
    public List<Incident> getIncidentsByUser(
            Long userId,
            Authentication authentication) {

        User authenticatedUser =
                getAuthenticatedUser(authentication);

        if (!isStaff(authenticatedUser)) {
            throw new RuntimeException(
                    "Access denied. Only ANALYST or ADMIN can view other users' incidents."
            );
        }

        return incidentRepository.findByReportedById(userId);
    }

    // =========================================================
    // UPDATE STATUS
    // =========================================================

    // USER → can update ONLY their own incident
    // ANALYST/ADMIN → can update any incident
    public Incident updateStatus(
            Long incidentId,
            String status,
            Authentication authentication) {

        User authenticatedUser =
                getAuthenticatedUser(authentication);

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        if (!isStaff(authenticatedUser)
                && !incident.getReportedBy().getId()
                        .equals(authenticatedUser.getId())) {

            throw new RuntimeException(
                    "Access denied. You can update only your own incident."
            );
        }

        incident.setStatus(
                IncidentStatus.valueOf(status)
        );

        return incidentRepository.save(incident);
    }

    // =========================================================
    // ASSIGN INCIDENT
    // =========================================================

    // ADMIN → can assign an incident to an ANALYST/ADMIN
    public Incident assignIncident(
            Long incidentId,
            Long assignedUserId,
            Authentication authentication) {

        User authenticatedUser =
                getAuthenticatedUser(authentication);

        // Only ADMIN can assign incidents
        if (authenticatedUser.getRole() != Role.ADMIN) {
            throw new RuntimeException(
                    "Access denied. Only ADMIN can assign incidents."
            );
        }

        // Find incident
        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        // Find employee/analyst
        User assignedUser = userRepository.findById(assignedUserId)
                .orElseThrow(() ->
                        new RuntimeException("Assigned user not found"));

        // Only staff members can be assigned
        if (!isStaff(assignedUser)) {
            throw new RuntimeException(
                    "Only ANALYST or ADMIN users can be assigned to incidents."
            );
        }

        // Assign the incident
        incident.setAssignedTo(assignedUser);

        // Once assigned, move incident into investigation
        incident.setStatus(
                IncidentStatus.UNDER_INVESTIGATION
        );

        return incidentRepository.save(incident);
    }

    // =========================================================
    // UNASSIGN INCIDENT
    // =========================================================

    // ADMIN → can remove the current assignment
    public Incident unassignIncident(
            Long incidentId,
            Authentication authentication) {

        User authenticatedUser =
                getAuthenticatedUser(authentication);

        if (authenticatedUser.getRole() != Role.ADMIN) {
            throw new RuntimeException(
                    "Access denied. Only ADMIN can unassign incidents."
            );
        }

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        // Remove assigned employee
        incident.setAssignedTo(null);

        // If it was still being investigated,
        // return it to REPORTED state
        if (incident.getStatus()
                == IncidentStatus.UNDER_INVESTIGATION) {

            incident.setStatus(
                    IncidentStatus.REPORTED
            );
        }

        return incidentRepository.save(incident);
    }

    // =========================================================
    // DELETE INCIDENT
    // =========================================================

    // ADMIN only
    public void deleteIncident(
            Long incidentId,
            Authentication authentication) {

        User authenticatedUser =
                getAuthenticatedUser(authentication);

        if (authenticatedUser.getRole() != Role.ADMIN) {
            throw new RuntimeException(
                    "Access denied. Only ADMIN can delete incidents."
            );
        }

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        incidentRepository.delete(incident);
    }

    // =========================================================
    // AUTHENTICATED USER
    // =========================================================

    private User getAuthenticatedUser(
            Authentication authentication) {

        if (authentication == null
                || authentication.getName() == null) {

            throw new RuntimeException(
                    "User is not authenticated"
            );
        }

        return userRepository.findByEmail(
                authentication.getName()
        ).orElseThrow(() ->
                new RuntimeException("Authenticated user not found")
        );
    }

    // =========================================================
    // ROLE CHECK
    // =========================================================

    private boolean isStaff(User user) {

        return user.getRole() == Role.ADMIN
                || user.getRole() == Role.ANALYST;
    }
}