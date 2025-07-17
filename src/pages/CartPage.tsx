import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart, useProducts } from '../context/ProductContext';
import { Header } from '../components/Header';
import { Trash2, Plus, Minus } from 'lucide-react';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, removeFromCart, clearCart, incrementQuantity, decrementQuantity } = useCart();
  const { products } = useProducts();
  const isEmpty = cart.length === 0;

  // You May Also Like: 3 random products not in cart
  const cartIds = cart.map(item => item.id);
  const youMayAlsoLike = products.filter(p => !cartIds.includes(p.id)).sort(() => 0.5 - Math.random()).slice(0, 3);

  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900 pt-24 px-2 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl flex flex-col lg:flex-row gap-8 justify-center items-start">
          {/* Merged Cart + Order Summary Section */}
          <div className="w-full lg:flex-1 bg-gray-800 shadow-lg rounded-xl p-6 flex flex-col items-center min-w-[340px] max-w-xl mx-auto relative">
            {/* Banner/Illustration (always show, smaller on mobile) */}
            <div className="flex w-full justify-center mb-6">
              <img src='https://images.unsplash.com/photo-1515168833906-d2a3b82b302b?auto=format&fit=crop&w=400&q=80' alt="Shopping Cart Banner" className="h-20 lg:h-32 object-contain rounded" />
            </div>
            <h2 className="text-3xl font-bold mb-4 text-center text-white">Your Shopping Cart</h2>
            {/* Motivational message (always show, compact on mobile) */}
            <div className="w-full mb-4">
              <div className="bg-blue-900/80 text-blue-200 rounded-lg px-3 py-2 text-center text-base lg:text-lg font-medium">
                {cart.reduce((sum, item) => sum + item.price * item.quantity, 0) < 300
                  ? `You're only ${300 - cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} EGP away from free shipping!`
                  : 'You qualify for free shipping!'}
              </div>
            </div>
            {/* Cart Items */}
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-12">
                <svg width="120" height="120" viewBox="0 0 96 96" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
                  <rect x="16" y="32" width="64" height="32" rx="12" fill="#23272F" stroke="#4B5563" strokeWidth="4"/>
                  <rect x="24" y="40" width="48" height="16" rx="6" fill="#fff" stroke="#4B5563" strokeWidth="2"/>
                  <circle cx="32" cy="72" r="8" fill="#fff" stroke="#4B5563" strokeWidth="4"/>
                  <circle cx="64" cy="72" r="8" fill="#fff" stroke="#4B5563" strokeWidth="4"/>
                  <path d="M16 32L12 16H20" stroke="#4B5563" strokeWidth="4" strokeLinecap="round"/>
                </svg>
                <div className="text-gray-400 text-lg mb-6 text-center">Your cart is empty.</div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow"
                  onClick={() => navigate('/men')}
                >
                  Shop Now
                </button>
              </div>
            ) : (
              <>
                <ul className="divide-y divide-gray-700 mb-4 w-full">
                  {cart.map(item => (
                    <li key={item.id} className="flex items-center justify-between py-4">
                      <div className="flex items-center gap-4">
                        {item.image && <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />}
                        <div>
                          <div className="font-semibold text-white">{item.name}</div>
                          {item.size && (
                            <div className="text-xs text-gray-400 mb-1">Size: <span className="font-semibold text-gray-200">{item.size}</span></div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                              onClick={() => decrementQuantity(item.id)}
                              aria-label="Decrease quantity"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="text-white font-semibold px-2 min-w-[24px] text-center">{item.quantity}</span>
                            <button
                              className="bg-gray-700 hover:bg-gray-600 text-white rounded-full w-7 h-7 flex items-center justify-center"
                              onClick={() => incrementQuantity(item.id)}
                              aria-label="Increase quantity"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-blue-400 whitespace-nowrap">{item.price * item.quantity} EGP</span>
                        <button
                          className="ml-2 text-red-400 hover:text-red-600 p-1 rounded-full"
                          onClick={() => removeFromCart(item.id)}
                          aria-label="Remove item"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
                {/* Order Summary (merged, always shown) */}
                <div className="w-full flex flex-col gap-4 bg-gray-900 rounded-xl shadow-inner p-4 mt-2">
                  <h3 className="text-lg font-bold text-white mb-1">Order Summary</h3>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Items:</span>
                    <span>{cart.length}</span>
                  </div>
                  <div className="flex justify-between text-gray-300 text-sm">
                    <span>Estimated Delivery:</span>
                    <span>2-4 days</span>
                  </div>
                  <form className="flex flex-col gap-2 mt-2">
                    <label htmlFor="promo" className="text-gray-400 text-xs">Promo Code</label>
                    <div className="flex gap-2">
                      <input id="promo" type="text" placeholder="Enter code" className="flex-1 px-2 py-1 rounded border border-gray-600 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                      <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded font-semibold text-sm">Apply</button>
                    </div>
                  </form>
                  <div className="flex flex-col gap-1 mt-2">
                    <span className="text-gray-400 text-xs mb-1">We accept:</span>
                    <div className="flex gap-2 items-center">
                      <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-4 lg:h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-4 lg:h-6" />
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4 lg:h-6" />
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <svg className="h-4 w-4 lg:h-5 lg:w-5 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      <span className="text-green-400 text-xs lg:text-sm">Secure Checkout</span>
                    </div>
                  </div>
                  {/* Total and Proceed to Pay at the end */}
                  <div className="flex flex-col sm:flex-row justify-between items-center mt-4 w-full gap-4">
                    <span className="font-bold text-2xl text-white">
                      Total: {cart.reduce((sum, item) => sum + item.price * item.quantity, 0)} EGP
                    </span>
                    <button
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-lg transition shadow"
                      onClick={() => alert('Proceed to payment (integration coming soon!)')}
                    >
                      Proceed to Pay
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
          {/* You May Also Like Section */}
          <div className="w-full lg:w-[400px] flex-shrink-0">
            <h2 className="text-xl font-bold mb-6 text-white">You May Also Like</h2>
            <div className="flex flex-row gap-4 overflow-x-auto pb-2 -mx-2 px-2 lg:flex-col lg:gap-6 lg:overflow-x-visible lg:h-[650px] lg:overflow-y-auto lg:bg-gray-800 lg:rounded-xl lg:p-4">
              {youMayAlsoLike.length === 0 ? (
                <div className="text-gray-400 flex items-center justify-center">No suggestions found.</div>
              ) : (
                youMayAlsoLike.map(product => {
                  const images = Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : []);
                  return (
                    <div
                      key={product.id}
                      className="bg-gray-800 rounded-lg shadow hover:shadow-xl transition overflow-hidden flex flex-col cursor-pointer border border-gray-700 hover:border-blue-500 min-w-[200px] max-w-[220px] w-full flex-shrink-0 lg:min-w-0 lg:max-w-full lg:w-full"
                      onClick={() => navigate(`/product/${product.id}`)}
                    >
                      {images.length > 0 && (
                        <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                          <img src={images[0]} alt={product.name} className="object-cover w-full h-full" onError={e => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                          }} />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <h3 className="text-lg font-semibold text-white mb-2">{product.name}</h3>
                        <span className="font-bold text-blue-400 text-lg mb-2">{product.price} EGP</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default CartPage; 