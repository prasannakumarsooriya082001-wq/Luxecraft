package com.luxecraft.luxecraft.Controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

import com.luxecraft.luxecraft.Dto.InventorySummaryDTO;
import com.luxecraft.luxecraft.Dto.PagedResponse;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Service.ProductService;

@RestController
@RequestMapping("/product")
public class ProductController {
    @Autowired
    private ProductService ps;

    /**
     * Paged search / filter. Everything is optional:
     * /product/search?q=leather&categoryId=2&inStock=true&page=0&size=12&sort=price_asc
     */
    @GetMapping("/search")
    public PagedResponse<ProductModel> searchProducts(
            @RequestParam(name = "q", required = false) String keyword,
            @RequestParam(name = "categoryId", required = false) Long categoryId,
            @RequestParam(name = "inStock", defaultValue = "false") boolean inStockOnly,
            @RequestParam(name = "maxPrice", required = false) Double maxPrice,
            @RequestParam(name = "page", defaultValue = "0") int page,
            @RequestParam(name = "size", defaultValue = "12") int size,
            @RequestParam(name = "sort", required = false) String sort) {

        return ps.searchProducts(
                keyword, categoryId, inStockOnly, maxPrice, page, size, sort);
    }

    // =====================================================
    // INVENTORY (ADMIN ONLY - see SecurityConfig /product/admin/**)
    // =====================================================

    /** Headline counts for the inventory panel. */
    @GetMapping("/admin/inventory-summary")
    public InventorySummaryDTO getInventorySummary() {

        return ps.getInventorySummary();
    }

    /** Products at or below the threshold (defaults to 5). */
    @GetMapping("/admin/low-stock")
    public List<ProductModel> getLowStock(
            @RequestParam(name = "threshold", required = false) Integer threshold) {

        return ps.getLowStockProducts(threshold);
    }

    /** Set stock to an exact number, e.g. after a stock count. */
    @PutMapping("/admin/stock/{productId}")
    public ProductModel setStock(
            @PathVariable Long productId,
            @RequestParam("quantity") Integer quantity) {

        return ps.setStock(productId, quantity);
    }

    /** Add or remove units relative to current stock (delta may be negative). */
    @PutMapping("/admin/stock/{productId}/adjust")
    public ProductModel adjustStock(
            @PathVariable Long productId,
            @RequestParam("delta") Integer delta) {

        return ps.adjustStock(productId, delta);
    }

    @PostMapping("/add")
    public String addProduct(
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("status") String status,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam("image") MultipartFile image) throws IOException {

        ps.addProduct(
                productName,
                description,
                price,
                stockQuantity,
                status,
                categoryId,
                image);

        return "Product Added Successfully";
    }

    @GetMapping("/getAll")
    public List<ProductModel> getAllProducts() {

        return ps.getAllProducts();

    }

    @GetMapping("/get/{productId}")
    public ProductModel getProductById(@PathVariable Long productId) {

        return ps.getProductById(productId);

    }

    @PutMapping("/update")
    public ProductModel updateProduct(
            @RequestParam("productId") Long productId,
            @RequestParam("productName") String productName,
            @RequestParam("description") String description,
            @RequestParam("price") Double price,
            @RequestParam("stockQuantity") Integer stockQuantity,
            @RequestParam("status") String status,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "image", required = false) MultipartFile image) throws IOException {

        return ps.updateProduct(
                productId,
                productName,
                description,
                price,
                stockQuantity,
                status,
                categoryId,
                image);
    }

    @DeleteMapping("/delete/{productId}")
    public String deleteProduct(@PathVariable Long productId) {

        return ps.deleteProduct(productId);

    }

}
