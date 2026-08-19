package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Dto.CouponResultDTO;
import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;
import com.luxecraft.luxecraft.Model.CartModel;
import com.luxecraft.luxecraft.Model.CouponModel;
import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Repository.CartRepository;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;
import com.luxecraft.luxecraft.Service.CouponService;

@RestController
@RequestMapping("/coupon")
@CrossOrigin("*")
public class CouponController {

    @Autowired
    private CouponService couponService;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository productRepository;

    // =====================================================
    // CUSTOMER
    // =====================================================

    /**
     * Checks a coupon against the caller's actual cart.
     *
     * The subtotal is read from the database rather than accepted as a
     * request parameter, so nobody can inflate their cart value to clear a
     * coupon's minimum-order rule.
     */
    @PostMapping("/apply")
    public CouponResultDTO applyCoupon(
            @RequestParam("code") String code,
            Authentication authentication) {

        CustomerModel customer = customerRepository
                .findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        double subtotal = calculateCartSubtotal(customer.getCustomerId());

        return couponService.applyCoupon(code, subtotal);
    }

    private double calculateCartSubtotal(Long customerId) {

        List<CartModel> cartItems = cartRepository.findByCustomerId(customerId);

        double subtotal = 0;

        for (CartModel cart : cartItems) {

            ProductModel product = productRepository
                    .findById(cart.getProductId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Product not found"));

            subtotal += product.getPrice() * cart.getQuantity();
        }

        return subtotal;
    }

    // =====================================================
    // ADMIN (see SecurityConfig /coupon/admin/**)
    // =====================================================

    @GetMapping("/admin/all")
    public List<CouponModel> getAllCoupons() {

        return couponService.getAllCoupons();
    }

    @PostMapping("/admin/add")
    public CouponModel createCoupon(@RequestBody CouponModel coupon) {

        return couponService.createCoupon(coupon);
    }

    @PutMapping("/admin/{couponId}")
    public CouponModel updateCoupon(
            @PathVariable Long couponId,
            @RequestBody CouponModel coupon) {

        return couponService.updateCoupon(couponId, coupon);
    }

    @DeleteMapping("/admin/{couponId}")
    public ResponseEntity<Void> deleteCoupon(@PathVariable Long couponId) {

        couponService.deleteCoupon(couponId);

        return ResponseEntity.noContent().build();
    }
}
