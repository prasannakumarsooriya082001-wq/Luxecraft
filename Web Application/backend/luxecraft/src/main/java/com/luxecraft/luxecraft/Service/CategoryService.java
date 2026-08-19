package com.luxecraft.luxecraft.Service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Model.CategoryModel;
import com.luxecraft.luxecraft.Repository.CategoryRepository;

@Service
public class CategoryService 
{

    @Autowired
    private CategoryRepository cr;


    public CategoryModel addCategory(CategoryModel category) 
    {

        return cr.save(category);

    }



    public List<CategoryModel> getAllCategories() {

        return cr.findAllByOrderByCategoryIdAsc();

    }


    

    public CategoryModel getCategoryById(Long categoryId) {

        return cr.findById(categoryId).orElse(null);

    }



    public CategoryModel updateCategory(Long categoryId, CategoryModel category) {

        CategoryModel existingCategory = cr.findById(categoryId).orElse(null);

        if(existingCategory != null)
        {

            existingCategory.setCategoryName(category.getCategoryName());
            existingCategory.setDescription(category.getDescription());
            existingCategory.setStatus(category.getStatus());

            return cr.save(existingCategory);

        }

        return null;

    }

    
    public void deleteCategory(Long categoryId) {

        cr.deleteById(categoryId);

    }
}
