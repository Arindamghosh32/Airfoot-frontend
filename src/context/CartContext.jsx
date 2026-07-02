import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const [items, setItems]   = useState(() => {
    try { return JSON.parse(localStorage.getItem('airfoot_cart') || '[]'); } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('airfoot_cart', JSON.stringify(items));
  }, [items]);

  const addItem = (product, selectedSize) => {
    setItems((prev) => {
      if (prev.find((i) => i._id === product._id)) return prev;
      return [...prev, { ...product, selectedSize }];
    });
    setIsOpen(true);
  };

  const removeItem = (productId) =>
    setItems((prev) => prev.filter((i) => i._id !== productId));

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.price, 0);
  const count = items.length;

  return (
    <CartContext.Provider value={{
      items, total, count, isOpen,
      addItem, removeItem, clearCart,
      openCart:  () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);