package com.luxecraft.luxecraft.Repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.CategoryModel;

@Repository
public interface CategoryRepository extends JpaRepository<CategoryModel,Long>
{

    List<CategoryModel> findAllByOrderByCategoryIdAsc();
} 
