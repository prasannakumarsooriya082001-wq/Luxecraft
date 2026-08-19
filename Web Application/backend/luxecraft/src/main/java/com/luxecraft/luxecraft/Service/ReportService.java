package com.luxecraft.luxecraft.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Dto.MonthlyRevenueDTO;
import com.luxecraft.luxecraft.Dto.ReportDTO;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.OrderItemRepository;
import com.luxecraft.luxecraft.Repository.OrderRepository;

@Service
public class ReportService {

        @Autowired
        private OrderRepository orderRepository;

        @Autowired
        private CustomerRepository customerRepository;

        @Autowired
        private OrderItemRepository orderItemRepository;

        // ================= DASHBOARD REPORT =================

        public ReportDTO getDashboardReport() {

                double totalRevenue = orderRepository.getTotalRevenue();

                long totalOrders = orderRepository.getTotalOrders();

                long totalCustomers = customerRepository.getTotalCustomers();

                long totalProductsSold = orderItemRepository.getTotalProductsSold();

                return new ReportDTO(
                                totalRevenue,
                                totalOrders,
                                totalCustomers,
                                totalProductsSold);
        }

        public List<MonthlyRevenueDTO> getMonthlyRevenue() {

                List<Object[]> results = orderRepository.getMonthlyRevenue();

                return results.stream()
                                .map(row -> new MonthlyRevenueDTO(
                                                (String) row[0],
                                                (Number) row[1]))
                                .toList();
        }
}