package com.cyberguard.cyberincident.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;

import com.cyberguard.cyberincident.model.Incident;
import com.cyberguard.cyberincident.model.InvestigationNote;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.IncidentRepository;
import com.cyberguard.cyberincident.repository.InvestigationNoteRepository;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
public class InvestigationNoteService {

    private final InvestigationNoteRepository noteRepository;
    private final IncidentRepository incidentRepository;
    private final UserRepository userRepository;

    public InvestigationNoteService(
            InvestigationNoteRepository noteRepository,
            IncidentRepository incidentRepository,
            UserRepository userRepository) {

        this.noteRepository = noteRepository;
        this.incidentRepository = incidentRepository;
        this.userRepository = userRepository;
    }

    public InvestigationNote addNote(
            Long incidentId,
            String note,
            String email) {

        Incident incident = incidentRepository.findById(incidentId)
                .orElseThrow(() ->
                        new RuntimeException("Incident not found"));

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new RuntimeException("User not found"));

        InvestigationNote investigationNote =
                new InvestigationNote();

        investigationNote.setNote(note);
        investigationNote.setIncident(incident);
        investigationNote.setAddedBy(user);
        investigationNote.setCreatedAt(LocalDateTime.now());

        return noteRepository.save(investigationNote);
    }

    public List<InvestigationNote> getNotesByIncident(
            Long incidentId) {

        return noteRepository.findByIncidentId(incidentId);
    }
}