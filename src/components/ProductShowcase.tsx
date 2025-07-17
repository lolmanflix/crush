import React from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useNavigate } from 'react-router-dom';
interface ProductShowcaseProps {
  title: string;
  category: 'men' | 'kids';
  reverse?: boolean;
}
export const ProductShowcase: React.FC<ProductShowcaseProps> = ({
  title,
  category,
  reverse = false
}) => {
  const { products } = useProducts();
  const navigate = useNavigate();
  // Get last 3 products for the given category, newest first
  const filtered = products.filter(p => p.category === category);
  const lastThree = filtered.slice(-3).reverse();
  return <section className="py-16 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <button onClick={() => navigate('/men')} className="flex items-center mt-4 md:mt-0 group bg-transparent border-none cursor-pointer">
            <span className="mr-2">View All</span>
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="group-hover:translate-x-1 transition-transform"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </button>
        </div>
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-8 ${reverse ? 'md:flex-row-reverse' : ''}`}> 
          {lastThree.map(product => (
            <div key={product.id} className="group cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
              <div className="overflow-hidden">
                <img src={Array.isArray(product.imageUrl) ? product.imageUrl[0] : product.imageUrl} alt={product.name} className="w-full h-[500px] object-cover object-center group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-medium">{product.name}</h3>
                <p className="text-gray-600">{product.price.toLocaleString()} EGP</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>;
};