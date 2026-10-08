package com.cyberguard.cyberincident;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.util.UUID;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

@SpringBootTest
@AutoConfigureMockMvc
class AuthControllerTest {

    private static final String PASSWORD = "correct-horse-1";

    @Autowired
    private MockMvc mockMvc;

    @Test
    void registerThenLoginReturnsToken() throws Exception {
        String email = uniqueEmail();

        register(email).andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.role").value("USER"))
                .andExpect(jsonPath("$.password").doesNotExist());

        login(email, PASSWORD).andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isNotEmpty())
                .andExpect(jsonPath("$.role").value("USER"));
    }

    @Test
    void wrongPasswordIsUnauthorized() throws Exception {
        String email = uniqueEmail();
        register(email).andExpect(status().isOk());

        login(email, "not-the-password").andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401))
                .andExpect(jsonPath("$.message").value("Invalid email or password"));
    }

    @Test
    void duplicateEmailIsConflict() throws Exception {
        String email = uniqueEmail();
        register(email).andExpect(status().isOk());

        register(email).andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    @Test
    void invalidRegistrationIsBadRequest() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                        .param("name", "A")
                        .param("email", "not-an-email")
                        .param("password", "short"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value(containsString("Name")));
    }

    @Test
    void incidentsWithoutTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/incidents"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    void incidentsWithGarbageTokenIsUnauthorized() throws Exception {
        mockMvc.perform(get("/api/incidents")
                        .header("Authorization", "Bearer not.a.token"))
                .andExpect(status().isUnauthorized());
    }

    private ResultActions register(String email) throws Exception {
        return mockMvc.perform(post("/api/auth/register")
                .param("name", "Test Person")
                .param("email", email)
                .param("password", PASSWORD));
    }

    private ResultActions login(String email, String password) throws Exception {
        return mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"" + email + "\",\"password\":\"" + password + "\"}"));
    }

    private static String uniqueEmail() {
        return "auth-" + UUID.randomUUID() + "@example.com";
    }
}
