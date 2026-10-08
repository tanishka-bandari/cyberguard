package com.cyberguard.cyberincident.service;

import java.util.Set;

/** Values of the audit_logs.action column. */
final class AuditActions {

    static final String INCIDENT_CREATED = "INCIDENT_CREATED";
    static final String STATUS_CHANGED = "STATUS_CHANGED";
    static final String INCIDENT_ASSIGNED = "INCIDENT_ASSIGNED";
    static final String INCIDENT_UNASSIGNED = "INCIDENT_UNASSIGNED";
    static final String INCIDENT_DELETED = "INCIDENT_DELETED";
    static final String NOTE_ADDED = "NOTE_ADDED";
    static final String EVIDENCE_UPLOADED = "EVIDENCE_UPLOADED";

    /** The actions a reporter may see on their own incident. */
    static final Set<String> REPORTER_VISIBLE = Set.of(
            INCIDENT_CREATED, STATUS_CHANGED,
            INCIDENT_ASSIGNED, INCIDENT_UNASSIGNED);

    private AuditActions() {
    }
}
