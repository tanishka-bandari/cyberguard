package com.cyberguard.cyberincident.repository;

import com.cyberguard.cyberincident.model.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, Long> {

    List<Evidence> findByIncidentId(Long incidentId);
}

