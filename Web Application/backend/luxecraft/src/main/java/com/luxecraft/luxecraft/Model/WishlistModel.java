package com.luxecraft.luxecraft.Model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(
    name = "wishlist",
    uniqueConstraints = {
        @UniqueConstraint(
            columnNames = {"customer_id", "product_id"}
        )
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WishlistModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long wishlistId;

    // ==========================================
    // CUSTOMER
    // ==========================================

    @ManyToOne
    @JoinColumn(
        name = "customer_id",
        nullable = false
    )
    private CustomerModel customer;

    // ==========================================
    // PRODUCT
    // ==========================================

    @ManyToOne
    @JoinColumn(
        name = "product_id",
        nullable = false
    )
    private ProductModel product;
}