package com.cyberguard.cyberincident.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.cyberguard.cyberincident.model.Role;
import com.cyberguard.cyberincident.model.User;
import com.cyberguard.cyberincident.repository.UserRepository;

/** Accounts for the end-to-end test database. Never active in production. */
@Component
@Profile("e2e")
public class DemoDataSeeder implements CommandLineRunner {

    private static final String PASSWORD = "Passw0rd!e2e";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DemoDataSeeder(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        seed("Admin User", "admin@cyberguard.test", Role.ADMIN);
        seed("Analyst One", "analyst@cyberguard.test", Role.ANALYST);
        seed("Analyst Two", "analyst2@cyberguard.test", Role.ANALYST);
        seed("Reporter One", "user@cyberguard.test", Role.USER);
        seed("Reporter Two", "user2@cyberguard.test", Role.USER);
    }

    private void seed(String name, String email, Role role) {

        if (userRepository.existsByEmailIgnoreCase(email)) {
            return;
        }

        User user = new User();

        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(PASSWORD));
        user.setRole(role);

        userRepository.save(user);
    }
}
