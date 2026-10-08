package com.cyberguard.cyberincident.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;

    public UserController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // =========================================================
    // GET STAFF USERS
    // =========================================================
    // Returns only ANALYST and ADMIN users.
    // Used by ADMIN to assign incidents.
    // =========================================================

    @GetMapping("/staff")
    public ResponseEntity<List<UserResponse>> getStaffUsers() {

        List<UserResponse> staffUsers =
                userRepository.findAll()
                        .stream()
                        .filter(user ->
                                user.getRole() == Role.ANALYST ||
                                user.getRole() == Role.ADMIN
                        )
                        .map(user ->
                                new UserResponse(
                                        user.getId(),
                                        user.getName(),
                                        user.getEmail(),
                                        user.getRole().name()
                                )
                        )
                        .toList();

        return ResponseEntity.ok(staffUsers);
    }

    // =========================================================
    // SAFE USER RESPONSE
    // =========================================================
    // Password is NEVER sent to frontend.
    // =========================================================

    public static class UserResponse {

        private Long id;
        private String name;
        private String email;
        private String role;

        public UserResponse(
                Long id,
                String name,
                String email,
                String role) {

            this.id = id;
            this.name = name;
            this.email = email;
            this.role = role;
        }

        public Long getId() {
            return id;
        }

        public String getName() {
            return name;
        }

        public String getEmail() {
            return email;
        }

        public String getRole() {
            return role;
        }
    }
}