package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.BusinessRuleException;
import org.springframework.security.access.AccessDeniedException;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Optional;
import com.luxecraft.luxecraft.Dto.AdminOrderDTO;
import com.luxecraft.luxecraft.Dto.OrderItemDTO;
import com.luxecraft.luxecraft.Dto.OrderRequestDTO;
import com.luxecraft.luxecraft.Dto.RecentOrderDTO;
import com.luxecraft.luxecraft.Model.CartModel;
import com.luxecraft.luxecraft.Model.CouponModel;
import com.luxecraft.luxecraft.Model.OrderItemModel;
import com.luxecraft.luxecraft.Model.OrderModel;
import com.luxecraft.luxecraft.Model.OrderStatusHistoryModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Repository.CartRepository;
import com.luxecraft.luxecraft.Repository.OrderItemRepository;
import com.luxecraft.luxecraft.Repository.OrderRepository;
import com.luxecraft.luxecraft.Repository.OrderStatusHistoryRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;

import jakarta.transaction.Transactional;

@Service
public class OrderService {
        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private OrderItemRepository orderItemRepository;

        @Autowired
        private CartRepository cartRepository;

        @Autowired
        private ProductRepository productRepository;

        @Autowired
        private OrderEmailService orderEmailService;

        @Autowired
        private CouponService couponService;

        @Autowired
        private OrderStatusHistoryRepository orderStatusHistoryRepository;

        /** Statuses the admin screen offers. Anything else is rejected. */
        private static final List<String> ALLOWED_STATUSES = List.of(
                        "PENDING", "IN PROGRESS", "DELIVERED", "CANCELLED");

        /**
         * Writes one row into the order's timeline. Called on every status
         * change so the trail can never silently miss a step.
         */
        private void recordStatus(
                        Long orderId,
                        String status,
                        String changedBy,
                        String note) {

                OrderStatusHistoryModel entry = new OrderStatusHistoryModel();

                entry.setOrderId(orderId);
                entry.setStatus(status);
                entry.setChangedBy(changedBy == null ? "SYSTEM" : changedBy);
                entry.setNote(note);
                entry.setChangedAt(LocalDateTime.now());

                orderStatusHistoryRepository.save(entry);
        }

        public List<OrderStatusHistoryModel> getOrderTimeline(Long orderId) {

                return orderStatusHistoryRepository
                                .findByOrderIdOrderByChangedAtAscHistoryIdAsc(orderId);
        }

