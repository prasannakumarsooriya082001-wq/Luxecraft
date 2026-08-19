package com.luxecraft.luxecraft.Config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.luxecraft.luxecraft.Model.AdminModel;
import com.luxecraft.luxecraft.Repository.AdminRepository;

/**
 * Creates the first admin account on startup.
 *
 * There is no admin sign-up endpoint - /admin only exposes login, profile
 * and change-password - so on a brand new database (a fresh deployment)
 * there is no way in. This fills that gap once, from configuration.
 *
 * Nothing happens unless app.admin.seed.password is set, so the password
 * never has to live in the repository, and a deployment that forgets to
 * set it fails loudly at login rather than quietly shipping a well-known
 * default that anyone reading this file could use.
 */
@Component
public class AdminSeeder implements CommandLineRunner {

    private static final Logger log =
            LoggerFactory.getLogger(AdminSeeder.class);

    private final AdminRepository adminRepository;

    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.seed.email}")
    private String email;

    @Value("${app.admin.seed.password}")
    private String password;

    @Value("${app.admin.seed.name}")
    private String name;

    @Value("${app.admin.seed.phone}")
    private String phone;

    public AdminSeeder(AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder) {

        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {

        if (password == null || password.isBlank()) {

            log.info("Admin seeding skipped: app.admin.seed.password is not set.");
            return;
        }

        // Idempotent: this runs on every start, including every redeploy,
        // and must not overwrite the live account or its password.
        if (adminRepository.findByEmail(email).isPresent()) {

            log.info("Admin seeding skipped: {} already exists.", email);
            return;
        }

        AdminModel admin = new AdminModel();

        admin.setEmail(email);
        admin.setPassword(passwordEncoder.encode(password));

        // AdminService compares this against the literal "ADMIN", and the
        // JWT filter prefixes it with ROLE_ for Spring Security.
        admin.setRole("ADMIN");

        admin.setName(name);
        admin.setPhone(phone);

        adminRepository.save(admin);

        log.info("Seeded admin account {}. Change the password after first login.", email);
    }
}
