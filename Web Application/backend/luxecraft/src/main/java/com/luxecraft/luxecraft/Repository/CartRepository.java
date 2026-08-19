package com.luxecraft.luxecraft.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.CartModel;

@Repository
public interface CartRepository extends JpaRepository<CartModel, Long> 
{
     List<CartModel> findByCustomerId(Long customerId);
    
}
