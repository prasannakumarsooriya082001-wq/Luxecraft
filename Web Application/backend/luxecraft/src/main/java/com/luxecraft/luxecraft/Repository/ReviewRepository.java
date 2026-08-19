package com.luxecraft.luxecraft.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.ReviewModel;

@Repository
public interface ReviewRepository extends JpaRepository<ReviewModel, Long> {

    List<ReviewModel> findByProduct_ProductIdOrderByCreatedAtDesc(
            Long productId);

    List<ReviewModel> findByCustomer_CustomerIdOrderByCreatedAtDesc(
            Long customerId);

    boolean existsByCustomer_CustomerIdAndProduct_ProductId(
            Long customerId,
            Long productId);
}