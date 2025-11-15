'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of a cart item
interface CartItem {
  id: string; // A unique identifier for the cart item, e.g., product.id + options hash
  productId: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  options: { label: string, value: string }[];
}

// Define the shape of the context
interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  total: number;
}

// Create the context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Define the props for the provider
interface CartProviderProps {
  children: ReactNode;
}

// Create a simple hash for object
const objectToHash = (obj: any): string => {
    // A very simple hash function. For a real app, a more robust solution like object-hash would be better.
    const str = JSON.stringify(obj);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << 5) - hash + char;
        hash |= 0; // Convert to 32bit integer
    }
    return hash.toString(16);
};


export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on initial render
  useEffect(() => {
    try {
      const storedCart = localStorage.getItem('bomedia_cart');
      if (storedCart) {
        setItems(JSON.parse(storedCart));
      }
    } catch (error) {
      console.warn("Could not read cart from localStorage", error);
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bomedia_cart', JSON.stringify(items));
    } catch (error) {
      console.warn("Could not save cart to localStorage", error);
    }
  }, [items]);

  const addToCart = (newItem: Omit<CartItem, 'id'>) => {
    const itemId = `${newItem.productId}-${objectToHash(newItem.options)}`;
    
    setItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(item => item.id === itemId);
      
      if (existingItemIndex > -1) {
        // Item with the same options exists, update quantity
        const updatedItems = [...prevItems];
        const existingItem = updatedItems[existingItemIndex];
        updatedItems[existingItemIndex] = {
          ...existingItem,
          quantity: existingItem.quantity + newItem.quantity,
          price: existingItem.price + newItem.price, // Update price based on new quantity
        };
        return updatedItems;
      } else {
        // Item is new, add it to the cart
        return [...prevItems, { ...newItem, id: itemId }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item => {
        if (item.id === itemId) {
            // Recalculate price based on new quantity. This assumes base price is per unit.
            const unitPrice = item.price / item.quantity;
            return { ...item, quantity, price: unitPrice * quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };
  
  const subtotal = items.reduce((sum, item) => sum + item.price, 0);
  const total = subtotal; // For now, total is the same as subtotal. Can add taxes/shipping later.

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        subtotal,
        total,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
