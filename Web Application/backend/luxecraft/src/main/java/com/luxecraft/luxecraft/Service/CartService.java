package com.luxecraft.luxecraft.Service;

import com.luxecraft.luxecraft.Exception.ResourceNotFoundException;import com.luxecraft.luxecraft.Exception.BusinessRuleException;import org.springframework.security.access.AccessDeniedException;

import java.util.ArrayList;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.luxecraft.luxecraft.Dto.CartDTO;
import com.luxecraft.luxecraft.Model.CartModel;
import com.luxecraft.luxecraft.Model.ProductModel;
import com.luxecraft.luxecraft.Repository.CartRepository;
import com.luxecraft.luxecraft.Repository.ProductRepository;

@Service
public class CartService {
    @Autowired
    private CartRepository cartRepository;

    @Autowired
    private ProductRepository pr;

    // ================= ADD TO CART =================

    public CartModel addToCart(Long customerId, Long productId, int quantity) {

        CartModel existingCart = cartRepository
                .findByCustomerId(customerId)
                .stream()
                .filter(cart -> cart.getProductId().equals(productId))
                .findFirst()
                .orElse(null);

        // Product already in cart
        if (existingCart != null) {

            existingCart.setQuantity(existingCart.getQuantity() + quantity);

            return cartRepository.save(existingCart);
        }

        // New cart item
        CartModel cart = new CartModel();

        cart.setCustomerId(customerId);
        cart.setProductId(productId);
        cart.setQuantity(quantity);

        return cartRepository.save(cart);
    }

    // ================= GET CUSTOMER CART =================

    public List<CartDTO> getCart(Long customerId) {

        List<CartModel> cartItems = cartRepository.findByCustomerId(customerId);

        List<CartDTO> result = new ArrayList<>();

        for (CartModel cart : cartItems) {

            ProductModel product = pr.findById(cart.getProductId())
                    .orElseThrow();

            CartDTO dto = new CartDTO();

            dto.setCartId(cart.getCartId());

            dto.setProductId(product.getProductId());

            dto.setProductName(product.getProductName());

            dto.setPrice(product.getPrice());

            dto.setImageUrl(product.getImageUrl());

            dto.setQuantity(cart.getQuantity());

            result.add(dto);

        }

        return result;
    }

    // ================= UPDATE QUANTITY =================

    public CartModel updateQuantity(Long customerId,Long cartId,int quantity) {

        CartModel cart = cartRepository.findById(cartId).orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cart.getCustomerId().equals(customerId)) {

            throw new AccessDeniedException("Unauthorized cart access");
        }

        if (quantity < 1) {

            throw new BusinessRuleException("Quantity must be at least 1");
        }

        cart.setQuantity(quantity);

        return cartRepository.save(cart);
    }

    // ================= REMOVE FROM CART =================

    public void removeFromCart(Long customerId, Long cartId) {

        CartModel cart = cartRepository.findById(cartId).orElseThrow(() -> new ResourceNotFoundException("Cart item not found"));

        if (!cart.getCustomerId().equals(customerId)) {

            throw new AccessDeniedException("Unauthorized cart access");
        }

        cartRepository.delete(cart);
    }

}
