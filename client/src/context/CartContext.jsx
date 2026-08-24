import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  clampQuantity,
  computeSubtotal,
  createLineId,
  sameModifierSelection,
  sanitizeNotes,
} from '../utils/cartPricing';
import { clearCartStorage, getCart, setCart } from '../utils/storage';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => getCart());

  useEffect(() => {
    setCart(items);
  }, [items]);

  const addItem = useCallback(
    ({ product, selectedModifiers = [], quantity = 1, notes = '' }) => {
      if (!product?.id) {
        throw new Error('Product is required');
      }
      if (product.isCurrentlyAvailable === false) {
        throw new Error('This product is currently unavailable');
      }

      const qty = clampQuantity(quantity);
      const modifiers = selectedModifiers || [];
      const safeNotes = sanitizeNotes(notes);

      setItems((prev) => {
        const existingIndex = prev.findIndex(
          (item) =>
            item.productId === product.id &&
            sameModifierSelection(item.selectedModifiers, modifiers)
        );

        if (existingIndex >= 0) {
          const next = [...prev];
          const existing = next[existingIndex];
          next[existingIndex] = {
            ...existing,
            quantity: clampQuantity(existing.quantity + qty),
            notes: safeNotes || existing.notes,
          };
          return next;
        }

        return [
          ...prev,
          {
            lineId: createLineId(),
            productId: product.id,
            name: product.name,
            productType: product.productType,
            basePrice: product.basePrice,
            quantity: qty,
            selectedModifiers: modifiers,
            notes: safeNotes,
          },
        ];
      });
    },
    []
  );

  const updateQuantity = useCallback((lineId, quantity) => {
    setItems((prev) =>
      prev.map((item) =>
        item.lineId === lineId
          ? { ...item, quantity: clampQuantity(quantity) }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((lineId) => {
    setItems((prev) => prev.filter((item) => item.lineId !== lineId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    clearCartStorage();
  }, []);

  const value = useMemo(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = computeSubtotal(items);

    return {
      items,
      itemCount,
      subtotal,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    };
  }, [items, addItem, updateQuantity, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCartContext must be used within CartProvider');
  }
  return context;
}

export default CartContext;
