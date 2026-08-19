package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;import com.luxecraft.luxecraft.Exception.InvalidCredentialsException;import com.luxecraft.luxecraft.Exception.BusinessRuleException;import org.springframework.security.access.AccessDeniedException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.AdminModel;
import com.luxecraft.luxecraft.Model.LoginResponse;
import com.luxecraft.luxecraft.Repository.AdminRepository;

@Service
public class AdminService {
        @Autowired
        private AdminRepository adminRepository;

        @Autowired
        private PasswordEncoder passwordEncoder;

        @Autowired
        private JwtService jwtService;

        // ================= ADMIN LOGIN =================

        public LoginResponse loginAdmin(String email,String password) {

                AdminModel admin = adminRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Admin email not found"));

                // ================= PASSWORD CHECK =================

                if (!passwordEncoder.matches(password,admin.getPassword())) {
                        throw new InvalidCredentialsException("Invalid admin password");
                }

                // ================= ROLE CHECK =================

                if (!"ADMIN".equals(admin.getRole())) {

                        throw new AccessDeniedException("Unauthorized admin access");
                }

                // ================= GENERATE JWT =================

                String token = jwtService.generateToken(admin.getEmail(),admin.getRole());

                // ================= LOGIN RESPONSE =================

                return new LoginResponse(token,"", "", "", admin.getEmail(), admin.getRole());
        }

        // ================= GET ADMIN PROFILE =================

        public AdminModel getAdminProfile(String email) {

                return adminRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException( "Admin not found"));
        }

        // ================= UPDATE ADMIN PROFILE =================

        public AdminModel updateAdminProfile(String currentEmail,AdminModel updatedAdmin) {

                AdminModel admin = adminRepository.findByEmail(currentEmail).orElseThrow(() -> new ResourceNotFoundException( "Admin not found"));

                admin.setName(updatedAdmin.getName());

                admin.setEmail(updatedAdmin.getEmail());

                admin.setPhone(updatedAdmin.getPhone());

                return adminRepository.save(admin);
        }

        // ================= CHANGE ADMIN PASSWORD =================

        public void changePassword(String email,String currentPassword,String newPassword) {

                AdminModel admin = adminRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Admin not found"));

                // Check current password

                if (!passwordEncoder.matches(currentPassword,admin.getPassword())) {

                        throw new InvalidCredentialsException("Current password is incorrect");
                }

                // Validate new password

                if (newPassword == null ||newPassword.length() < 6) {

                        throw new BusinessRuleException("New password must contain at least 6 characters");
                }

                // Encrypt new password

                admin.setPassword(passwordEncoder.encode(newPassword));

                // Save

                adminRepository.save(admin);
        }
}
