package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;import com.luxecraft.luxecraft.Exception.InvalidCredentialsException;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.luxecraft.luxecraft.Dto.CustomerAdminDTO;
import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Model.LoginResponse;

import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.OrderRepository;

@Service
public class CustomerService {

    @Autowired
    private CustomerRepository cr;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Autowired
    private OrderRepository orderRepository;

    public CustomerModel registerCustomer(CustomerModel customer) {

        customer.setRole("CUSTOMER");

        customer.setPassword(passwordEncoder.encode(customer.getPassword()));

        return cr.save(customer);
    }

    public LoginResponse loginCustomer(String email, String password) {

        CustomerModel customer = cr.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Email not found"));

        if (!passwordEncoder.matches(password, customer.getPassword())) {

            throw new InvalidCredentialsException("Invalid password");
        }

        String token = jwtService.generateToken(customer.getEmail(), customer.getRole());

        return new LoginResponse(token, customer.getFirstName(), customer.getLastName(), customer.getPhone(),
                customer.getEmail(), customer.getRole());
    }

    // ================= ADMIN - GET ALL CUSTOMERS =================

    public List<CustomerModel> getAllCustomers() {

        return cr.findAll();

    }

    // ================= ADMIN - GET CUSTOMER BY ID =================

    public CustomerModel getCustomerById(Long customerId) {

        return cr.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

    }

    public List<CustomerAdminDTO> getAllCustomersForAdmin() {

        return cr.findAll()
                .stream()
                .map(customer -> {

                    long orderCount = orderRepository.countByCustomerId(
                            customer.getCustomerId());

                    return new CustomerAdminDTO(
                            customer.getCustomerId(),
                            customer.getFirstName(),
                            customer.getLastName(),
                            customer.getEmail(),
                            customer.getPhone(),
                            customer.getRole(),
                            orderCount);

                })
                .collect(Collectors.toList());
    }

    public void deleteCustomer(Long customerId) {

        CustomerModel customer = cr.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        cr.delete(customer);
    }

    public CustomerModel updateCustomer(
            Long customerId,
            CustomerModel updatedCustomer) {

        CustomerModel existingCustomer = cr.findById(customerId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        existingCustomer.setFirstName(
                updatedCustomer.getFirstName());

        existingCustomer.setLastName(
                updatedCustomer.getLastName());

        existingCustomer.setEmail(
                updatedCustomer.getEmail());

        existingCustomer.setPhone(
                updatedCustomer.getPhone());

        return cr.save(existingCustomer);
    }

}
