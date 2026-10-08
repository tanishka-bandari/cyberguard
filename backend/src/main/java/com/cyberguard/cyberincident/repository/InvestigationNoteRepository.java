package com.cyberguard.cyberincident.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cyberguard.cyberincident.model.InvestigationNote;

public interface InvestigationNoteRepository
        extends JpaRepository<InvestigationNote, Long> {

    @EntityGraph(attributePaths = {"addedBy", "incident"})
    List<InvestigationNote> findByIncidentId(Long incidentId);

    void deleteByIncidentId(Long incidentId);
}
