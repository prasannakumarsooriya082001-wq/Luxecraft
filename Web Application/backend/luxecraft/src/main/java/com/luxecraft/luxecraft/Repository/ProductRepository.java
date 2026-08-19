package com.luxecraft.luxecraft.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.luxecraft.luxecraft.Model.ProductModel;

@Repository
public interface ProductRepository extends JpaRepository<ProductModel, Long> {

     List<ProductModel> findAllByOrderByProductIdAsc();

     /** Products at or below a stock threshold, scarcest first. */
     List<ProductModel> findByStockQuantityLessThanEqualOrderByStockQuantityAsc(
                 Integer threshold);

     long countByStockQuantityLessThanEqual(Integer threshold);

     long countByStockQuantity(Integer quantity);

     /**
      * Takes units out of stock atomically.
      *
      * The check and the subtraction happen in a single SQL statement, so two
      * checkouts racing for the last item cannot both succeed. Reading the
      * stock, testing it in Java and writing it back could - both would read
      * 1, both would pass, and both would write 0, overselling the item.
      *
      * @return 1 when the units were taken, 0 when there were not enough.
      */
     @Modifying(flushAutomatically = true)
     @Query("""
                 UPDATE ProductModel p
                 SET p.stockQuantity = p.stockQuantity - :quantity
                 WHERE p.productId = :productId
                   AND p.stockQuantity >= :quantity
             """)
     int decrementStock(
                 @Param("productId") Long productId,
                 @Param("quantity") int quantity);

     /** Puts units back, e.g. when an order is cancelled. */
     @Modifying(flushAutomatically = true)
     @Query("""
                 UPDATE ProductModel p
                 SET p.stockQuantity = p.stockQuantity + :quantity
                 WHERE p.productId = :productId
             """)
     int restoreStock(
                 @Param("productId") Long productId,
                 @Param("quantity") int quantity);

     /**
      * Search + filter in one query.
      *
      * No parameter is ever null. PostgreSQL cannot infer the type of a null
      * bind parameter, so "WHERE :keyword IS NULL OR LOWER(...)" made it guess
      * bytea and fail with "function lower(bytea) does not exist". Instead the
      * service passes neutral sentinels that match everything:
      *   keyword    "%"  (matches any name)
      *   categoryId -1   (no category filter)
      *   maxPrice   -1   (no price ceiling)
      */
     @Query("""
                 SELECT p FROM ProductModel p
                 WHERE (LOWER(p.productName) LIKE :keyword
                        OR LOWER(p.description) LIKE :keyword)
                   AND (:categoryId = -1 OR p.category.categoryId = :categoryId)
                   AND (:inStockOnly = false OR p.stockQuantity > 0)
                   AND (:maxPrice < 0 OR p.price <= :maxPrice)
             """)
     Page<ProductModel> search(
                 @Param("keyword") String keyword,
                 @Param("categoryId") Long categoryId,
                 @Param("inStockOnly") boolean inStockOnly,
                 @Param("maxPrice") Double maxPrice,
                 Pageable pageable);

}
