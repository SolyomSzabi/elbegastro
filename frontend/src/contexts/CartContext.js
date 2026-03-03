import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);

  const addItem = (menuItem) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === menuItem.id && !i.parentId);
      if (existing) {
        return prev.map(i => (i.id === menuItem.id && !i.parentId) ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...menuItem, quantity: 1, notes: '', linkedExtras: [] }];
    });
  };

  // Add an extra linked to a parent food item
  const addExtra = (extra, parentId) => {
    const uniqueKey = `${extra.id}__for__${parentId}`;
    setItems(prev => {
      // Add or increment the extra item in cart
      const existingExtra = prev.find(i => i._cartKey === uniqueKey);
      let updated;
      if (existingExtra) {
        updated = prev.map(i => i._cartKey === uniqueKey ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        updated = [...prev, { ...extra, _cartKey: uniqueKey, parentId, quantity: 1 }];
      }
      // Link extra to parent's linkedExtras
      updated = updated.map(i => {
        if (i.id === parentId && !i.parentId) {
          const alreadyLinked = i.linkedExtras.some(e => e.cartKey === uniqueKey);
          if (!alreadyLinked) {
            return { ...i, linkedExtras: [...i.linkedExtras, { cartKey: uniqueKey, extraId: extra.id }] };
          }
        }
        return i;
      });
      return updated;
    });
  };

  const removeItem = (itemId, cartKey) => {
    setItems(prev => {
      // If removing by cartKey (extra item)
      if (cartKey) {
        // Remove the extra and unlink from parent
        return prev
          .filter(i => i._cartKey !== cartKey)
          .map(i => {
            if (i.linkedExtras) {
              return { ...i, linkedExtras: i.linkedExtras.filter(e => e.cartKey !== cartKey) };
            }
            return i;
          });
      }
      // If removing a food item, also remove its linked extras
      const food = prev.find(i => i.id === itemId && !i.parentId);
      const linkedKeys = food?.linkedExtras?.map(e => e.cartKey) || [];
      return prev.filter(i => {
        if (i.id === itemId && !i.parentId) return false;
        if (linkedKeys.includes(i._cartKey)) return false;
        return true;
      });
    });
  };

  const updateQuantity = (itemId, quantity, cartKey) => {
    if (quantity <= 0) {
      removeItem(itemId, cartKey);
      return;
    }
    setItems(prev => prev.map(i => {
      if (cartKey && i._cartKey === cartKey) return { ...i, quantity };
      if (!cartKey && i.id === itemId && !i.parentId) return { ...i, quantity };
      return i;
    }));
  };

  const updateNotes = (itemId, notes) => {
    setItems(prev => prev.map(i =>
      (i.id === itemId && !i.parentId) ? { ...i, notes } : i
    ));
  };

  const clearCart = () => setItems([]);

  // Only food items (non-extras) for display
  const foodItems = items.filter(i => !i.parentId);
  // All extras
  const extraItems = items.filter(i => i.parentId);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Get extras linked to a specific food item
  const getLinkedExtras = (foodItemId) => {
    const food = items.find(i => i.id === foodItemId && !i.parentId);
    if (!food || !food.linkedExtras) return [];
    return food.linkedExtras
      .map(link => items.find(i => i._cartKey === link.cartKey))
      .filter(Boolean);
  };

  return (
    <CartContext.Provider value={{
      items, foodItems, extraItems, addItem, addExtra, removeItem,
      updateQuantity, updateNotes, clearCart, totalItems, totalPrice,
      getLinkedExtras
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
