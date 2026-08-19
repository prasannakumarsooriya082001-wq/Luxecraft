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

@Entity
@Table(name = "coupon")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CouponModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long couponId;

    /** Always stored uppercase so "luxe10" and "LUXE10" are the same coupon. */
    @Column(nullable = false, unique = true)
    private String code;

    /** PERCENT or FLAT. */
    @Column(nullable = false)
    private String discountType;

    /** 10 means "10 percent off" or "flat Rs.10 off" depending on the type. */
    @Column(nullable = false)
    private Double discountValue;

    /** Order must reach this subtotal before the coupon applies. */
    private Double minOrderAmount;

    /** Ceiling for percentage coupons, e.g. "10% off, up to Rs.2000". */
    private Double maxDiscount;

    private LocalDateTime validFrom;

    private LocalDateTime validTo;

    /** Null means unlimited. */
    private Integer usageLimit;

    @Column(nullable = false)
    private Integer usedCount = 0;

    @Column(nullable = false)
    private Boolean active = true;
}
