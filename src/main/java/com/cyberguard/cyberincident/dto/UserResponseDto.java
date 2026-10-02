package com.cyberguard.cyberincident.dto;

import com.cyberguard.cyberincident.model.Role;

public class UserResponseDto {

    private Long id;
    private String name;
    private String email;
    private Role role;

    public UserResponseDto() {
    }

    public UserResponseDto(Long id, String name, String email, Role role) {
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

    public Role getRole() {
        return role;
    }
}