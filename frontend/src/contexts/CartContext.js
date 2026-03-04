import React, { createContext, useContext, useState, useCallback } from 'react';

const CartContext = createContext();

let instanceCounter = 0;
const genInstanceId = () => `inst_${++instanceCounter}_${Date.now()}`;

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  // Track the latest added food instance for extras linking
  const [lastAddedInstance, setLastAddedInstance] = useState(null);

  // Always creates a new instance (separate line in cart)
  const addItem = useCallback((menuItem) => {
    const instanceId = genInstanceId();
    setItems(prev => [...prev, { ...menuItem, instanceId, quantity: 1, notes: '', linkedExtras: [] }]);
    setLastAddedInstance(instanceId);
    return instanceId;
  }, []);

  // Increment quantity of an existing instance
  const incrementItem = useCallback((instanceId) => {
    setItems(prev => prev.map(i =>
      i.instanceId === instanceId ? { ...i, quantity: i.quantity + 1 } : i
    ));
  }, []);

  // Add an extra linked to a parent food instance
  const addExtra = useCallback((extra, parentInstanceId) => {
    const extraInstanceId = genInstanceId();
    setItems(prev => {
      // Check if this exact extra already exists for this parent
      const existing = prev.find(i => i.id === extra.id && i.parentInstanceId === parentInstanceId);
      if (existing) {
        // Increment existing extra
        return prev.map(i =>
          i.id === extra.id && i.parentInstanceId === parentInstanceId
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      }
      // Add new extra linked to parent
      const newExtra = { ...extra, instanceId: extraInstanceId, parentInstanceId, quantity: 1 };
      // Also link it in the parent's linkedExtras
      return [
        ...prev.map(i => {
          if (i.instanceId === parentInstanceId) {
            return { ...i, linkedExtras: [...(i.linkedExtras || []), { instanceId: extraInstanceId, extraId: extra.id }] };
          }
          return i;
        }),
        newExtra
      ];
    });
  }, []);

  const removeItem = useCallback((instanceId) => {
    setItems(prev => {
      const item = prev.find(i => i.instanceId === instanceId);
      if (!item) return prev;

      if (item.parentInstanceId) {
        // Removing an extra - unlink from parent
        return prev
          .filter(i => i.instanceId !== instanceId)
          .map(i => {
            if (i.instanceId === item.parentInstanceId && i.linkedExtras) {
              return { ...i, linkedExtras: i.linkedExtras.filter(e => e.instanceId !== instanceId) };
            }
            return i;
          });
      } else {
        // Removing a food item - also remove its linked extras
        const linkedIds = (item.linkedExtras || []).map(e => e.instanceId);
        return prev.filter(i => i.instanceId !== instanceId && !linkedIds.includes(i.instanceId));
      }
    });
  }, []);

  const updateQuantity = useCallback((instanceId, quantity) => {
    if (quantity <= 0) {
      removeItem(instanceId);
      return;
    }
    setItems(prev => prev.map(i =>
      i.instanceId === instanceId ? { ...i, quantity } : i
    ));
  }, [removeItem]);

  const updateNotes = useCallback((instanceId, notes) => {
    setItems(prev => prev.map(i =>
      i.instanceId === instanceId ? { ...i, notes } : i
    ));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  // Food items (no parent)
  const foodItems = items.filter(i => !i.parentInstanceId);
  // All extras
  const extraItems = items.filter(i => i.parentInstanceId);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // Get extras linked to a specific food instance
  const getLinkedExtras = useCallback((instanceId) => {
    return items.filter(i => i.parentInstanceId === instanceId);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items, foodItems, extraItems, addItem, incrementItem, addExtra,
      removeItem, updateQuantity, updateNotes, clearCart,
      totalItems, totalPrice, getLinkedExtras, lastAddedInstance
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
