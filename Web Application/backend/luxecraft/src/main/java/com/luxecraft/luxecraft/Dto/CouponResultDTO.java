package com.luxecraft.luxecraft.Dto;

/** What the checkout page needs after applying a coupon. */
public record CouponResultDTO(
        String code,
        String discountType,
        Double discountValue,
        Double discountAmount,
        Double subtotal,
        Double payable,
        String message) {
}
