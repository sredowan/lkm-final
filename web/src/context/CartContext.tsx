'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
    id: string;
    name: string;
    price: number;
    image?: string;
    quantity: number;
};

interface CartContextType {
    items: CartItem[];
    addItem: (item: Omit<CartItem, 'quantity'>) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    total: number;
    cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from local storage
    useEffect(() => {
        const savedCart = localStorage.getItem('lkm-cart');
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                // Normalize IDs to strings and prices to numbers when loading
                // Also deduplicate by using a Map with string IDs as keys
                const itemsMap = new Map<string, CartItem>();
                parsed.forEach((item: any) => {
                    const normalizedId = String(item.id);
                    const normalizedPrice = typeof item.price === 'string' ? parseFloat(item.price) : Number(item.price);

                    if (itemsMap.has(normalizedId)) {
                        // Merge quantities for duplicate IDs
                        const existing = itemsMap.get(normalizedId)!;
                        itemsMap.set(normalizedId, {
                            ...existing,
                            quantity: existing.quantity + (item.quantity || 1)
                        });
                    } else {
                        itemsMap.set(normalizedId, {
                            ...item,
                            id: normalizedId,
                            price: normalizedPrice,
                            quantity: item.quantity || 1
                        });
                    }
                });
                setItems(Array.from(itemsMap.values()));
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }
        setIsLoaded(true);
    }, []);

    // Save to local storage
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('lkm-cart', JSON.stringify(items));
        }
    }, [items, isLoaded]);

    const addItem = (newItem: Omit<CartItem, 'quantity'>) => {
        // Normalize ID to string and price to number
        const normalizedId = String(newItem.id);
        const normalizedPrice = typeof newItem.price === 'string' ? parseFloat(newItem.price as unknown as string) : Number(newItem.price);

        const normalizedItem = {
            ...newItem,
            id: normalizedId,
            price: normalizedPrice
        };

        setItems((currentItems) => {
            const existingItem = currentItems.find((item) => item.id === normalizedId);
            if (existingItem) {
                return currentItems.map((item) =>
                    item.id === normalizedId
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            }
            return [...currentItems, { ...normalizedItem, quantity: 1 }];
        });
    };

    const removeItem = (id: string) => {
        setItems((currentItems) => currentItems.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) return;
        setItems((currentItems) =>
            currentItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                total,
                cartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
