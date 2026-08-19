package com.luxecraft.luxecraft.Service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Dto.CouponResultDTO;
import com.luxecraft.luxecraft.Exception.BusinessRuleException;
import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;
import com.luxecraft.luxecraft.Model.CouponModel;
import com.luxecraft.luxecraft.Repository.CouponRepository;

@Service
public class CouponService {

    public static final String PERCENT = "PERCENT";
    public static final String FLAT = "FLAT";

    @Autowired
    private CouponRepository couponRepository;

    // =====================================================
    // APPLYING A COUPON
    // =====================================================

    /**
     * Checks a code against an order subtotal and works out the discount.
     *
     * The subtotal is always passed in by the server from the real cart -
     * never taken from the browser - so a customer cannot claim a large
     * order to unlock a coupon they do not qualify for.
     */
    public CouponResultDTO applyCoupon(String code, double subtotal) {

        CouponModel coupon = findUsableCoupon(code);

        if (coupon.getMinOrderAmount() != null
                && subtotal < coupon.getMinOrderAmount()) {

            throw new BusinessRuleException(
                    "This coupon needs a minimum order of Rs."
                            + coupon.getMinOrderAmount() + ".");
        }

        double discount = calculateDiscount(coupon, subtotal);

        return new CouponResultDTO(
                coupon.getCode(),
                coupon.getDiscountType(),
                coupon.getDiscountValue(),
                round(discount),
                round(subtotal),
                round(subtotal - discount),
                "Coupon " + coupon.getCode() + " applied.");
    }

    /** Shared by applyCoupon and order placement so both agree on the maths. */
    public double calculateDiscount(CouponModel coupon, double subtotal) {

        double discount;

        if (PERCENT.equalsIgnoreCase(coupon.getDiscountType())) {

            discount = subtotal * (coupon.getDiscountValue() / 100.0);

            if (coupon.getMaxDiscount() != null
                    && discount > coupon.getMaxDiscount()) {

                discount = coupon.getMaxDiscount();
            }

        } else {

            discount = coupon.getDiscountValue();
        }

        // A coupon may never make an order negative
        if (discount > subtotal) {
            discount = subtotal;
        }

        return round(discount);
    }

    /** Looks up a coupon and checks everything except the order minimum. */
    public CouponModel findUsableCoupon(String code) {

        if (code == null || code.isBlank()) {

            throw new BusinessRuleException("Enter a coupon code.");
        }

        CouponModel coupon = couponRepository
                .findByCodeIgnoreCase(code.trim())
                .orElseThrow(() -> new BusinessRuleException(
                        "That coupon code is not valid."));

        if (Boolean.FALSE.equals(coupon.getActive())) {

            throw new BusinessRuleException("This coupon is no longer active.");
        }

        LocalDateTime now = LocalDateTime.now();

        if (coupon.getValidFrom() != null && now.isBefore(coupon.getValidFrom())) {

            throw new BusinessRuleException("This coupon is not active yet.");
        }

        if (coupon.getValidTo() != null && now.isAfter(coupon.getValidTo())) {

            throw new BusinessRuleException("This coupon has expired.");
        }

        if (coupon.getUsageLimit() != null
                && coupon.getUsedCount() != null
                && coupon.getUsedCount() >= coupon.getUsageLimit()) {

            throw new BusinessRuleException(
                    "This coupon has reached its usage limit.");
        }

        return coupon;
    }

    /** Called once the order is actually placed. */
    public void markUsed(CouponModel coupon) {

        int used = coupon.getUsedCount() == null ? 0 : coupon.getUsedCount();

        coupon.setUsedCount(used + 1);

        couponRepository.save(coupon);
    }

    // =====================================================
    // ADMIN
    // =====================================================

    public List<CouponModel> getAllCoupons() {

        return couponRepository.findAllByOrderByCouponIdDesc();
    }

    public CouponModel createCoupon(CouponModel coupon) {

        validateForSave(coupon);

        String code = coupon.getCode().trim().toUpperCase();

        if (couponRepository.existsByCodeIgnoreCase(code)) {

            throw new BusinessRuleException(
                    "A coupon with code " + code + " already exists.");
        }

        coupon.setCode(code);
        coupon.setUsedCount(0);

        if (coupon.getActive() == null) {
            coupon.setActive(true);
        }

        return couponRepository.save(coupon);
    }

    public CouponModel updateCoupon(Long couponId, CouponModel changes) {

        validateForSave(changes);

        CouponModel existing = couponRepository.findById(couponId)
                .orElseThrow(() -> new ResourceNotFoundException("Coupon", couponId));

        String code = changes.getCode().trim().toUpperCase();

        couponRepository.findByCodeIgnoreCase(code).ifPresent(other -> {

            if (!other.getCouponId().equals(couponId)) {

                throw new BusinessRuleException(
                        "Another coupon already uses the code " + code + ".");
            }
        });

        existing.setCode(code);
        existing.setDiscountType(changes.getDiscountType().toUpperCase());
        existing.setDiscountValue(changes.getDiscountValue());
        existing.setMinOrderAmount(changes.getMinOrderAmount());
        existing.setMaxDiscount(changes.getMaxDiscount());
        existing.setValidFrom(changes.getValidFrom());
        existing.setValidTo(changes.getValidTo());
        existing.setUsageLimit(changes.getUsageLimit());

        if (changes.getActive() != null) {
            existing.setActive(changes.getActive());
        }

        return couponRepository.save(existing);
    }

    public void deleteCoupon(Long couponId) {

        if (!couponRepository.existsById(couponId)) {

            throw new ResourceNotFoundException("Coupon", couponId);
        }

        couponRepository.deleteById(couponId);
    }

    private void validateForSave(CouponModel coupon) {

        if (coupon.getCode() == null || coupon.getCode().isBlank()) {

            throw new BusinessRuleException("Coupon code is required.");
        }

        String type = coupon.getDiscountType();

        if (type == null
                || !(PERCENT.equalsIgnoreCase(type) || FLAT.equalsIgnoreCase(type))) {

            throw new BusinessRuleException(
                    "Discount type must be PERCENT or FLAT.");
        }

        if (coupon.getDiscountValue() == null || coupon.getDiscountValue() <= 0) {

            throw new BusinessRuleException("Discount value must be more than zero.");
        }

        if (PERCENT.equalsIgnoreCase(type) && coupon.getDiscountValue() > 100) {

            throw new BusinessRuleException("A percentage discount cannot exceed 100.");
        }

        if (coupon.getValidFrom() != null
                && coupon.getValidTo() != null
                && coupon.getValidTo().isBefore(coupon.getValidFrom())) {

            throw new BusinessRuleException("End date cannot be before the start date.");
        }

        coupon.setDiscountType(type.toUpperCase());
    }

    private double round(double value) {

        return Math.round(value * 100.0) / 100.0;
    }
}
