package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
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

    @PostMapping
    public ResponseEntity<IncidentResponseDto> createIncident(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam String type,
            @RequestParam String severity,
            @RequestParam Integer riskScore,
            @RequestParam String email) {

        Incident incident = incidentService.createIncident(
                title, description, type, severity, riskScore, email
        );

        return ResponseEntity.ok(toDto(incident));
    }

    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getAllIncidents() {

        List<IncidentResponseDto> incidents =
                incidentService.getAllIncidents()
                        .stream()
                        .map(IncidentController::toDto)
                        .toList();

        return ResponseEntity.ok(incidents);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<IncidentResponseDto>> getIncidentsByUser(
            @PathVariable Long userId) {

        List<IncidentResponseDto> incidents =
                incidentService.getIncidentsByUser(userId)
                        .stream()
                        .map(IncidentController::toDto)
                        .toList();

        return ResponseEntity.ok(incidents);
    }

    @PutMapping("/{incidentId}/status")
    public ResponseEntity<IncidentResponseDto> updateStatus(
            @PathVariable Long incidentId,
            @RequestParam String status) {

        Incident incident = incidentService.updateStatus(
                incidentId,
                status
        );

        return ResponseEntity.ok(toDto(incident));
    }

    private static IncidentResponseDto toDto(Incident incident) {

        return new IncidentResponseDto(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),
                incident.getReportedBy().getId(),
                incident.getReportedBy().getName(),
                incident.getReportedBy().getEmail(),
                incident.getReportedAt()
        );
    }
}