package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

public class InvestigationNoteResponseDto {

    private Long id;
    private String note;
    private Long incidentId;
    private Long addedById;
    private String addedByName;
    private String addedByEmail;
    private LocalDateTime createdAt;

    public InvestigationNoteResponseDto() {
    }

    public InvestigationNoteResponseDto(
            Long id,
            String note,
            Long incidentId,
            Long addedById,
            String addedByName,
            String addedByEmail,
            LocalDateTime createdAt) {

        this.id = id;
        this.note = note;
        this.incidentId = incidentId;
        this.addedById = addedById;
        this.addedByName = addedByName;
        this.addedByEmail = addedByEmail;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public String getNote() {
        return note;
    }

    public Long getIncidentId() {
        return incidentId;
    }

    public Long getAddedById() {
        return addedById;
    }

    public String getAddedByName() {
        return addedByName;
    }

    public String getAddedByEmail() {
        return addedByEmail;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}