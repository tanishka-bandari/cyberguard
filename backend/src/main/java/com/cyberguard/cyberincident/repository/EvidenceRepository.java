package com.cyberguard.cyberincident.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cyberguard.cyberincident.model.Evidence;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    @EntityGraph(attributePaths = {"uploadedBy", "incident"})
    List<Evidence> findByIncidentId(Long incidentId);
}
