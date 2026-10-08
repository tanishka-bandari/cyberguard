package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.InvestigationNote;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.InvestigationNoteRepository;

@Service
@Transactional
public class InvestigationNoteService {

    private static final int MAX_NOTE_LENGTH = 2000;

    private final InvestigationNoteRepository noteRepository;
    private final AccessControl access;
    private final AuditLogService auditLogService;

    public InvestigationNoteService(
            InvestigationNoteRepository noteRepository,
            AccessControl access,
            AuditLogService auditLogService) {

        this.noteRepository = noteRepository;
        this.access = access;
        this.auditLogService = auditLogService;
    }

    public InvestigationNote addNote(
            Long incidentId,
            String content,
            Authentication authentication) {

        User user = access.requireStaff(authentication);
        Incident incident = access.findIncident(incidentId);

        if (content == null || content.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Note cannot be empty");
        }

        if (content.length() > MAX_NOTE_LENGTH) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Note must be at most " + MAX_NOTE_LENGTH + " characters");
        }

        InvestigationNote note = new InvestigationNote();

        note.setNote(content);
        note.setIncident(incident);
        note.setAddedBy(user);
        note.setCreatedAt(LocalDateTime.now());

        note = noteRepository.save(note);

        auditLogService.log(user, incident, "NOTE_ADDED",
                "Investigation note added");

        return note;
    }

    @Transactional(readOnly = true)
    public List<InvestigationNote> getNotesByIncident(
            Long incidentId,
            Authentication authentication) {

        User user = access.currentUser(authentication);
        access.requireStaffOrReporter(user, access.findIncident(incidentId));

        return noteRepository.findByIncidentId(incidentId);
    }
}
