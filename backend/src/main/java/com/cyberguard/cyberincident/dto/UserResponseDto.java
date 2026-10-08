package com.cyberguard.cyberincident.dto;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;

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

    public static UserResponseDto from(User user) {
        return new UserResponseDto(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole()
        );
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