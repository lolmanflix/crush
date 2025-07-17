import React, { useMemo } from 'react';
import { useProducts } from '../../context/ProductContext';
export const SalesChart: React.FC = () => {
  const {
    sales,
    products
  } = useProducts();
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
    // Fill in the sales data
    sales.forEach(sale => {
      const saleDate = sale.date;
      if (saleDate in dateMap) {
        dateMap[saleDate] += sale.amount;
      }
    });
    // Convert to array for display
    return Object.entries(dateMap).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, amount]) => ({
      date,
      amount
    }));
  }, [sales]);
  // Calculate total sales
  const totalSales = useMemo(() => {
    return salesData.reduce((total, day) => total + day.amount, 0);
  }, [salesData]);
  // Find the product with the most sales
  const topProduct = useMemo(() => {
    const productSales: Record<string, number> = {};
    sales.forEach(sale => {
      if (productSales[sale.productId]) {
        productSales[sale.productId] += sale.amount;
      } else {
        productSales[sale.productId] = sale.amount;
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
  }, [sales, products]);
  // Get max value for chart scaling
  const maxDailySales = Math.max(...salesData.map(day => day.amount));
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
          <p className="text-2xl font-bold">{sales.length}</p>
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
                    <div className="absolute bottom-0 w-full bg-black hover:bg-gray-800 transition-all duration-200 rounded-t" style={{
                  height: `${height}%`
                }}>
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs rounded px-2 py-1">
                        {day.amount.toLocaleString()} EGP
                      </div>
                    </div>
                  </div>
                  {index % 3 === 0 && <span className="text-xs mt-2 text-gray-500">
                      {formattedDate}
                    </span>}
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
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {sales.slice(0, 5).map((sale, index) => {
              const product = products.find(p => p.id === sale.productId);
              return <tr key={index}>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-500">
                      {new Date(sale.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                      {product?.name || 'Unknown Product'}
                    </td>
                    <td className="px-4 py-2 whitespace-nowrap text-sm text-right text-gray-900">
                      {sale.amount.toLocaleString()} EGP
                    </td>
                  </tr>;
            })}
            </tbody>
          </table>
        </div>
      </div>
    </div>;
};