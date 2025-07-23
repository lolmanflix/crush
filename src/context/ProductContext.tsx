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
  // sales: SalesData[]; // Remove old sales
  orders: any[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (id: string, category: ProductCategory) => void;
  getProductById: (id: string) => Product | undefined;
  // addSale: (sale: Omit<SalesData, 'id'>) => Promise<void>; // Remove old sales
  // fetchSales: () => Promise<void>; // Remove old sales
}
const ProductContext = createContext<ProductContextType | undefined>(undefined);
interface ProductProviderProps {
  children: React.ReactNode;
}
export const ProductProvider: React.FC<ProductProviderProps> = ({
  children
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  // const [sales, setSales] = useState<SalesData[]>([]); // Remove old sales
  const [orders, setOrders] = useState<any[]>([]);

  // Fetch products from men_products only
  const fetchProducts = async () => {
    const { data: men, error: menError } = await supabase.from('men_products').select('*');
    if (!menError) {
      const menWithCategory = (men || []).map(p => ({
        id: p.id.toString(),
        name: p.name,
        price: p.price,
        category: p.category, // <-- read from DB
        description: p.description,
        imageUrl: Array.isArray(p.imageUrl) ? p.imageUrl : (p.imageUrl ? [p.imageUrl] : []),
        quantity: p.stock_quantity,
        size: Array.isArray(p.size) ? p.size : (p.size ? [p.size] : [])
      }));
      setProducts(menWithCategory);
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

  // Fetch orders from Supabase
  const fetchOrders = async () => {
    const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (!error && data) setOrders(data);
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  // Add product to men_products only
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
      await supabase.from('men_products').insert([dbProduct]);
      fetchProducts();
    } catch (error) {
      console.error('Add product error:', error);
    }
  };
  // Update product in men_products only
  const updateProduct = async (updatedProduct: Product) => {
    try {
      const dbProduct = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        description: updatedProduct.description,
        imageUrl: updatedProduct.imageUrl,
        stock_quantity: updatedProduct.quantity,
        size: updatedProduct.size
      };
      const { error } = await supabase.from('men_products').update(dbProduct).eq('id', updatedProduct.id);
      if (error) {
        console.error('Update product error:', error);
      } else {
        fetchProducts();
      }
    } catch (error) {
      console.error('Update product exception:', error);
    }
  };
  // Delete product in men_products only
  const deleteProduct = async (id: string, category: ProductCategory) => {
    try {
      const { error } = await supabase.from('men_products').delete().eq('id', id);
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
    orders,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById
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

  // Merge logic
  function mergeCarts(localCart: CartItem[], cloudCart: CartItem[]): CartItem[] {
    const merged = [...localCart];
    cloudCart.forEach(cloudItem => {
      const idx = merged.findIndex(
        i => i.id === cloudItem.id && i.size === cloudItem.size
      );
      if (idx > -1) {
        merged[idx].quantity += cloudItem.quantity;
      } else {
        merged.push(cloudItem);
      }
    });
    return merged;
  }

  // Save cart to Supabase cloud
  const saveCartToCloud = async (cart: CartItem[], userId: string) => {
    if (!userId) return;
    await supabase
      .from('carts')
      .upsert([{ user_id: userId, items: cart, updated_at: new Date().toISOString() }], { onConflict: 'user_id' });
  };

  // On login, load and merge cloud cart
  useEffect(() => {
    const loadAndMergeCart = async () => {
      if (!user?.id) return;
      const { data } = await supabase.from('carts').select('items').eq('user_id', user.id).single();
      const cloudCart = data?.items || [];
      const localCart = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const merged = mergeCarts(localCart, cloudCart);
      setCart(merged);
      localStorage.setItem(storageKey, JSON.stringify(merged));
      await saveCartToCloud(merged, user.id);
    };
    loadAndMergeCart();
    // eslint-disable-next-line
  }, [user?.id]);

  // Save cart to the current user's key
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
    if (user?.id) saveCartToCloud(cart, user.id);
  }, [cart, storageKey, user?.id]);

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