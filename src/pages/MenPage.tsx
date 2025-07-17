import React from 'react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
import { ShoppingBagIcon } from 'lucide-react';
import { Header } from '../components/Header';

const MenPage: React.FC = () => {
  const { products } = useProducts();
  const menProducts = products.filter(p => p.category === 'men');
  const navigate = useNavigate();

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 px-2 sm:px-6 lg:px-8">
        {menProducts.length === 0 ? (
          <div className="text-center text-gray-500">No men's products found.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {menProducts.map(product => {
              const images = Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : []);
              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <div className="flex-1 flex flex-col">
                    {images.length > 0 && (
                      <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                        <img src={images[0]} alt={product.name} className="object-cover w-full h-full" onError={e => {
                          (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                        }} />
                      </div>
                    )}
                    <div className="p-4 flex-1 flex flex-col">
                      <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{product.name}</h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">{product.description}</p>
                      <span className="font-bold text-blue-600 text-lg mb-2">{product.price} EGP</span>
                      <div className="flex flex-wrap gap-2 mt-auto">
                        {images.length > 1 && images.slice(1).map((img, idx) => (
                          <img key={idx} src={img} alt={product.name + ' extra'} className="w-12 h-12 object-cover rounded border" onError={e => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/50x50?text=No+Image';
                          }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default MenPage; 