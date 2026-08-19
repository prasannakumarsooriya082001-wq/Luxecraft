package com.luxecraft.luxecraft.Controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.luxecraft.luxecraft.Dto.PaymentVerificationRequest;
import com.luxecraft.luxecraft.Service.PaymentService;

@RestController
@RequestMapping("/payment")
@CrossOrigin(origins = {
        "http://127.0.0.1:5500",
        "http://localhost:5500"
})
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    // =====================================================
    // CREATE PAYMENT ORDER
    // =====================================================

    @PostMapping("/create-order")
    public ResponseEntity<?> createOrder(
            @RequestParam double amount) {

        try {

            String order = paymentService.createOrder(amount);

            return ResponseEntity.ok(order);

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Unable to create payment order");
        }
    }

    @PostMapping("/verify")
    public ResponseEntity<?> verifyPayment(
            @RequestBody PaymentVerificationRequest request) {

        try {

            boolean verified = paymentService.verifyPayment(
                    request.getRazorpayOrderId(),
                    request.getRazorpayPaymentId(),
                    request.getRazorpaySignature());

            if (!verified) {

                return ResponseEntity
                        .badRequest()
                        .body("Payment verification failed");
            }

            return ResponseEntity
                    .ok()
                    .body("Payment verified successfully");

        } catch (Exception e) {

            e.printStackTrace();

            return ResponseEntity
                    .badRequest()
                    .body("Payment verification error");
        }
    }
}