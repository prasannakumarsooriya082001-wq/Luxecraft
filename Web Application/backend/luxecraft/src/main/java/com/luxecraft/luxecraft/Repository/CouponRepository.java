package com.luxecraft.luxecraft.Repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.CouponModel;

@Repository
public interface CouponRepository extends JpaRepository<CouponModel, Long> {

    Optional<CouponModel> findByCodeIgnoreCase(String code);

    boolean existsByCodeIgnoreCase(String code);

    List<CouponModel> findAllByOrderByCouponIdDesc();
}
