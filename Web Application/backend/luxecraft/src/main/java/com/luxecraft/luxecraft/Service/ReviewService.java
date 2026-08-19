package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;
import com.luxecraft.luxecraft.Exception.BusinessRuleException;
import org.springframework.security.access.AccessDeniedException;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Model.ReviewModel;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.OrderItemRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;
import com.luxecraft.luxecraft.Repository.ReviewRepository;

@Service
public class ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderItemRepository orderItemRepository;


    // =====================================================
    // ADD REVIEW
    // =====================================================

    public ReviewModel addReview(
            String email,
            Long productId,
            Integer rating,
            String comment) {


        // =================================================
        // VALIDATE RATING
        // =================================================

        if (rating == null || rating < 1 || rating > 5) {

            throw new BusinessRuleException(
                    "Rating must be between 1 and 5");
        }


        // =================================================
        // VALIDATE COMMENT
        // =================================================

        if (comment == null || comment.trim().isEmpty()) {

            throw new BusinessRuleException(
                    "Review comment cannot be empty");
        }


        // =================================================
        // FIND CUSTOMER FROM JWT EMAIL
        // =================================================

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        // =================================================
        // FIND PRODUCT
        // =================================================

        ProductModel product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found"));


        // =================================================
        // CHECK THE CUSTOMER ACTUALLY BOUGHT IT
        // =================================================

        boolean hasPurchased =
                orderItemRepository
                        .hasCustomerPurchasedProduct(
                                customer.getCustomerId(),
                                productId);


        if (!hasPurchased) {

            throw new BusinessRuleException(
                    "You can only review a product you have purchased.");
        }


        // =================================================
        // CHECK DUPLICATE REVIEW
        // =================================================

        boolean alreadyReviewed =
                reviewRepository
                        .existsByCustomer_CustomerIdAndProduct_ProductId(
                                customer.getCustomerId(),
                                productId);


        if (alreadyReviewed) {

            throw new BusinessRuleException(
                    "You have already reviewed this product");
        }


        // =================================================
        // CREATE REVIEW
        // =================================================

        ReviewModel review =
                new ReviewModel();

        review.setRating(rating);

        review.setComment(comment.trim());

        review.setCreatedAt(
                LocalDateTime.now());

        review.setCustomer(customer);

        review.setProduct(product);


        // =================================================
        // SAVE
        // =================================================

        return reviewRepository.save(review);
    }


    // =====================================================
    // GET PRODUCT REVIEWS
    // =====================================================

    public List<ReviewModel> getProductReviews(
            Long productId) {

        return reviewRepository
                .findByProduct_ProductIdOrderByCreatedAtDesc(
                        productId);
    }


    // =====================================================
    // GET CUSTOMER REVIEWS
    // =====================================================

    public List<ReviewModel> getCustomerReviews(
            String email) {

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        return reviewRepository
                .findByCustomer_CustomerIdOrderByCreatedAtDesc(
                        customer.getCustomerId());
    }


    // =====================================================
    // DELETE REVIEW
    // =====================================================

    public void deleteReview(
            Long reviewId,
            String email) {


        ReviewModel review =
                reviewRepository
                        .findById(reviewId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Review not found"));


        // =================================================
        // GET LOGGED-IN CUSTOMER
        // =================================================

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        // =================================================
        // OWNER CHECK
        // =================================================

        if (!review.getCustomer()
                .getCustomerId()
                .equals(customer.getCustomerId())) {

            throw new AccessDeniedException(
                    "You can delete only your own review");
        }


        reviewRepository.delete(review);
    }

    // =====================================================
// UPDATE REVIEW
// =====================================================

public ReviewModel updateReview(
        Long reviewId,
        String email,
        Integer rating,
        String comment) {

    ReviewModel review =
            reviewRepository
                    .findById(reviewId)
                    .orElseThrow(() ->
                            new ResourceNotFoundException(
                                    "Review not found"
                            )
                    );


    // =================================================
    // CHECK REVIEW OWNER
    // =================================================

    if (!review.getCustomer()
            .getEmail()
            .equals(email)) {

        throw new AccessDeniedException(
                "You can update only your own review"
        );

    }


    // =================================================
    // VALIDATE RATING
    // =================================================

    if (rating < 1 || rating > 5) {

        throw new BusinessRuleException(
                "Rating must be between 1 and 5"
        );

    }


    // =================================================
    // VALIDATE COMMENT
    // =================================================

    if (comment == null ||
            comment.trim().isEmpty()) {

        throw new BusinessRuleException(
                "Review comment cannot be empty"
        );

    }


    review.setRating(rating);

    review.setComment(
            comment.trim()
    );


    return reviewRepository.save(review);
}
}