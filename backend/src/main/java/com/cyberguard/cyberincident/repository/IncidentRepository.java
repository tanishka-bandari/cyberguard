package com.cyberguard.cyberincident.repository;

import java.util.List;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import com.cyberguard.cyberincident.model.Incident;

public interface IncidentRepository extends JpaRepository<Incident, Long> {

    // Load both users in the same query instead of one query per row.
    @Override
    @EntityGraph(attributePaths = {"reportedBy", "assignedTo"})
    List<Incident> findAll();

    @EntityGraph(attributePaths = {"reportedBy", "assignedTo"})
    List<Incident> findByReportedById(Long userId);
}
