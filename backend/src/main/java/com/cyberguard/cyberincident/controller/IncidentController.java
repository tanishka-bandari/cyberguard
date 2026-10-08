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
            Authentication authentication) {

        return ResponseEntity.ok(IncidentResponseDto.from(
                incidentService.createIncident(
                        title, description, type, severity, riskScore,
                        authentication)));
    }

    // A USER gets their own incidents, staff get all of them.
    @GetMapping
    public ResponseEntity<List<IncidentResponseDto>> getIncidents(
            Authentication authentication) {

        return ResponseEntity.ok(
                incidentService.getIncidentsForUser(authentication).stream()
                        .map(IncidentResponseDto::from)
                        .toList());
    }

    @PutMapping("/{incidentId}/status")
    public ResponseEntity<IncidentResponseDto> updateStatus(
            @PathVariable Long incidentId,
            @RequestParam String status,
            Authentication authentication) {

        return ResponseEntity.ok(IncidentResponseDto.from(
                incidentService.updateStatus(incidentId, status, authentication)));
    }

    @PutMapping("/{incidentId}/assign")
    public ResponseEntity<IncidentResponseDto> assignIncident(
            @PathVariable Long incidentId,
            @RequestParam Long userId,
            Authentication authentication) {

        return ResponseEntity.ok(IncidentResponseDto.from(
                incidentService.assignIncident(incidentId, userId, authentication)));
    }

    @PutMapping("/{incidentId}/unassign")
    public ResponseEntity<IncidentResponseDto> unassignIncident(
            @PathVariable Long incidentId,
            Authentication authentication) {

        return ResponseEntity.ok(IncidentResponseDto.from(
                incidentService.unassignIncident(incidentId, authentication)));
    }

    @DeleteMapping("/{incidentId}")
    public ResponseEntity<Void> deleteIncident(
            @PathVariable Long incidentId,
            Authentication authentication) {

        incidentService.deleteIncident(incidentId, authentication);

        return ResponseEntity.noContent().build();
    }
}
