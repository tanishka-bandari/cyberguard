package com.cyberguard.cyberincident;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.hasItem;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.nullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.UserRepository;
import com.jayway.jsonpath.JsonPath;

@SpringBootTest
@AutoConfigureMockMvc
class IncidentLifecycleTest {

    private static final String PASSWORD = "correct-horse-1";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void userSeesOnlyOwnIncidents() throws Exception {
        Account owner = createAccount(Role.USER);
        Account other = createAccount(Role.USER);

        createIncident(owner, "Phishing mail");

        mockMvc.perform(get("/api/incidents").header("Authorization", owner.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title").value("Phishing mail"));

        mockMvc.perform(get("/api/incidents").header("Authorization", other.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));
    }

    @Test
    void userCannotChangeStatusOrAssign() throws Exception {
        Account user = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        long id = createIncident(user, "Lost laptop");

        mockMvc.perform(put("/api/incidents/{id}/status", id)
                        .param("status", "CLOSED")
                        .header("Authorization", user.bearer()))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.status").value(403));

        mockMvc.perform(put("/api/incidents/{id}/assign", id)
                        .param("userId", String.valueOf(analyst.id))
                        .header("Authorization", user.bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void analystCannotAssignButCanChangeStatus() throws Exception {
        Account user = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        long id = createIncident(user, "Odd login");

        mockMvc.perform(put("/api/incidents/{id}/assign", id)
                        .param("userId", String.valueOf(analyst.id))
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/incidents/{id}/status", id)
                        .param("status", "TRIAGED")
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("TRIAGED"));
    }

    @Test
    void invalidInputIsBadRequest() throws Exception {
        Account user = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        long id = createIncident(user, "Spam wave");

        mockMvc.perform(post("/api/incidents")
                        .param("title", "x").param("description", "y")
                        .param("type", "NOT_A_TYPE").param("severity", "LOW")
                        .param("riskScore", "10")
                        .header("Authorization", user.bearer()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/incidents")
                        .param("title", "x").param("description", "y")
                        .param("type", "PHISHING").param("severity", "LOW")
                        .param("riskScore", "101")
                        .header("Authorization", user.bearer()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/incidents/{id}/status", id)
                        .param("status", "NOT_A_STATUS")
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isBadRequest());
    }

    @Test
    void adminAssignsAnalystWhoAddsNoteAndOtherUserIsDenied() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account stranger = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        Account admin = createAccount(Role.ADMIN);
        long id = createIncident(reporter, "Ransom note on server");

        mockMvc.perform(put("/api/incidents/{id}/assign", id)
                        .param("userId", String.valueOf(analyst.id))
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToId").value(analyst.id))
                .andExpect(jsonPath("$.status").value("UNDER_INVESTIGATION"));

        mockMvc.perform(post("/api/incidents/{id}/notes", id)
                        .param("content", "Isolated the host")
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.note").value("Isolated the host"));

        mockMvc.perform(post("/api/incidents/{id}/notes", id)
                        .param("content", "Reporter must not write")
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/incidents/{id}/notes", id)
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)));

        mockMvc.perform(get("/api/incidents/{id}/notes", id)
                        .header("Authorization", stranger.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/audit-logs/incident/{id}", id)
                        .header("Authorization", stranger.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(get("/api/audit-logs/incident/{id}", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].action", hasItem("INCIDENT_CREATED")))
                .andExpect(jsonPath("$[*].action", hasItem("INCIDENT_ASSIGNED")))
                .andExpect(jsonPath("$[*].action", hasItem("NOTE_ADDED")));
    }

    @Test
    void resolvedIncidentCannotBeAssignedAndAuditLogIsOldestFirst() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        Account admin = createAccount(Role.ADMIN);
        long id = createIncident(reporter, "Old laptop theft");

        mockMvc.perform(put("/api/incidents/{id}/status", id)
                        .param("status", "RESOLVED")
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk());

        mockMvc.perform(put("/api/incidents/{id}/assign", id)
                        .param("userId", String.valueOf(analyst.id))
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(get("/api/audit-logs/incident/{id}", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("INCIDENT_CREATED"));
    }

    @Test
    void statusAndAssigneeStayConsistent() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        Account admin = createAccount(Role.ADMIN);
        long id = createIncident(reporter, "Credential stuffing");

        for (String status : new String[] {"ASSIGNED", "UNDER_INVESTIGATION", "CONTAINED"}) {
            mockMvc.perform(put("/api/incidents/{id}/status", id)
                            .param("status", status)
                            .header("Authorization", analyst.bearer()))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.message")
                            .value("Assign the incident before moving it to " + status));
        }

        assign(id, analyst, admin).andExpect(jsonPath("$.status").value("UNDER_INVESTIGATION"));

        setStatus(id, "CONTAINED", analyst).andExpect(status().isOk());

        // Assigning someone else must not drag a contained incident backwards.
        assign(id, admin, admin).andExpect(jsonPath("$.status").value("CONTAINED"));

        mockMvc.perform(put("/api/incidents/{id}/unassign", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.assignedToId").doesNotExist())
                .andExpect(jsonPath("$.status").value("REPORTED"));

        setStatus(id, "RESOLVED", analyst).andExpect(status().isOk());
        mockMvc.perform(put("/api/incidents/{id}/unassign", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(jsonPath("$.status").value("RESOLVED"));
    }

    @Test
    void reporterSeesOnlyStatusAndAssignmentEntriesWithoutEmails() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account analyst = createAccount(Role.ANALYST);
        Account admin = createAccount(Role.ADMIN);
        long id = createIncident(reporter, "Shared drive exposed");

        assign(id, analyst, admin);
        mockMvc.perform(post("/api/incidents/{id}/notes", id)
                        .param("content", "Internal detail")
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk());
        mockMvc.perform(multipart("/api/incidents/{id}/evidence", id)
                        .file(new MockMultipartFile("file", "a.log", "text/plain", "x".getBytes()))
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/audit-logs/incident/{id}", id)
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].action").value("INCIDENT_CREATED"))
                .andExpect(jsonPath("$[1].action").value("INCIDENT_ASSIGNED"))
                .andExpect(jsonPath("$[*].userEmail", everyItem(nullValue())));

        mockMvc.perform(get("/api/audit-logs/incident/{id}", id)
                        .header("Authorization", analyst.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(4)))
                .andExpect(jsonPath("$[*].action", hasItem("EVIDENCE_UPLOADED")))
                .andExpect(jsonPath("$[0].userEmail").isNotEmpty());
    }

    @Test
    void evidenceUploadDownloadAndAccess() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account stranger = createAccount(Role.USER);
        long id = createIncident(reporter, "Suspicious attachment");
        MockMultipartFile file = new MockMultipartFile(
                "file", "../../evil name.TXT", "text/plain", "hello".getBytes());

        String body = mockMvc.perform(multipart("/api/incidents/{id}/evidence", id)
                        .file(file)
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fileName").value("evil name.TXT"))
                .andExpect(jsonPath("$.sha256Hash").value(
                        "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"))
                .andReturn().getResponse().getContentAsString();
        int evidenceId = JsonPath.read(body, "$.id");

        mockMvc.perform(get("/api/incidents/{id}/evidence/{eid}/file", id, evidenceId)
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isOk())
                .andExpect(content().string("hello"))
                .andExpect(header().string("Content-Disposition", containsString("attachment")));

        mockMvc.perform(get("/api/incidents/{id}/evidence", id)
                        .header("Authorization", stranger.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(multipart("/api/incidents/{id}/evidence", id)
                        .file(file)
                        .header("Authorization", stranger.bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminDeletesIncidentWithNotesAndEvidence() throws Exception {
        Account reporter = createAccount(Role.USER);
        Account admin = createAccount(Role.ADMIN);
        long id = createIncident(reporter, "Doomed incident");

        mockMvc.perform(post("/api/incidents/{id}/notes", id)
                        .param("content", "A note")
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk());

        mockMvc.perform(multipart("/api/incidents/{id}/evidence", id)
                        .file(new MockMultipartFile("file", "a.log", "text/plain", "x".getBytes()))
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk());

        mockMvc.perform(delete("/api/incidents/{id}", id)
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(delete("/api/incidents/{id}", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/incidents/{id}/notes", id)
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isNotFound());

        mockMvc.perform(get("/api/audit-logs/recent?limit=5")
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].action").value("INCIDENT_DELETED"))
                .andExpect(jsonPath("$[0].details").value("#" + id + " Doomed incident"))
                .andExpect(jsonPath("$[0].incidentId").doesNotExist());

        mockMvc.perform(get("/api/audit-logs/recent")
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isForbidden());
    }

    @Test
    void adminManagesUserRoles() throws Exception {
        Account admin = createAccount(Role.ADMIN);
        Account user = createAccount(Role.USER);

        mockMvc.perform(get("/api/users").header("Authorization", user.bearer()))
                .andExpect(status().isForbidden());

        mockMvc.perform(put("/api/users/{id}/role", user.id)
                        .param("role", "ANALYST")
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.role").value("ANALYST"));

        mockMvc.perform(put("/api/users/{id}/role", user.id)
                        .param("role", "SUPERUSER")
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isBadRequest());

        mockMvc.perform(put("/api/users/{id}/role", admin.id)
                        .param("role", "USER")
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isBadRequest());
    }

    private ResultActions assign(long incidentId, Account assignee, Account admin) throws Exception {
        return mockMvc.perform(put("/api/incidents/{id}/assign", incidentId)
                        .param("userId", String.valueOf(assignee.id))
                        .header("Authorization", admin.bearer()))
                .andExpect(status().isOk());
    }

    private ResultActions setStatus(long incidentId, String status, Account staff) throws Exception {
        return mockMvc.perform(put("/api/incidents/{id}/status", incidentId)
                .param("status", status)
                .header("Authorization", staff.bearer()));
    }

    private long createIncident(Account reporter, String title) throws Exception {
        String body = mockMvc.perform(post("/api/incidents")
                        .param("title", title)
                        .param("description", "Details for " + title)
                        .param("type", "PHISHING")
                        .param("severity", "HIGH")
                        .param("riskScore", "70")
                        .header("Authorization", reporter.bearer()))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return ((Number) JsonPath.read(body, "$.id")).longValue();
    }

    private Account createAccount(Role role) throws Exception {
        User user = new User();
        user.setName("Test " + role);
        user.setEmail(role.name().toLowerCase() + "-" + UUID.randomUUID() + "@example.com");
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(role);
        user = userRepository.save(user);

        String body = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\":\"" + user.getEmail()
                                + "\",\"password\":\"" + PASSWORD + "\"}"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        return new Account(user.getId(), JsonPath.read(body, "$.token"));
    }

    private record Account(Long id, String token) {
        String bearer() {
            return "Bearer " + token;
        }
    }
}
