import React, { useEffect, useState, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

export type ProductCategory = 'men' | 'kids';
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  imageUrl: string[]; // now supports multiple images
  inStock: boolean;
  quantity: number;
  sizes: { size: string; available: boolean }[];
}
interface SalesData {
  id: string;
  date: string;
  amount: number;
  productId: string;
  userId: string;
}
interface ProductContextType {
  products: Product[];
  sales: SalesData[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  getProductById: (id: string) => Product | undefined;
  addSale: (sale: Omit<SalesData, 'id'>) => Promise<void>;
  fetchSales: () => Promise<void>;
}
const ProductContext = createContext<ProductContextType | undefined>(undefined);
interface ProductProviderProps {
  children: React.ReactNode;
}
export const supabase = createClient(
  'https://phnimwrhqunvwftwxfil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmltd3JocXVudndmdHd4ZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjY5NjYsImV4cCI6MjA2NzMwMjk2Nn0.ntmicHNBYGEC0EdJnQtnCk1156EGlUrH_t2m8-LBHck'
);
export const ProductProvider: React.FC<ProductProviderProps> = ({
  children
}) => {
  const [products, setProducts] = useState<Product[]>(() => {
    // Load products from localStorage on initial render
    const savedProducts = localStorage.getItem('ra3Products');
    if (savedProducts) {
      return JSON.parse(savedProducts);
    }
    // Default sample products if none exist
    return [{
      id: '1',
      name: 'Premium Wool Coat',
      price: 1200,
      category: 'men',
      description: 'Luxurious wool coat for the modern gentleman',
      imageUrl: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3'],
      inStock: true,
      quantity: 25,
      sizes: [
        { size: 'S', available: true },
        { size: 'M', available: true },
        { size: 'L', available: false },
        { size: 'XL', available: true }
      ]
    }, {
      id: '2',
      name: 'Designer Suit',
      price: 2500,
      category: 'men',
      description: 'Elegant tailored suit for special occasions',
      imageUrl: ['https://images.unsplash.com/photo-1521341057461-6eb5f40b07ab?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3'],
      inStock: true,
      quantity: 15,
      sizes: [
        { size: 'S', available: true },
        { size: 'M', available: true },
        { size: 'L', available: true },
        { size: 'XL', available: true }
      ]
    }, {
      id: '3',
      name: 'Kids Formal Outfit',
      price: 750,
      category: 'kids',
      description: 'Adorable formal outfit for special events',
      imageUrl: ['https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3'],
      inStock: false,
      quantity: 0,
      sizes: [
        { size: 'S', available: false },
        { size: 'M', available: true },
        { size: 'L', available: false },
        { size: 'XL', available: false }
      ]
    }];
  });
  const [sales, setSales] = useState<SalesData[]>([]);

  // Fetch sales from Supabase
  const fetchSales = async () => {
    const { data, error } = await supabase.from('sales').select('*').order('date', { ascending: false });
    if (!error && data) setSales(data);
  };

  // Add a sale to Supabase
  const addSale = async (sale: Omit<SalesData, 'id'>) => {
    const { data, error } = await supabase.from('sales').insert([sale]);
    if (!error && data) fetchSales();
  };

  useEffect(() => {
    fetchSales();
  }, []);
  // Save products to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('ra3Products', JSON.stringify(products));
  }, [products]);
  // Save sales to localStorage
  useEffect(() => {
    localStorage.setItem('ra3Sales', JSON.stringify(sales));
  }, [sales]);
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: Date.now().toString()
    };
    setProducts([...products, newProduct]);
  };
  const updateProduct = (updatedProduct: Product) => {
    setProducts(products.map(product => product.id === updatedProduct.id ? updatedProduct : product));
  };
  const deleteProduct = (id: string) => {
    setProducts(products.filter(product => product.id !== id));
  };
  const getProductById = (id: string) => {
    return products.find(product => product.id === id);
  };
  return <ProductContext.Provider value={{
    products,
    sales,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    addSale,
    fetchSales
  }}>
      {children}
    </ProductContext.Provider>;
};
export const useProducts = () => {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

// Cart Context
export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  size?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  incrementQuantity: (id: string) => void;
  decrementQuantity: (id: string) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

export type CartProviderProps = { children: React.ReactNode, user?: any };

export const CartProvider: React.FC<CartProviderProps> = ({ children, user }) => {
  const userKey = user?.id || user?.email || 'guest';
  const storageKey = `cart_${userKey}`;
  const [cart, setCart] = useState<CartItem[]>(() => {
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : [];
  });

  // Save cart to the current user's key
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  // When user changes, load their cart
  useEffect(() => {
    const stored = localStorage.getItem(storageKey);
    setCart(stored ? JSON.parse(stored) : []);
  }, [storageKey]);

  const addToCart = (item: CartItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i);
      }
      return [...prev, item];
    });
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(i => i.id !== id));
  };

  const clearCart = () => setCart([]);

  const incrementQuantity = (id: string) => {
    setCart(prev => prev.map(i => i.id === id ? { ...i, quantity: i.quantity + 1 } : i));
  };
  const decrementQuantity = (id: string) => {
    setCart(prev => prev.flatMap(i => {
      if (i.id === id) {
        if (i.quantity > 1) return { ...i, quantity: i.quantity - 1 };
        // Remove item if quantity would go to 0
        return [];
      }
      return i;
    }));
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, incrementQuantity, decrementQuantity }}>
      {children}
    </CartContext.Provider>
  );
};