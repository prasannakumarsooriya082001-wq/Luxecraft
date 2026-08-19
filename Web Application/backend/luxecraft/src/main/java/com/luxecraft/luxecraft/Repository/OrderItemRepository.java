package com.luxecraft.luxecraft.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.OrderItemModel;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemModel, Long> {
    List<OrderItemModel> findByOrderId(Long orderId);

    Optional<OrderItemModel> findFirstByOrderIdOrderByOrderItemIdAsc(Long orderId);

    @Query("SELECT COALESCE(SUM(o.quantity),0) FROM OrderItemModel o")
    long getTotalProductsSold();

    /**
     * Has this customer actually bought this product?
     * Cancelled orders do not count, so someone cannot order, review, then
     * cancel to leave a review without buying.
     */
    @Query("""
                SELECT COUNT(oi) > 0
                FROM OrderItemModel oi, OrderModel o
                WHERE oi.orderId = o.orderId
                  AND o.customerId = :customerId
                  AND oi.productId = :productId
                  AND UPPER(o.status) <> 'CANCELLED'
            """)
    boolean hasCustomerPurchasedProduct(
            @Param("customerId") Long customerId,
            @Param("productId") Long productId);
}
