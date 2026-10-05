package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

import com.cyberguard.cyberincident.model.IncidentStatus;
import com.cyberguard.cyberincident.model.IncidentType;
import com.cyberguard.cyberincident.model.Severity;

public class IncidentResponseDto {

    private Long id;
    private String title;
    private String description;
    private IncidentType type;
    private Severity severity;
    private IncidentStatus status;
    private Integer riskScore;

    private Long reportedById;
    private String reportedByName;
    private String reportedByEmail;

    private Long assignedToId;
    private String assignedToName;
    private String assignedToEmail;

    private LocalDateTime reportedAt;

    public IncidentResponseDto() {
    }

    public IncidentResponseDto(
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

        this.id = id;
        this.title = title;
        this.description = description;
        this.type = type;
        this.severity = severity;
        this.status = status;
        this.riskScore = riskScore;

        this.reportedById = reportedById;
        this.reportedByName = reportedByName;
        this.reportedByEmail = reportedByEmail;

        this.assignedToId = assignedToId;
        this.assignedToName = assignedToName;
        this.assignedToEmail = assignedToEmail;

        this.reportedAt = reportedAt;
    }

    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public IncidentType getType() {
        return type;
    }

    public Severity getSeverity() {
        return severity;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public Integer getRiskScore() {
        return riskScore;
    }

    public Long getReportedById() {
        return reportedById;
    }

    public String getReportedByName() {
        return reportedByName;
    }

    public String getReportedByEmail() {
        return reportedByEmail;
    }

    public Long getAssignedToId() {
        return assignedToId;
    }

    public String getAssignedToName() {
        return assignedToName;
    }

    public String getAssignedToEmail() {
        return assignedToEmail;
    }

    public LocalDateTime getReportedAt() {
        return reportedAt;
    }
}