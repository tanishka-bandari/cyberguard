package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.cyberguard.cyberincident.dto.InvestigationNoteResponseDto;
import com.cyberguard.cyberincident.model.InvestigationNote;
import com.cyberguard.cyberincident.service.InvestigationNoteService;

@RestController
@RequestMapping("/api/incidents")
public class InvestigationNoteController {

    private final InvestigationNoteService noteService;

    public InvestigationNoteController(
            InvestigationNoteService noteService) {

        this.noteService = noteService;
    }

    @PostMapping("/{incidentId}/notes")
    public ResponseEntity<InvestigationNoteResponseDto> addNote(
            @PathVariable Long incidentId,
            @RequestParam String content,
            Authentication authentication) {

        InvestigationNote investigationNote =
                noteService.addNote(
                        incidentId,
                        content,
                        authentication
                );

        return ResponseEntity.ok(
                toDto(investigationNote)
        );
    }

    @GetMapping("/{incidentId}/notes")
    public ResponseEntity<List<InvestigationNoteResponseDto>> getNotes(
            @PathVariable Long incidentId,
            Authentication authentication) {

        List<InvestigationNoteResponseDto> notes =
                noteService.getNotesByIncident(incidentId, authentication)
                        .stream()
                        .map(InvestigationNoteController::toDto)
                        .toList();

        return ResponseEntity.ok(notes);
    }

    private static InvestigationNoteResponseDto toDto(
            InvestigationNote note) {

        return new InvestigationNoteResponseDto(
                note.getId(),
                note.getNote(),
                note.getIncident().getId(),
                note.getAddedBy().getId(),
                note.getAddedBy().getName(),
                note.getAddedBy().getEmail(),
                note.getCreatedAt()
        );
    }
}