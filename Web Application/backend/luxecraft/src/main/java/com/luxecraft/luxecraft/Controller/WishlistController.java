package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.luxecraft.luxecraft.Model.WishlistModel;
import com.luxecraft.luxecraft.Service.WishlistService;

@RestController
@RequestMapping("/wishlist")
public class WishlistController {

    @Autowired
    private WishlistService wishlistService;


    // =====================================================
    // ADD TO WISHLIST
    // =====================================================

    @PostMapping("/add")
    public ResponseEntity<?> addToWishlist(
            @RequestParam Long productId,
            Authentication authentication) {

        try {

            // Get email from JWT
            String email =
                    authentication.getName();


            WishlistModel wishlist =
                    wishlistService.addToWishlist(
                            email,
                            productId);


            return ResponseEntity.ok(wishlist);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET MY WISHLIST
    // =====================================================

    @GetMapping("/my-wishlist")
    public ResponseEntity<?> getMyWishlist(
            Authentication authentication) {

        try {

            // Get email from JWT
            String email =
                    authentication.getName();


            List<WishlistModel> wishlist =
                    wishlistService.getMyWishlist(
                            email);


            return ResponseEntity.ok(wishlist);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // REMOVE FROM WISHLIST
    // =====================================================

    @DeleteMapping("/remove/{productId}")
    public ResponseEntity<?> removeFromWishlist(
            @PathVariable Long productId,
            Authentication authentication) {

        try {

            // Get email from JWT
            String email =
                    authentication.getName();


            wishlistService.removeFromWishlist(
                    email,
                    productId);


            return ResponseEntity.ok(
                    "Product removed from wishlist successfully"
            );

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }
}