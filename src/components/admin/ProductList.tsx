import React from 'react';
import { useProducts } from '../../context/ProductContext';
import { PencilIcon, TrashIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
interface ProductListProps {
  onEditProduct: (id: string) => void;
}
export const ProductList: React.FC<ProductListProps> = ({
  onEditProduct
}) => {
  const {
    products,
    deleteProduct
  } = useProducts();
  const navigate = useNavigate();
  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProduct(id);
    }
  };
  return <div>
      {products.length === 0 ? <div className="text-center py-8">
          <p className="text-gray-500">
            No products found. Add your first product!
          </p>
        </div> : <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Price
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Stock Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map(product => <tr key={product.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        {Array.isArray(product.imageUrl) && product.imageUrl.length > 0 ? (
                          <img
                            className="h-10 w-10 object-cover"
                            src={product.imageUrl[0]}
                            alt={product.name}
                            onError={e => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        ) : (
                          <img
                            className="h-10 w-10 object-cover"
                            src={typeof product.imageUrl === 'string' && product.imageUrl ? product.imageUrl : 'https://via.placeholder.com/150?text=No+Image'}
                            alt={product.name}
                            onError={e => {
                              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image';
                            }}
                          />
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {product.name}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-xs">
                          {product.description}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {product.category === 'men' ? 'Men' : 'Kids'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.price.toFixed(2)} EGP
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {product.inStock ? <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        In Stock
                      </span> : <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        Out of Stock
                      </span>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={e => { e.stopPropagation(); onEditProduct(product.id); }}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      <PencilIcon size={16} />
                    </button>
                    <button
                      onClick={e => { e.stopPropagation(); handleDelete(product.id); }}
                      className="text-red-600 hover:text-red-900"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </td>
                </tr>)}
            </tbody>
          </table>
        </div>}
    </div>;
};