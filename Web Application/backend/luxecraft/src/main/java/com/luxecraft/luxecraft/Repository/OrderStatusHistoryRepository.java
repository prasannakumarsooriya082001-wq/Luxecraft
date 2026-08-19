package com.luxecraft.luxecraft.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.OrderStatusHistoryModel;

@Repository
public interface OrderStatusHistoryRepository
        extends JpaRepository<OrderStatusHistoryModel, Long> {

    /**
     * Oldest first. historyId breaks ties, because two changes made in the
     * same millisecond would otherwise come back in an arbitrary order.
     */
    List<OrderStatusHistoryModel> findByOrderIdOrderByChangedAtAscHistoryIdAsc(
            Long orderId);
}
