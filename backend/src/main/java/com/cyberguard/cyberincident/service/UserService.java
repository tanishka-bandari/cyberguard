package com.cyberguard.cyberincident.service;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.UserRepository;

@Service
public class UserService {

    private static final Pattern EMAIL =
            Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    // BCrypt ignores everything after 72 bytes.
    private static final int MAX_PASSWORD_BYTES = 72;

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AccessControl access;

    public UserService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       AccessControl access) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.access = access;
    }

    public User registerUser(String name, String email, String password) {

        String cleanName = name == null ? "" : name.trim();
        String cleanEmail = email == null ? "" : email.trim();

        if (cleanName.length() < 2 || cleanName.length() > 100) {
            throw badRequest("Name must be 2 to 100 characters");
        }

        if (cleanEmail.length() > 254 || !EMAIL.matcher(cleanEmail).matches()) {
            throw badRequest("Enter a valid email address");
        }

        if (password == null || password.length() < 8
                || password.getBytes(StandardCharsets.UTF_8).length > MAX_PASSWORD_BYTES) {
            throw badRequest("Password must be at least 8 characters");
        }

        if (userRepository.existsByEmail(cleanEmail)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Email already registered");
        }

        User user = new User();

        user.setName(cleanName);
        user.setEmail(cleanEmail);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(Role.USER);

        return userRepository.save(user);
    }

    public User loginUser(String email, String password) {

        if (email == null || password == null) {
            throw badRequest("Email and password are required");
        }

        User user = userRepository.findByEmail(email.trim())
                .orElseThrow(UserService::invalidCredentials);

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw invalidCredentials();
        }

        return user;
    }

    public List<User> getAllUsers(Authentication authentication) {

        access.requireAdmin(authentication);

        return userRepository.findAll();
    }

    public List<User> getStaffUsers(Authentication authentication) {

        access.requireStaff(authentication);

        return userRepository.findAll().stream()
                .filter(AccessControl::isStaff)
                .toList();
    }

    public User changeRole(
            Long userId,
            String role,
            Authentication authentication) {

        User admin = access.requireAdmin(authentication);
        Role newRole = Enums.parse(Role.class, role, "role");

        User target = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "User not found"));

        if (target.getId().equals(admin.getId())) {
            throw badRequest("You cannot change your own role");
        }

        target.setRole(newRole);

        return userRepository.save(target);
    }

    private static ResponseStatusException badRequest(String message) {
        return new ResponseStatusException(HttpStatus.BAD_REQUEST, message);
    }

    private static ResponseStatusException invalidCredentials() {
        return new ResponseStatusException(
                HttpStatus.UNAUTHORIZED, "Invalid email or password");
    }
}
