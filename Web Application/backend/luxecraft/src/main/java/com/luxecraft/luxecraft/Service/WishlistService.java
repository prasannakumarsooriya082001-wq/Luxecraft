package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.BusinessRuleException;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.CustomerModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Model.WishlistModel;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;
import com.luxecraft.luxecraft.Repository.WishlistRepository;

@Service
public class WishlistService {

    @Autowired
    private WishlistRepository wishlistRepository;

    @Autowired
    private CustomerRepository customerRepository;

    @Autowired
    private ProductRepository productRepository;


    // =====================================================
    // ADD TO WISHLIST
    // =====================================================

    public WishlistModel addToWishlist(
            String email,
            Long productId) {

        // -------------------------------------------------
        // FIND CUSTOMER
        // -------------------------------------------------

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        // -------------------------------------------------
        // FIND PRODUCT
        // -------------------------------------------------

        ProductModel product =
                productRepository
                        .findById(productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found"));


        // -------------------------------------------------
        // CHECK DUPLICATE
        // -------------------------------------------------

        boolean alreadyExists =
                wishlistRepository
                        .existsByCustomer_CustomerIdAndProduct_ProductId(
                                customer.getCustomerId(),
                                productId);


        if (alreadyExists) {

            throw new BusinessRuleException(
                    "Product already exists in wishlist");
        }


        // -------------------------------------------------
        // CREATE WISHLIST
        // -------------------------------------------------

        WishlistModel wishlist =
                new WishlistModel();

        wishlist.setCustomer(customer);

        wishlist.setProduct(product);


        // -------------------------------------------------
        // SAVE
        // -------------------------------------------------

        return wishlistRepository.save(wishlist);
    }


    // =====================================================
    // GET MY WISHLIST
    // =====================================================

    public List<WishlistModel> getMyWishlist(
            String email) {

        // -------------------------------------------------
        // FIND CUSTOMER
        // -------------------------------------------------

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        // -------------------------------------------------
        // GET WISHLIST
        // -------------------------------------------------

        return wishlistRepository
                .findByCustomer_CustomerId(
                        customer.getCustomerId());
    }


    // =====================================================
    // REMOVE FROM WISHLIST
    // =====================================================

    public void removeFromWishlist(
            String email,
            Long productId) {

        // -------------------------------------------------
        // FIND CUSTOMER
        // -------------------------------------------------

        CustomerModel customer =
                customerRepository
                        .findByEmail(email)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Customer not found"));


        // -------------------------------------------------
        // FIND WISHLIST ITEM
        // -------------------------------------------------

        WishlistModel wishlist =
                wishlistRepository
                        .findByCustomer_CustomerIdAndProduct_ProductId(
                                customer.getCustomerId(),
                                productId)
                        .orElseThrow(() ->
                                new ResourceNotFoundException(
                                        "Product not found in wishlist"));


        // -------------------------------------------------
        // DELETE
        // -------------------------------------------------

        wishlistRepository.delete(wishlist);
    }
}