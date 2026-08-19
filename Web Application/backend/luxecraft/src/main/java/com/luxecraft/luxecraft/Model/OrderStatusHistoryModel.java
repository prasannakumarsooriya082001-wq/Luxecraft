package com.luxecraft.luxecraft.Model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * One row per status change on an order.
 *
 * The order table only ever holds the current status, so once an order moved
 * on there was no way to answer "when was this shipped?" or "who cancelled
 * it?". This keeps the full trail.
 */
@Entity
@Table(name = "order_status_history")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusHistoryModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long historyId;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private String status;

    /** Email of whoever made the change, or SYSTEM when the app did it. */
    @Column(nullable = false)
    private String changedBy;

    private String note;

    @Column(nullable = false)
    private LocalDateTime changedAt;
}
