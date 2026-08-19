package com.luxecraft.luxecraft.Service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.DashboardResponse;
import com.luxecraft.luxecraft.Repository.CustomerRepository;
import com.luxecraft.luxecraft.Repository.OrderRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;

@Service
public class DashboardService {
    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public DashboardResponse getDashboardData() {

        long products = productRepository.count();

        long orders = orderRepository.count();

        long customers = customerRepository.count();

        double revenue = orderRepository.getTotalRevenue();

        return new DashboardResponse(
                products,
                orders,
                customers,
                revenue);
    }

}
