package com.cyberguard.cyberincident.dto;

import java.time.LocalDateTime;

import com.cyberguard.cyberincident.model.InvestigationNote;

public record InvestigationNoteResponseDto(
        Long id,
        String note,
        Long incidentId,
        Long addedById,
        String addedByName,
        String addedByEmail,
        LocalDateTime createdAt) {

    public static InvestigationNoteResponseDto from(InvestigationNote note) {
        return new InvestigationNoteResponseDto(
                note.getId(),
                note.getNote(),
                note.getIncident().getId(),
                note.getAddedBy().getId(),
                note.getAddedBy().getName(),
                note.getAddedBy().getEmail(),
                note.getCreatedAt());
    }
}
