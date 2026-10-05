package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cyberguard.cyberincident.dto.IncidentResponseDto;
import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.service.IncidentService;

@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    // =========================================================
    // CREATE INCIDENT
    // =========================================================

    // USER can report an incident.
    // The logged-in user's JWT determines who reported it.
    @PostMapping
    public ResponseEntity<IncidentResponseDto> createIncident(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String type,
            @RequestParam String severity,
            @RequestParam Integer riskScore,
            Authentication authentication) {

        String email = authentication.getName();

        Incident incident = incidentService.createIncident(
                title,
                description,
                type,
                severity,
                riskScore,
                email
        );

        return ResponseEntity.ok(toDto(incident));
    }

    // =========================================================
    // GET ALL / USER INCIDENTS
    // =========================================================

    // USER → own incidents
    // ANALYST/ADMIN → all incidents
    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getIncidents(
            Authentication authentication) {

        List<IncidentResponseDto> incidents =
                incidentService.getIncidentsForUser(
                        authentication
                )
                .stream()
                .map(IncidentController::toDto)
                .toList();

        return ResponseEntity.ok(incidents);
    }

    // =========================================================
    // GET INCIDENTS BY USER
    // =========================================================

    // ADMIN/ANALYST can view incidents belonging
    // to a specific user.
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IncidentResponseDto>> getIncidentsByUser(
            @PathVariable Long userId,
            Authentication authentication) {

        List<IncidentResponseDto> incidents =
                incidentService.getIncidentsByUser(
                        userId,
                        authentication
                )
                .stream()
                .map(IncidentController::toDto)
                .toList();

        return ResponseEntity.ok(incidents);
    }

    // =========================================================
    // UPDATE INCIDENT STATUS
    // =========================================================

    // USER → can update their own incident
    // ANALYST/ADMIN → can update any incident
    @PutMapping("/{incidentId}/status")
    public ResponseEntity<IncidentResponseDto> updateStatus(
            @PathVariable Long incidentId,
            @RequestParam String status,
            Authentication authentication) {

        Incident incident = incidentService.updateStatus(
                incidentId,
                status,
                authentication
        );

        return ResponseEntity.ok(toDto(incident));
    }

    // =========================================================
    // ASSIGN INCIDENT
    // =========================================================

    // ADMIN → assign incident to an ANALYST or ADMIN
    //
    // Example:
    // PUT /api/incidents/1/assign?userId=3
    @PutMapping("/{incidentId}/assign")
    public ResponseEntity<IncidentResponseDto> assignIncident(
            @PathVariable Long incidentId,
            @RequestParam Long userId,
            Authentication authentication) {

        Incident incident = incidentService.assignIncident(
                incidentId,
                userId,
                authentication
        );

        return ResponseEntity.ok(toDto(incident));
    }

    // =========================================================
    // UNASSIGN INCIDENT
    // =========================================================

    // ADMIN → remove current assignment
    //
    // Example:
    // PUT /api/incidents/1/unassign
    @PutMapping("/{incidentId}/unassign")
    public ResponseEntity<IncidentResponseDto> unassignIncident(
            @PathVariable Long incidentId,
            Authentication authentication) {

        Incident incident = incidentService.unassignIncident(
                incidentId,
                authentication
        );

        return ResponseEntity.ok(toDto(incident));
    }

    // =========================================================
    // DELETE INCIDENT
    // =========================================================

    // ADMIN only
    @DeleteMapping("/{incidentId}")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable Long incidentId,
            Authentication authentication) {

        incidentService.deleteIncident(
                incidentId,
                authentication
        );

        return ResponseEntity.noContent().build();
    }

    // =========================================================
    // CONVERT INCIDENT → DTO
    // =========================================================

    private static IncidentResponseDto toDto(Incident incident) {

        Long assignedToId = null;
        String assignedToName = null;
        String assignedToEmail = null;

        /*
         * An incident may not have an assigned employee yet.
         * Therefore we check for null before accessing the user.
         */
        if (incident.getAssignedTo() != null) {

            assignedToId =
                    incident.getAssignedTo().getId();

            assignedToName =
                    incident.getAssignedTo().getName();

            assignedToEmail =
                    incident.getAssignedTo().getEmail();
        }

        return new IncidentResponseDto(

                // Incident details
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),

                // Reported by
                incident.getReportedBy().getId(),
                incident.getReportedBy().getName(),
                incident.getReportedBy().getEmail(),

                // Assigned to
                assignedToId,
                assignedToName,
                assignedToEmail,

                // Report time
                incident.getReportedAt()
        );
    }
}