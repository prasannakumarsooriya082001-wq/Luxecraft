package com.luxecraft.luxecraft.Controller;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import com.luxecraft.luxecraft.Dto.CartDTO;
import com.luxecraft.luxecraft.Model.CartModel;
import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Service.CartService;

@RestController
@RequestMapping("/cart")
public class CartController {

    @Autowired
    private CartService cartService;

    @Autowired
    private CustomerRepository customerRepository;

    // ================= ADD TO CART =================

    @PostMapping("/add")
    public CartModel addToCart(
            @RequestParam Long productId,
            @RequestParam int quantity,
            Authentication authentication) {

        String email = authentication.getName();

        CustomerModel customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return cartService.addToCart(
                customer.getCustomerId(),
                productId,
                quantity);
    }

    // ================= GET CART =================

    @GetMapping
    public List<CartDTO> getCart(Authentication authentication) {

        String email = authentication.getName();

        CustomerModel customer = customerRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return cartService.getCart(
                customer.getCustomerId());
    }

    // ================= REMOVE CART ITEM =================

    @DeleteMapping("/remove/{cartId}")
    public String removeFromCart(
            @PathVariable Long cartId,
            Authentication authentication) {

        String email = authentication.getName();

        CustomerModel customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        cartService.removeFromCart(
                customer.getCustomerId(),
                cartId);

        return "Cart item removed successfully";
    }

    // ================= UPDATE QUANTITY =================

    @PutMapping("/update/{cartId}")
    public CartModel updateQuantity(
            @PathVariable Long cartId,
            @RequestParam int quantity,
            Authentication authentication) {

        String email = authentication.getName();

        CustomerModel customer = customerRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        return cartService.updateQuantity(
                customer.getCustomerId(),
                cartId,
                quantity);
    }
}