package com.luxecraft.luxecraft.Service;

import java.io.IOException;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.luxecraft.luxecraft.Dto.InventorySummaryDTO;
import com.luxecraft.luxecraft.Dto.PagedResponse;
import com.luxecraft.luxecraft.Exception.BusinessRuleException;
import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;
import com.luxecraft.luxecraft.Model.CategoryModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Repository.CategoryRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;

@Service
public class ProductService {
    @Autowired
    private ProductRepository pr;

    @Autowired
    private CategoryRepository cr;

    @Autowired
    private FileUploadService fus;

    public ProductModel addProduct(String productName,
            String description,
            Double price,
            Integer stockQuantity,
            String status,
            Long categoryId,
            MultipartFile image) throws IOException {

        ProductModel product = new ProductModel();

        product.setProductName(productName);

        product.setDescription(description);

        product.setPrice(price);

        product.setStockQuantity(stockQuantity);

        product.setStatus(status);

        String imageName = fus.uploadImage(image);

        product.setImageUrl(imageName);

        CategoryModel category = cr.findById(categoryId).orElseThrow();

        product.setCategory(category);

        return pr.save(product);

    }

    /**
     * Paged, searchable, filterable product listing.
     *
     * Page size is capped so a caller cannot ask for the whole table in one
     * request, which is what the old getAllProducts did on every page load.
     */
    public PagedResponse<ProductModel> searchProducts(
            String keyword,
            Long categoryId,
            boolean inStockOnly,
            Double maxPrice,
            int page,
            int size,
            String sort) {

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), 60);

        Sort ordering = switch (sort == null ? "" : sort) {
            case "price_asc" -> Sort.by(Sort.Direction.ASC, "price");
            case "price_desc" -> Sort.by(Sort.Direction.DESC, "price");
            case "name" -> Sort.by(Sort.Direction.ASC, "productName");
            default -> Sort.by(Sort.Direction.ASC, "productId");
        };

        Pageable pageable = PageRequest.of(safePage, safeSize, ordering);

        // Neutral sentinels instead of nulls - see ProductRepository.search
        String pattern = (keyword == null || keyword.isBlank())
                ? "%"
                : "%" + keyword.trim().toLowerCase() + "%";

        Long category = (categoryId == null) ? -1L : categoryId;

        Double priceCeiling = (maxPrice == null) ? -1.0 : maxPrice;

        Page<ProductModel> result = pr.search(
                pattern, category, inStockOnly, priceCeiling, pageable);

        return PagedResponse.from(result);
    }

    // =====================================================
    // INVENTORY (ADMIN)
    // =====================================================

    /** Default "running low" line. Anything at or below this is flagged. */
    public static final int LOW_STOCK_THRESHOLD = 5;

    /**
     * Sets stock to an exact figure - used after a physical stock count.
     */
    public ProductModel setStock(Long productId, Integer quantity) {

        if (quantity == null || quantity < 0) {

            throw new BusinessRuleException(
                    "Stock quantity cannot be negative.");
        }

        ProductModel product = pr.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product", productId));

        product.setStockQuantity(quantity);

        return pr.save(product);
    }

    /**
     * Adds or removes stock relative to what is there now - used when a
     * delivery arrives or damaged units are written off.
     */
    public ProductModel adjustStock(Long productId, Integer delta) {

        if (delta == null || delta == 0) {

            throw new BusinessRuleException(
                    "Enter how many units to add or remove.");
        }

        ProductModel product = pr.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Product", productId));

        int current = product.getStockQuantity() == null
                ? 0
                : product.getStockQuantity();

        int updated = current + delta;

        if (updated < 0) {

            throw new BusinessRuleException(
                    "Cannot remove " + Math.abs(delta)
                            + " units - only " + current + " in stock.");
        }

        product.setStockQuantity(updated);

        return pr.save(product);
    }

    public List<ProductModel> getLowStockProducts(Integer threshold) {

        int limit = (threshold == null || threshold < 0)
                ? LOW_STOCK_THRESHOLD
                : threshold;

        return pr.findByStockQuantityLessThanEqualOrderByStockQuantityAsc(limit);
    }

    public InventorySummaryDTO getInventorySummary() {

        return new InventorySummaryDTO(
                pr.count(),
                pr.countByStockQuantityLessThanEqual(LOW_STOCK_THRESHOLD),
                pr.countByStockQuantity(0),
                LOW_STOCK_THRESHOLD);
    }

    public List<ProductModel> getAllProducts() {

        return pr.findAllByOrderByProductIdAsc();

    }

    public ProductModel getProductById(Long productId) {

        return pr.findById(productId).orElse(null);

    }

    public ProductModel updateProduct(
            Long productId,
            String productName,
            String description,
            Double price,
            Integer stockQuantity,
            String status,
            Long categoryId,
            MultipartFile image) throws IOException {

        ProductModel product = pr.findById(productId).orElseThrow();

        product.setProductName(productName);
        product.setDescription(description);
        product.setPrice(price);
        product.setStockQuantity(stockQuantity);
        product.setStatus(status);

        CategoryModel category = cr.findById(categoryId).orElseThrow();
        product.setCategory(category);

        // New image selected
        if (image != null && !image.isEmpty()) {

            String imageName = fus.uploadImage(image);

            product.setImageUrl(imageName);
        }

        return pr.save(product);
    }

    public String deleteProduct(Long productId) {

        if (pr.existsById(productId)) {

            pr.deleteById(productId);

            return "Product Deleted Successfully";

        }

        return "Product Not Found";

    }

}