        /** Customer-facing: only ever returns the caller's own timeline. */
        public List<OrderStatusHistoryModel> getOrderTimeline(
                        Long customerId,
                        Long orderId) {

                OrderModel order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "Order not found"));

                if (!order.getCustomerId().equals(customerId)) {

                        throw new AccessDeniedException(
                                        "This order does not belong to you.");
                }

                return getOrderTimeline(orderId);
        }

        // ================= PLACE ORDER =================

        @Transactional
        public OrderModel placeOrder(Long customerId, OrderRequestDTO request) {

                // 1. Get customer's cart

                List<CartModel> cartItems = cartRepository.findByCustomerId(customerId);

                if (cartItems.isEmpty()) {

                        throw new BusinessRuleException(
                                        "Cart is empty");

                }

                // 2. Calculate subtotal

                double subtotal = 0;

                for (CartModel cart : cartItems) {

                        ProductModel product = productRepository
                                        .findById(cart.getProductId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found"));

                        // Reject the whole order before anything is written if a
                        // line asks for more than is actually on the shelf.
                        int available = product.getStockQuantity() == null
                                        ? 0
                                        : product.getStockQuantity();

                        if (available < cart.getQuantity()) {

                                throw new BusinessRuleException(
                                                "Only " + available + " left of "
                                                                + product.getProductName()
                                                                + ". Please reduce the quantity.");
                        }

                        subtotal += product.getPrice()
                                        * cart.getQuantity();

                }

                // 3. Apply coupon, if one was entered
                //
                // The discount is recalculated here from the server's own
                // subtotal. Whatever figure the checkout page displayed is
                // never trusted - only the code itself comes from the client.

                double discount = 0;

                CouponModel coupon = null;

                if (request.getCouponCode() != null
                                && !request.getCouponCode().isBlank()) {

                        coupon = couponService.findUsableCoupon(
                                        request.getCouponCode());

                        if (coupon.getMinOrderAmount() != null
                                        && subtotal < coupon.getMinOrderAmount()) {

                                throw new BusinessRuleException(
                                                "This coupon needs a minimum order of Rs."
                                                                + coupon.getMinOrderAmount() + ".");
                        }

                        discount = couponService.calculateDiscount(coupon, subtotal);
                }

                double discountedSubtotal = subtotal - discount;

                // 4. Calculate tax on what is actually being paid

                double tax = discountedSubtotal * 0.05;

                // 5. Calculate total

                double totalAmount = discountedSubtotal + tax;

                // 5. Create Order

                OrderModel order = new OrderModel();

                order.setCustomerId(customerId);

                order.setFirstName(request.getFirstName());
                order.setLastName(request.getLastName());
                order.setEmail(request.getEmail());
                order.setPhone(request.getPhone());

                order.setStreetAddress(request.getStreetAddress());
                order.setCity(request.getCity());
                order.setState(request.getState());
                order.setZipCode(request.getZipCode());
                order.setCountry(request.getCountry());

                order.setPaymentMethod(request.getPaymentMethod());

                order.setSubtotal(subtotal);
                order.setTax(tax);
                order.setTotalAmount(totalAmount);

                order.setDiscountAmount(discount);

                if (coupon != null) {
                        order.setCouponCode(coupon.getCode());
                }

                order.setStatus("PENDING");

                
                LocalDateTime orderDate = LocalDateTime.now();

                order.setOrderDate(orderDate);

                order.setDeliveryDate(
                        orderDate.plusDays(3));

                // Save Order

                OrderModel savedOrder = orderRepository.save(order);

                // 6. Create Order Items

                for (CartModel cart : cartItems) {

                        ProductModel product = productRepository
                                        .findById(cart.getProductId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found"));

                        OrderItemModel item = new OrderItemModel();

                        item.setOrderId(
                                        savedOrder.getOrderId());

                        item.setProductId(
                                        product.getProductId());

                        item.setQuantity(
                                        cart.getQuantity());

                        item.setPrice(
                                        product.getPrice());

                        orderItemRepository.save(item);

                        // Take the sold units out of stock atomically. The earlier
                        // check was only for a friendly early error - between then
                        // and now another checkout may have taken the last one, so
                        // this is the check that actually decides.
                        int taken = productRepository.decrementStock(
                                        product.getProductId(),
                                        cart.getQuantity());

                        if (taken == 0) {

                                // Throwing rolls back the whole transaction, so the
                                // order and every item written above disappear too.
                                throw new BusinessRuleException(
                                                product.getProductName()
                                                                + " just went out of stock. Please review your cart.");
                        }

                }

                // 7. Clear Cart

                cartRepository.deleteAll(cartItems);

                // Count the coupon only once the order really exists

                if (coupon != null) {
                        couponService.markUsed(coupon);
                }

                // First entry in the timeline

                recordStatus(
                                savedOrder.getOrderId(),
                                "PENDING",
                                "SYSTEM",
                                "Order placed");

                // 8. Send confirmation email (failures are logged, never fatal)

                orderEmailService.sendOrderConfirmation(
                                savedOrder,
                                orderItemRepository.findByOrderId(
                                                savedOrder.getOrderId()));

                // 9. Return Order

                return savedOrder;
        }

        public List<OrderModel> getCustomerOrders(Long customerId) {

                return orderRepository.findByCustomerId(customerId);

        }

        // ================= GET ORDER DETAILS =================

        public OrderModel getOrderDetails(
                        Long customerId,
                        Long orderId) {

                OrderModel order = orderRepository
                                .findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                if (!order.getCustomerId().equals(customerId)) {

                        throw new AccessDeniedException(
                                        "Unauthorized order access");
                }

                return order;
        }

        // ================= CANCEL ORDER =================

        /**
         * Cancels an order the customer owns, provided it has not shipped yet,
         * and returns the reserved units to stock.
         */
        @Transactional
        public OrderModel cancelOrder(Long customerId, Long orderId) {

                // Reuses the ownership check - throws 403 for someone else's order
                OrderModel order = getOrderDetails(customerId, orderId);

                String status = order.getStatus() == null
                                ? ""
                                : order.getStatus().trim().toUpperCase();

                if ("CANCELLED".equals(status)) {

                        throw new BusinessRuleException(
                                        "This order is already cancelled.");
                }

                if ("DELIVERED".equals(status)) {

                        throw new BusinessRuleException(
                                        "A delivered order cannot be cancelled.");
                }

                // Put the units back on the shelf, atomically for the same
                // reason the checkout path is - a cancel and a checkout can
                // touch the same product at the same moment.
                for (OrderItemModel item : orderItemRepository.findByOrderId(orderId)) {

                        productRepository.restoreStock(
                                        item.getProductId(),
                                        item.getQuantity());
                }

                order.setStatus("CANCELLED");

                OrderModel cancelled = orderRepository.save(order);

                recordStatus(
                                orderId,
                                "CANCELLED",
                                order.getEmail(),
                                "Cancelled by customer");

                return cancelled;
        }

        public List<OrderItemDTO> getOrderItems(Long customerId, Long orderId) {

                // Check order belongs to customer
                getOrderDetails(customerId, orderId);

                List<OrderItemModel> items = orderItemRepository.findByOrderId(orderId);

                return items.stream().map(item -> {

                        ProductModel product = productRepository.findById(item.getProductId())
                                        .orElseThrow(() -> new ResourceNotFoundException("Product not found"));

                        OrderItemDTO dto = new OrderItemDTO();

                        dto.setOrderItemId(item.getOrderItemId());
                        dto.setProductId(item.getProductId());
                        dto.setProductName(product.getProductName());
                        dto.setImageUrl(product.getImageUrl());
                        dto.setQuantity(item.getQuantity());
                        dto.setPrice(item.getPrice());
                        dto.setTotal(
                                        item.getPrice() * item.getQuantity());

                        return dto;

                }).toList();
        }

        // ================= ADMIN - GET ALL ORDERS =================

        public List<AdminOrderDTO> getAllOrders() {

                List<OrderModel> orders = orderRepository.findAll();

                return orders.stream().map(order -> {

                        // ================= CUSTOMER NAME =================

                        String customerName = (order.getFirstName() +
                                        " " +
                                        order.getLastName()).trim();

                        // ================= PRODUCT NAME =================

                        String productName = "Unknown Product";

                        Optional<OrderItemModel> orderItem = orderItemRepository
                                        .findFirstByOrderIdOrderByOrderItemIdAsc(
                                                        order.getOrderId());

                        if (orderItem.isPresent()) {

                                ProductModel product = productRepository
                                                .findById(
                                                                orderItem.get().getProductId())
                                                .orElse(null);

                                if (product != null) {

                                        productName = product.getProductName();

                                }

                        }

                        // ================= DATE =================

                        String orderDate = order.getOrderDate() != null
                                        ? order.getOrderDate().toString()
                                        : null;

                        // ================= DTO =================

                        return new AdminOrderDTO(

                                        order.getOrderId(),

                                        customerName,

                                        productName,

                                        orderDate,

                                        order.getTotalAmount(),

                                        order.getStatus()

                        );

                }).toList();

        }

        // ================= ADMIN - RECENT ORDERS =================

        public List<RecentOrderDTO> getRecentOrders() {

                List<OrderModel> orders = orderRepository.findTop3ByOrderByOrderIdDesc();

                return orders.stream().map(order -> {

                        String customerName = order.getFirstName() + " "
                                        + order.getLastName();

                        String productName = "Unknown Product";

                        var orderItem = orderItemRepository
                                        .findFirstByOrderIdOrderByOrderItemIdAsc(
                                                        order.getOrderId());

                        if (orderItem.isPresent()) {

                                ProductModel product = productRepository
                                                .findById(
                                                                orderItem.get().getProductId())
                                                .orElse(null);

                                if (product != null) {

                                        productName = product.getProductName();

                                }
                        }

                        return new RecentOrderDTO(

                                        order.getOrderId(),

                                        customerName,

                                        productName,

                                        order.getStatus(),

                                        order.getTotalAmount());

                }).toList();
        }

        // ================= ADMIN - GET ORDER DETAILS =================

        public OrderModel getOrderByIdForAdmin(Long orderId) {

                return orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        }

        // ================= ADMIN - UPDATE ORDER STATUS =================

        public OrderModel updateOrderStatus(
                        Long orderId,
                        String status,
                        String changedBy) {

                OrderModel order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

                if (status == null || status.isBlank()) {

                        throw new BusinessRuleException("Status is required.");
                }

                String newStatus = status.trim().toUpperCase();

                // Previously any string at all could be written here, so a typo
                // would quietly put an order into a status nothing recognises.
                if (!ALLOWED_STATUSES.contains(newStatus)) {

                        throw new BusinessRuleException(
                                        "Unknown status '" + status + "'. Allowed: "
                                                        + String.join(", ", ALLOWED_STATUSES));
                }

                String previous = order.getStatus();

                // Nothing changed - do not add a misleading timeline entry
                if (newStatus.equals(previous)) {

                        return order;
                }

                order.setStatus(newStatus);

                OrderModel saved = orderRepository.save(order);

                recordStatus(
                                orderId,
                                newStatus,
                                changedBy,
                                "Changed from " + previous);

                return saved;
        }
}
