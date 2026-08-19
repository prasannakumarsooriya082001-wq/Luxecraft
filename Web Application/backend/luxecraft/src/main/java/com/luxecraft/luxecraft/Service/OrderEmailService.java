package com.luxecraft.luxecraft.Service;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.OrderItemModel;
import com.luxecraft.luxecraft.Model.OrderModel;
import com.luxecraft.luxecraft.Repository.ProductRepository;

@Service
public class OrderEmailService {

    private static final Logger log = LoggerFactory.getLogger(OrderEmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Autowired
    private ProductRepository productRepository;

    /**
     * Sends the order confirmation.
     *
     * Every failure is swallowed on purpose. This runs inside the order
     * transaction, so letting an SMTP error escape would roll back an order
     * the customer has already paid for. A missing email is an annoyance;
     * a lost order is not.
     */
    public void sendOrderConfirmation(
            OrderModel order,
            List<OrderItemModel> items) {

        try {

            StringBuilder body = new StringBuilder();

            body.append("Hi ")
                    .append(order.getFirstName())
                    .append(",\n\n")
                    .append("Thank you for your order.\n\n")
                    .append("Order number : #")
                    .append(order.getOrderId())
                    .append("\n")
                    .append("Order date   : ")
                    .append(order.getOrderDate())
                    .append("\n")
                    .append("Status       : ")
                    .append(order.getStatus())
                    .append("\n\n")
                    .append("Items\n")
                    .append("-----------------------------------------\n");

            for (OrderItemModel item : items) {

                String productName = productRepository
                        .findById(item.getProductId())
                        .map(product -> product.getProductName())
                        .orElse("Product #" + item.getProductId());

                body.append(productName)
                        .append("  x")
                        .append(item.getQuantity())
                        .append("   Rs.")
                        .append(item.getPrice() * item.getQuantity())
                        .append("\n");
            }

            body.append("-----------------------------------------\n")
                    .append("Subtotal : Rs.").append(order.getSubtotal()).append("\n")
                    .append("Tax      : Rs.").append(order.getTax()).append("\n")
                    .append("Total    : Rs.").append(order.getTotalAmount()).append("\n\n")
                    .append("Delivering to\n")
                    .append(order.getStreetAddress()).append("\n")
                    .append(order.getCity()).append(", ")
                    .append(order.getState()).append(" ")
                    .append(order.getZipCode()).append("\n")
                    .append(order.getCountry()).append("\n\n")
                    .append("Expected delivery: ")
                    .append(order.getDeliveryDate())
                    .append("\n\n")
                    .append("- LuxeCraft");

            SimpleMailMessage message = new SimpleMailMessage();

            message.setTo(order.getEmail());
            message.setSubject("LuxeCraft order #" + order.getOrderId() + " confirmed");
            message.setText(body.toString());

            mailSender.send(message);

            log.info("Order confirmation sent for order {}", order.getOrderId());

        } catch (Exception e) {

            log.warn("Could not send order confirmation for order {}: {}",
                    order.getOrderId(), e.getMessage());
        }
    }
}
