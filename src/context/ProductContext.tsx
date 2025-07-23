import React, { useEffect, useState, createContext, useContext } from 'react';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://phnimwrhqunvwftwxfil.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobmltd3JocXVudndmdHd4ZmlsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MjY5NjYsImV4cCI6MjA2NzMwMjk2Nn0.ntmicHNBYGEC0EdJnQtnCk1156EGlUrH_t2m8-LBHck'
);

export type ProductCategory = 'men' | 'kids';
export interface Product {
  id: string;
  name: string;
  price: number;
  category: ProductCategory;
  description: string;
  imageUrl: string[]; // now array for jsonb
  quantity: number; // maps to stock_quantity
  size: string; // maps to size column
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
  deleteProduct: (id: string, category: ProductCategory) => void;
  getProductById: (id: string) => Product | undefined;
  addSale: (sale: Omit<SalesData, 'id'>) => Promise<void>;
  fetchSales: () => Promise<void>;
}
const ProductContext = createContext<ProductContextType | undefined>(undefined);
interface ProductProviderProps {
  children: React.ReactNode;
}
export const ProductProvider: React.FC<ProductProviderProps> = ({
  children
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<SalesData[]>([]);

  // Fetch products from men_products and kids_products
  const fetchProducts = async () => {
    const { data: men, error: menError } = await supabase.from('men_products').select('*');
    const { data: kids, error: kidsError } = await supabase.from('kids_products').select('*');
    if (!menError && !kidsError) {
      const menWithCategory = (men || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        category: 'men' as ProductCategory,
        description: p.description,
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : (p.imageUrl ? [p.imageUrl] : []),
        quantity: p.stock_quantity,
        size: p.size
      }));
      const kidsWithCategory = (kids || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        category: 'kids' as ProductCategory,
        description: p.description,
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : (p.imageUrl ? [p.imageUrl] : []),
        quantity: p.stock_quantity,
        size: p.size
      }));
      setProducts([...menWithCategory, ...kidsWithCategory]);
    }
  };

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
    fetchProducts();
    fetchSales();
  }, []);

  // Add product to the correct table
  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const dbProduct = {
        name: product.name,
        price: product.price,
        category: product.category,
        description: product.description,
        imageUrl: product.imageUrl,
        stock_quantity: product.quantity,
        size: product.size
      };
      if (product.category === 'men') {
        await supabase.from('men_products').insert([dbProduct]);
      } else if (product.category === 'kids') {
        await supabase.from('kids_products').insert([dbProduct]);
      }
      fetchProducts();
    } catch (error) {
      console.error('Add product error:', error);
    }
  };
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const table = updatedProduct.category === 'men' ? 'men_products' : 'kids_products';
      const dbProduct = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        description: updatedProduct.description,
        imageUrl: updatedProduct.imageUrl,
        stock_quantity: updatedProduct.quantity,
        size: updatedProduct.size
      };
      const { error } = await supabase.from(table).update(dbProduct).eq('id', updatedProduct.id);
      if (error) {
        console.error('Update product error:', error);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Update product exception:', error);
    }
  };
  const deleteProduct = async (id: string, category: ProductCategory) => {
    try {
      const table = category === 'men' ? 'men_products' : 'kids_products';
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) {
        console.error('Delete product error:', error);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Delete product exception:', error);
    }
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