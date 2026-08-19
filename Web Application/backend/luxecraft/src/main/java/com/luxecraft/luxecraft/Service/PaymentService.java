package com.luxecraft.luxecraft.Service;

import java.nio.charset.StandardCharsets;
import java.util.HexFormat;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.razorpay.Order;
import com.razorpay.RazorpayClient;

import org.springframework.beans.factory.annotation.Value;

@Service
public class PaymentService {

    @Autowired
    private RazorpayClient razorpayClient;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    // =====================================================
    // CREATE RAZORPAY ORDER
    // =====================================================

    public String createOrder(double amount) throws Exception {

        // Razorpay amount must be in paise
        int amountInPaise = (int) Math.round(amount * 100);

        JSONObject orderRequest = new JSONObject();

        orderRequest.put("amount", amountInPaise);
        orderRequest.put("currency", "INR");
        orderRequest.put("receipt", "LUXECRAFT_" + System.currentTimeMillis());

        Order order = razorpayClient.orders.create(orderRequest);

        return order.toString();
    }

    public boolean verifyPayment(
            String orderId,
            String paymentId,
            String razorpaySignature) {

        try {

            String payload = orderId + "|" + paymentId;

            Mac mac = Mac.getInstance("HmacSHA256");

            SecretKeySpec secretKey = new SecretKeySpec(
                    razorpayKeySecret.getBytes(StandardCharsets.UTF_8),
                    "HmacSHA256");

            mac.init(secretKey);

            byte[] hash = mac.doFinal(
                    payload.getBytes(StandardCharsets.UTF_8));

            String generatedSignature = HexFormat.of().formatHex(hash);

            return generatedSignature.equals(
                    razorpaySignature);

        } catch (Exception e) {

            e.printStackTrace();

            return false;
        }
    }
}