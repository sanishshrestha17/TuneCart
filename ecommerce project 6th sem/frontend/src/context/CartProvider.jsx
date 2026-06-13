// src/context/CartProvider.jsx
import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add to Cart
  const addToCart = (product) => {
    setCart((currentCart) => {
      const exists = currentCart.find((p) => p._id === product._id);

      if (exists) {
        return currentCart.map((p) =>
          p._id === product._id ? { ...p, qty: p.qty + 1 } : p
        );
      } else {
        return [...currentCart, { ...product, qty: 1 }];
      }
    });
  };

  // Remove from Cart (decrease quantity)
  const removeFromCart = (productId) => {
    setCart((currentCart) => {
      const updated = currentCart
        .map((p) => {
          if (p._id === productId) {
            if (p.qty > 1) {
              return { ...p, qty: p.qty - 1 };
            } else {
              return null; // will be filtered
            }
          }
          return p;
        })
        .filter(Boolean); // remove null items

      return updated;
    });
  };

  // Clear entire cart - FIXED & FUNCTIONAL
  const clearCart = () => {
    setCart([]);
    localStorage.removeItem("cart");
  };

  // Calculate total
  const total = cart.reduce((acc, item) => {
    return acc + (item.price || 0) * (item.qty || 1);
  }, 0);

  const value = {
    cart,
    addToCart,
    removeFromCart,
    clearCart,        // Now properly exported
    total,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;