import React, { useState } from 'react';
import { useProducts } from '../context/ProductContext';
import { ProductForm } from '../components/admin/ProductForm';
import { ProductList } from '../components/admin/ProductList';
import { SalesChart } from '../components/admin/SalesChart';
import { ArrowLeftIcon, LayoutGridIcon, BarChartIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminPage = () => {
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'sales'>('products');
  const {
    getProductById
  } = useProducts();
  const productToEdit = editingProductId ? getProductById(editingProductId) : undefined;
  const navigate = useNavigate();
  return <div className="min-h-screen bg-gray-50 pt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-gray-600">Manage your products and view sales</p>
          </div>
          <button
            className="flex items-center text-gray-700 hover:text-black bg-gray-200 dark:bg-gray-700 px-3 py-1 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition"
            onClick={() => navigate(-1)}
          >
            <ArrowLeftIcon size={16} className="mr-2" />
            Back
          </button>
        </div>
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex">
              <button onClick={() => setActiveTab('products')} className={`py-4 px-6 flex items-center border-b-2 font-medium text-sm ${activeTab === 'products' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <LayoutGridIcon size={16} className="mr-2" />
                Products
              </button>
              <button onClick={() => setActiveTab('sales')} className={`py-4 px-6 flex items-center border-b-2 font-medium text-sm ${activeTab === 'sales' ? 'border-black text-black' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>
                <BarChartIcon size={16} className="mr-2" />
                Sales
              </button>
            </nav>
          </div>
        </div>
        {activeTab === 'products' ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">
                  {editingProductId ? 'Edit Product' : 'Add New Product'}
                </h2>
                <ProductForm product={productToEdit} onComplete={() => setEditingProductId(null)} />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-bold mb-4">Product Inventory</h2>
                <ProductList onEditProduct={setEditingProductId} />
              </div>
            </div>
          </div> : <div>
            <SalesChart />
          </div>}
      </div>
    </div>;
};