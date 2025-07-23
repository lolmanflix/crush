import React, { useEffect, useState } from 'react';
import { supabase } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/Header';

const TrackOrderPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [guestEmail, setGuestEmail] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [guestOrder, setGuestOrder] = useState<any | null>(null);
  const [guestError, setGuestError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
      if (data.user) {
        // Fetch orders for this user
        const { data: ordersData } = await supabase.from('orders').select('*').eq('user_id', data.user.id).order('created_at', { ascending: false });
        setOrders(ordersData || []);
      }
      setLoading(false);
    };
    getUser();
  }, []);

  const handleGuestTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuestError('');
    setGuestOrder(null);
    if (!guestEmail.trim() || !orderNumber.trim()) {
      setGuestError('Please enter both email and order number.');
      return;
    }
    const { data: order } = await supabase.from('orders').select('*').eq('user_email', guestEmail).eq('id', orderNumber).single();
    if (order) {
      setGuestOrder(order);
    } else {
      setGuestError('Order not found. Please check your info.');
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-2 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">Track Your Order</h2>
        {loading ? (
          <div className="text-center text-gray-500">Loading...</div>
        ) : user ? (
          orders.length === 0 ? (
            <div className="text-center text-gray-500">You have no orders yet.</div>
          ) : (
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map(order => (
                    <tr key={order.id}>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-white">
                        {Array.isArray(order.items) ? order.items.map((item: any) => item.name ? `${item.name} (x${item.quantity})` : `Product ${item.id} (x${item.quantity})`).join(', ') : 'No products'}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-white">{order.total.toLocaleString()} EGP</td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-white">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow p-8">
            <h3 className="text-lg font-bold mb-4 text-black dark:text-white">Track as Guest</h3>
            <form onSubmit={handleGuestTrack} className="space-y-4">
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Email</label>
                <input type="email" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" value={guestEmail} onChange={e => setGuestEmail(e.target.value)} required />
              </div>
              <div>
                <label className="block text-gray-700 dark:text-gray-200 mb-1">Order Number</label>
                <input type="text" className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-black dark:text-white" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition">Track Order</button>
              {guestError && <div className="text-center mt-2 text-red-600 dark:text-red-400">{guestError}</div>}
            </form>
            {guestOrder && (
              <div className="mt-6">
                <h4 className="font-bold mb-2">Order Details</h4>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                  <strong>Date:</strong> {new Date(guestOrder.created_at).toLocaleDateString()}
                </div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                  <strong>Products:</strong> {Array.isArray(guestOrder.items) ? guestOrder.items.map((item: any) => item.name ? `${item.name} (x${item.quantity})` : `Product ${item.id} (x${item.quantity})`).join(', ') : 'No products'}
                </div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                  <strong>Total:</strong> {guestOrder.total} EGP
                </div>
                <div className="mb-2 text-sm text-gray-700 dark:text-gray-200">
                  <strong>Status:</strong> {guestOrder.status}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TrackOrderPage; 