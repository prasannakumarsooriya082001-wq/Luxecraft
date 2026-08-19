package com.luxecraft.luxecraft.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Dto.MonthlyRevenueDTO;
import com.luxecraft.luxecraft.Model.OrderItemModel;
import com.luxecraft.luxecraft.Model.OrderModel;

@Repository
public interface OrderRepository extends JpaRepository<OrderModel, Long> {
    List<OrderModel> findByCustomerId(Long customerId);

    @Query("SELECT COALESCE(SUM(o.totalAmount), 0) FROM OrderModel o")
    double getTotalRevenue();

    @Query("SELECT COUNT(o) FROM OrderModel o")
    long getTotalOrders();

    List<OrderModel> findTop3ByOrderByOrderIdDesc();

    long countByCustomerId(Long customerId);

     @Query(value = """
            SELECT
                TO_CHAR(order_date, 'Mon') AS month,
                COALESCE(SUM(total_amount), 0) AS revenue
            FROM orders
            GROUP BY TO_CHAR(order_date, 'Mon')
            ORDER BY MIN(order_date)
            """,
            nativeQuery = true)
    List<Object[]> getMonthlyRevenue();
}
