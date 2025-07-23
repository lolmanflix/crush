import React, { useMemo, useState } from 'react';
import { useProducts } from '../../context/ProductContext';
import { supabase } from '../../context/ProductContext';

export const SalesChart: React.FC = () => {
  const {
    orders,
    products
  } = useProducts();
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  // Process sales data for the last 30 days
  const salesData = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    // Create a map for the last 30 days
    const dateMap: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap[dateStr] = 0;
    }
    // Fill in the sales data from orders
    orders.forEach(order => {
      const orderDate = order.created_at.split('T')[0];
      if (orderDate in dateMap) {
        dateMap[orderDate] += Number(order.total);
      }
    });
    // Convert to array for display
    return Object.entries(dateMap).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [orders]);
  // Calculate total sales
  const totalSales = useMemo(() => {
    return salesData.reduce((total, day) => total + day.amount, 0);
  }, [salesData]);
  // Find the product with the most sales
  const topProduct = useMemo(() => {
    const productSales: Record<string, number> = {};
    orders.forEach(order => {
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          if (item.id && item.price && item.quantity) {
            if (productSales[item.id]) {
              productSales[item.id] += item.price * item.quantity;
            } else {
              productSales[item.id] = item.price * item.quantity;
            }
          }
        });
      }
    });
    let topProductId = '';
    let maxSales = 0;
    Object.entries(productSales).forEach(([productId, amount]) => {
      if (amount > maxSales) {
        maxSales = amount;
        topProductId = productId;
      }
    });
    const product = products.find(p => p.id === topProductId);
    return product ? {
      name: product.name,
      sales: maxSales
    } : null;
  }, [orders, products]);
  // Get max value for chart scaling
  const maxDailySales = Math.max(...salesData.map(day => day.amount));

  // Sales by day and product breakdown
  const salesByDay = useMemo(() => {
    const map: Record<string, { date: string; products: { name: string; qty: number; }[] }> = {};
    orders.forEach(order => {
      const orderDate = order.created_at.split('T')[0];
      if (!map[orderDate]) map[orderDate] = { date: orderDate, products: [] };
      if (Array.isArray(order.items)) {
        order.items.forEach((item: any) => {
          const product = products.find(p => p.id === item.id);
          if (product) {
            const existing = map[orderDate].products.find(p => p.name === product.name);
            if (existing) existing.qty += item.quantity;
            else map[orderDate].products.push({ name: product.name, qty: item.quantity });
          }
        });
      }
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [orders, products]);

  return <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Total Sales (30 days)
          </h3>
          <p className="text-2xl font-bold">
            {totalSales.toLocaleString()} EGP
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{orders.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-gray-500">Top Product</h3>
          <p className="text-2xl font-bold">{topProduct?.name || 'N/A'}</p>
          {topProduct && <p className="text-sm text-gray-500">
              {topProduct.sales.toLocaleString()} EGP
            </p>}
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Sales Last 30 Days</h3>
        <div className="h-64">
          <div className="flex h-full items-end space-x-2">
            {salesData.map((day, index) => {
              const height = maxDailySales > 0 ? day.amount / maxDailySales * 100 : 0;
              const formattedDate = new Date(day.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
              return <div key={index} className="flex-1 flex flex-col items-center group">
                <div className="relative w-full">
                  <div className="absolute bottom-0 w-full bg-black hover:bg-gray-800 transition-all duration-200 rounded-t" style={{ height: `${height}%` }}>
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
                      {day.amount.toLocaleString()} EGP
                    </div>
                  </div>
                </div>
                {index % 3 === 0 && <span className="text-xs mt-2 text-gray-500">{formattedDate}</span>}
              </div>;
            })}
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-medium mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Products</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.slice(0, 5).map((order, index) => {
                const items = Array.isArray(order.items) ? order.items : [];
                return <tr key={index}>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">{new Date(order.created_at).toLocaleDateString()}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                    {items.length > 0 ? items.map((item: any) => {
                      const product = products.find(p => p.id === item.id);
                      return product ? `${product.name} (x${item.quantity})` : 'Unknown Product';
                    }).join(', ') : 'No products'}
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">{order.total.toLocaleString()} EGP</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">{order.status}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-right">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-semibold" onClick={() => setSelectedOrder(order)}>
                      Update Status
                    </button>
                  </td>
                </tr>;
              })}
            </tbody>
          </table>
        </div>
        {/* Modal or section for order details and update */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-600" onClick={() => setSelectedOrder(null)}>&times;</button>
              <h4 className="text-lg font-bold mb-2">Order Details</h4>
              <div className="mb-2 text-sm text-gray-700">
                <strong>Products:</strong> {Array.isArray(selectedOrder.items) ? selectedOrder.items.map((item: any) => {
                  const product = products.find(p => p.id === item.id);
                  return product ? `${product.name} (x${item.quantity})` : 'Unknown Product';
                }).join(', ') : 'No products'}
              </div>
              <div className="mb-2 text-sm text-gray-700">
                <strong>Total:</strong> {selectedOrder.total} EGP
              </div>
              <div className="mb-2 text-sm text-gray-700">
                <strong>Status:</strong> {selectedOrder.status}
              </div>
              {/* Show user address and number if available */}
              <div className="mb-2 text-sm text-gray-700">
                <strong>Address:</strong> {selectedOrder.address || selectedOrder.user?.address ? (selectedOrder.address || selectedOrder.user?.address) : <span className="text-red-500">Not provided</span>}
              </div>
              <div className="mb-2 text-sm text-gray-700">
                <strong>Phone:</strong> {selectedOrder.phone || selectedOrder.user?.phone ? (selectedOrder.phone || selectedOrder.user?.phone) : <span className="text-red-500">Not provided</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold" onClick={async () => {
                  // Update order status to 'on_delivery' using Supabase client
                  await supabase.from('orders').update({ status: 'on_delivery' }).eq('id', selectedOrder.id);
                  setSelectedOrder(null);
                  window.location.reload();
                }}>
                  Mark as On Delivery
                </button>
                <button className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded font-semibold" onClick={() => setSelectedOrder(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>;
};