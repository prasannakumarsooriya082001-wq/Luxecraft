package com.luxecraft.luxecraft.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.WishlistModel;

@Repository
public interface WishlistRepository
        extends JpaRepository<WishlistModel, Long> {

    // ==========================================
    // GET CUSTOMER WISHLIST
    // ==========================================

    List<WishlistModel> findByCustomer_CustomerId(
            Long customerId
    );


    // ==========================================
    // CHECK PRODUCT ALREADY IN WISHLIST
    // ==========================================

    boolean existsByCustomer_CustomerIdAndProduct_ProductId(
            Long customerId,
            Long productId
    );


    // ==========================================
    // FIND PARTICULAR WISHLIST ITEM
    // ==========================================

    Optional<WishlistModel>
    findByCustomer_CustomerIdAndProduct_ProductId(
            Long customerId,
            Long productId
    );
}