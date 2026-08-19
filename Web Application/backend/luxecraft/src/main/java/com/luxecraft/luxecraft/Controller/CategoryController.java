package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.luxecraft.luxecraft.Model.CategoryModel;
import com.luxecraft.luxecraft.Service.CategoryService;



@RestController
@RequestMapping("/category")
@CrossOrigin("*")
public class CategoryController 
{
    @Autowired
    private CategoryService cs;


    @PostMapping("/add")
    public CategoryModel addCategory(@RequestBody CategoryModel category) {

        return cs.addCategory(category);

    }


    @GetMapping("/getAll")
    public List<CategoryModel> getAllCategories() {

        return cs.getAllCategories();

    }


    @GetMapping("/get/{categoryId}")
    public CategoryModel getCategoryById(@PathVariable Long categoryId) {

        return cs.getCategoryById(categoryId);

    }


    @PutMapping("/update/{categoryId}")
    public CategoryModel updateCategory(@PathVariable Long categoryId, @RequestBody CategoryModel category) {

        return cs.updateCategory(categoryId, category);

    }


    @DeleteMapping("/delete/{categoryId}")
    public String deleteCategory(@PathVariable Long categoryId) {

        cs.deleteCategory(categoryId);

        return "Category Deleted Successfully";

    }
}
