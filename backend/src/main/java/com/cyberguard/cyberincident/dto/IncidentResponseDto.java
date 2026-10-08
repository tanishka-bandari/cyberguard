package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.IncidentType;
import com.cyberguard.cyberincident.model.Severity;
import com.cyberguard.cyberincident.model.User;

public record IncidentResponseDto(
        Long id,
        String title,
        String description,
        IncidentType type,
        Severity severity,
        IncidentStatus status,
        Integer riskScore,
        Long reportedById,
        String reportedByName,
        String reportedByEmail,
        Long assignedToId,
        String assignedToName,
        String assignedToEmail,
        LocalDateTime reportedAt) {

    public static IncidentResponseDto from(Incident incident) {

        User reporter = incident.getReportedBy();
        User assignee = incident.getAssignedTo();

        return new IncidentResponseDto(
                incident.getId(),
                incident.getTitle(),
                incident.getDescription(),
                incident.getType(),
                incident.getSeverity(),
                incident.getStatus(),
                incident.getRiskScore(),
                reporter.getId(),
                reporter.getName(),
                reporter.getEmail(),
                assignee != null ? assignee.getId() : null,
                assignee != null ? assignee.getName() : null,
                assignee != null ? assignee.getEmail() : null,
                incident.getReportedAt());
    }
}
