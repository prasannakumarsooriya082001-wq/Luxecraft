package com.luxecraft.luxecraft.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.luxecraft.luxecraft.Service.PasswordResetService;

@RestController
@RequestMapping("/customer")
public class PasswordResetController {

    @Autowired
    private PasswordResetService passwordResetService;

    // =====================================================
    // FORGOT PASSWORD - SEND OTP
    // =====================================================

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @RequestParam String email) {

        try {

            passwordResetService.sendOtp(email);

            return ResponseEntity.ok(
                    "OTP sent successfully");

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================

    @PostMapping("/verify-otp")
    public ResponseEntity<String> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {

        try {

            passwordResetService.verifyOtp(
                    email,
                    otp);

            return ResponseEntity.ok(
                    "OTP verified successfully");

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @RequestParam String email,
            @RequestParam String newPassword) {

        try {

            passwordResetService.resetPassword(
                    email,
                    newPassword);

            return ResponseEntity.ok(
                    "Password reset successfully");

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}