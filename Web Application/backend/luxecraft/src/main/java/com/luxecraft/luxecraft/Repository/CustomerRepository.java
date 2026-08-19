package com.luxecraft.luxecraft.Repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import com.luxecraft.luxecraft.Model.CustomerModel;

@Repository
public interface CustomerRepository extends JpaRepository<CustomerModel, Long> {
    boolean existsByEmail(String email);

    Optional<CustomerModel> findByEmail(String email);

    @Query("SELECT COUNT(c) FROM CustomerModel c")
    long getTotalCustomers();
}
