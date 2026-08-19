package com.luxecraft.luxecraft.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Model.AdminModel;
import com.luxecraft.luxecraft.Model.ChangePasswordRequest;
import com.luxecraft.luxecraft.Model.LoginRequest;
import com.luxecraft.luxecraft.Model.LoginResponse;
import com.luxecraft.luxecraft.Service.AdminService;

@RestController
@RequestMapping("/admin")
@CrossOrigin("*")
public class AdminController {

    @Autowired
    private AdminService adminService;

    // ================= ADMIN LOGIN =================

    @PostMapping("/login")
    public LoginResponse loginAdmin(@RequestBody LoginRequest loginRequest) {

        return adminService.loginAdmin(loginRequest.getEmail(),loginRequest.getPassword());
    }

    @GetMapping("/profile")
    public AdminModel getAdminProfile(@RequestHeader("X-Admin-Email") String email) {

        return adminService.getAdminProfile(email);
    }

    // ================= UPDATE ADMIN PROFILE =================

    @PutMapping("/profile")
    public AdminModel updateAdminProfile(@RequestHeader("X-Admin-Email") String email,@RequestBody AdminModel updatedAdmin) {

        return adminService.updateAdminProfile(email,updatedAdmin);
    }

    // ================= CHANGE PASSWORD =================

    @PutMapping("/change-password")
    public String changePassword(@RequestHeader("X-Admin-Email") String email, @RequestBody ChangePasswordRequest request) {

        adminService.changePassword(email,request.getCurrentPassword(),request.getNewPassword());

        return "Password updated successfully";
    }
}
