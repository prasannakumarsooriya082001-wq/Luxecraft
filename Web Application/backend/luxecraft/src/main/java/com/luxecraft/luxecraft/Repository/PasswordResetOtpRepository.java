package com.luxecraft.luxecraft.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

import com.luxecraft.luxecraft.Model.PasswordResetOtpModel;



public interface PasswordResetOtpRepository extends JpaRepository<PasswordResetOtpModel, Long> {

    Optional<PasswordResetOtpModel> findTopByEmailOrderByIdDesc(
            String email);

    @Modifying
    @Transactional
    void deleteByEmail(String email);
}