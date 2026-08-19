package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import com.luxecraft.luxecraft.Model.ReviewModel;
import com.luxecraft.luxecraft.Service.ReviewService;

@RestController
@RequestMapping("/review")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;


    // =====================================================
    // ADD REVIEW
    // =====================================================

    @PostMapping("/add")
    public ResponseEntity<?> addReview(
            @RequestParam Long productId,
            @RequestParam Integer rating,
            @RequestParam String comment,
            Authentication authentication) {

        try {

            // JWT authentication-ல் இருந்து email
            String email =
                    authentication.getName();


            ReviewModel review =
                    reviewService.addReview(
                            email,
                            productId,
                            rating,
                            comment);


            return ResponseEntity.ok(review);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET PRODUCT REVIEWS
    // =====================================================

    @GetMapping("/product/{productId}")
    public ResponseEntity<?> getProductReviews(
            @PathVariable Long productId) {

        try {

            List<ReviewModel> reviews =
                    reviewService
                            .getProductReviews(productId);


            return ResponseEntity.ok(reviews);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // GET MY REVIEWS
    // =====================================================

    @GetMapping("/my-reviews")
    public ResponseEntity<?> getMyReviews(
            Authentication authentication) {

        try {

            String email =
                    authentication.getName();


            List<ReviewModel> reviews =
                    reviewService
                            .getCustomerReviews(email);


            return ResponseEntity.ok(reviews);

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }


    // =====================================================
    // DELETE REVIEW
    // =====================================================

    @DeleteMapping("/delete/{reviewId}")
    public ResponseEntity<?> deleteReview(
            @PathVariable Long reviewId,
            Authentication authentication) {

        try {

            String email =
                    authentication.getName();


            reviewService.deleteReview(
                    reviewId,
                    email);


            return ResponseEntity.ok(
                    "Review deleted successfully");

        } catch (RuntimeException e) {

            return ResponseEntity
                    .badRequest()
                    .body(e.getMessage());
        }
    }

    // =====================================================
// UPDATE REVIEW
// =====================================================

@PutMapping("/update/{reviewId}")
public ResponseEntity<?> updateReview(
        @PathVariable Long reviewId,
        @RequestParam Integer rating,
        @RequestParam String comment,
        Authentication authentication) {

    try {

        String email =
                authentication.getName();

        ReviewModel review =
                reviewService.updateReview(
                        reviewId,
                        email,
                        rating,
                        comment
                );

        return ResponseEntity.ok(review);

    } catch (RuntimeException e) {

        return ResponseEntity
                .badRequest()
                .body(e.getMessage());
    }
}
}