package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;
import com.luxecraft.luxecraft.Exception.BusinessRuleException;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.luxecraft.luxecraft.Model.PasswordResetOtpModel;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.PasswordResetOtpRepository;

@Service
public class PasswordResetService {

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private PasswordResetOtpRepository otpRepository;

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private PasswordEncoder passwordEncoder;

    // =====================================================
    // SEND OTP
    // =====================================================

    public void sendOtp(String email) {

        // Check customer email
        customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Email not registered"));

        // Remove old OTP
        otpRepository.deleteByEmail(email);

        // Generate 6 digit OTP
        String otp = String.format(
                "%06d",
                new Random().nextInt(1000000));

        // Create OTP model
        PasswordResetOtpModel otpModel = new PasswordResetOtpModel();

        otpModel.setEmail(email);

        otpModel.setOtp(otp);

        otpModel.setExpiryTime(
                LocalDateTime.now().plusMinutes(5));

        otpModel.setVerified(false);

        // Save OTP
        otpRepository.save(otpModel);

        // Send email
        SimpleMailMessage message = new SimpleMailMessage();

        message.setTo(email);

        message.setSubject(
                "LuxeCraft - Password Reset OTP");

        message.setText(
                "Hello,\n\n"
                        + "Your LuxeCraft password reset OTP is:\n\n"
                        + otp
                        + "\n\n"
                        + "This OTP is valid for 5 minutes.\n\n"
                        + "If you did not request a password reset, "
                        + "please ignore this email.\n\n"
                        + "Regards,\n"
                        + "LuxeCraft Team");

        mailSender.send(message);
    }

    // =====================================================
    // VERIFY OTP
    // =====================================================

    public void verifyOtp(
            String email,
            String otp) {

        PasswordResetOtpModel otpModel = otpRepository
                .findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OTP not found"));

        // Check expiry
        if (LocalDateTime.now()
                .isAfter(otpModel.getExpiryTime())) {

            throw new BusinessRuleException(
                    "OTP has expired");
        }

        // Check OTP
        if (!otpModel.getOtp().equals(otp)) {

            throw new BusinessRuleException(
                    "Invalid OTP");
        }

        // Mark verified
        otpModel.setVerified(true);

        otpRepository.save(otpModel);
    }

    // =====================================================
    // RESET PASSWORD
    // =====================================================

    @Transactional
    public void resetPassword(
            String email,
            String newPassword) {

        // Find latest OTP
        PasswordResetOtpModel otpModel = otpRepository
                .findTopByEmailOrderByIdDesc(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "OTP not found"));

        // Check OTP expiry
        if (LocalDateTime.now()
                .isAfter(otpModel.getExpiryTime())) {

            throw new BusinessRuleException(
                    "OTP has expired");
        }

        // Check OTP verification
        if (!otpModel.isVerified()) {

            throw new BusinessRuleException(
                    "Please verify OTP first");
        }

        // Find customer
        var customer = customerRepository
                .findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Customer not found"));

        // =================================================
        // ENCODE NEW PASSWORD
        // =================================================

        String encodedPassword = passwordEncoder.encode(newPassword);

        customer.setPassword(encodedPassword);

        // Save customer
        customerRepository.save(customer);

        // Delete used OTP
        otpRepository.deleteByEmail(email);
    }
}