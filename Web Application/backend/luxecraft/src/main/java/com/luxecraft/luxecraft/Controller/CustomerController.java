package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Dto.CustomerAdminDTO;
import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Model.LoginRequest;
import com.luxecraft.luxecraft.Model.LoginResponse;
import com.luxecraft.luxecraft.Service.CustomerService;
import com.luxecraft.luxecraft.Service.JwtService;

@RestController
@RequestMapping("/customer")
@CrossOrigin("*")
public class CustomerController {
    @Autowired
    private CustomerService cs;

    @Autowired
    private JwtService jwtService;

    @PostMapping("/register")
    public CustomerModel registerCustomer(@RequestBody CustomerModel customer) {

        return cs.registerCustomer(customer);
    }

    @PostMapping("/login")
    public LoginResponse loginCustomer(@RequestBody LoginRequest loginRequest) {

        return cs.loginCustomer(loginRequest.getEmail(), loginRequest.getPassword());
    }

    @GetMapping("/profile")
    public String profile(@RequestHeader("Authorization") String authHeader) {

        String token = authHeader.substring(7);

        String email = jwtService.getEmailFromToken(token);

        String role = jwtService.getRoleFromToken(token);

        return "Email: " + email + ", Role: " + role;
    }

    // ================= ADMIN - GET CUSTOMER BY ID =================

    @GetMapping("/admin/{customerId}")
    public CustomerModel getCustomerById(
            @PathVariable Long customerId) {

        return cs.getCustomerById(customerId);

    }

    @GetMapping("/admin/all")
    public List<CustomerAdminDTO> getAllCustomersForAdmin() {

        return cs.getAllCustomersForAdmin();

    }

    @DeleteMapping("/admin/{customerId}")
    public String deleteCustomer(@PathVariable Long customerId) {

        cs.deleteCustomer(customerId);

        return "Customer deleted successfully";
    }

    @PutMapping("/admin/{customerId}")
    public CustomerModel updateCustomer(
            @PathVariable Long customerId,
            @RequestBody CustomerModel customer) {

        return cs.updateCustomer(customerId, customer);
    }
}
