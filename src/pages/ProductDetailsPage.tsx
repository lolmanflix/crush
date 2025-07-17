import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useProducts, useCart } from '../context/ProductContext';
import { ShoppingBagIcon } from 'lucide-react';

const ProductDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { products } = useProducts();
  const navigate = useNavigate();
  const product = products.find(p => p.id === id);
  const { addToCart } = useCart();
  const [addedMsg, setAddedMsg] = React.useState('');
  const [selectedSize, setSelectedSize] = React.useState<string | null>(null);

  if (!product) {
    return <div className="pt-24 text-center text-gray-500">Product not found.</div>;
  }

  const images = Array.isArray(product.imageUrl) ? product.imageUrl : (product.imageUrl ? [product.imageUrl] : []);
  const [mainImage, setMainImage] = React.useState(images[0]);

  React.useEffect(() => {
    setMainImage(images[0]);
  }, [product.id]);

  // You May Also Like logic: up to 3 products from the same category, excluding current
  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-0 px-2 sm:px-6 lg:px-8">
      {/* Floating Cart Button */}
      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center transition-all animate-bounce"
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        onClick={() => navigate('/cart')}
        aria-label="Go to cart"
      >
        <ShoppingBagIcon size={28} />
      </button>
      {/* Announcement Bar */}
      <style>{`
        .marquee {
          display: flex;
          align-items: center;
          width: 100vw;
          overflow: hidden;
          white-space: nowrap;
          position: relative;
          height: 40px;
        }
        .marquee__inner {
          display: inline-block;
          padding-left: 100vw;
          animation: marquee-scroll 18s linear infinite;
        }
        @keyframes marquee-scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-100%); }
        }
      `}</style>
      <div className="w-full bg-black text-white text-sm font-semibold flex items-center h-10 relative marquee">
        <div className="marquee__inner">
          <span className="mx-8 inline-block">صنع في مصر 🇪🇬</span>
          <span className="mx-8 inline-block">توصيل مجاني للطلبات فوق ٣٠٠ جنيه 🚚</span>
          <span className="mx-8 inline-block">تشكيلة الشتاء متاحة الآن ❄️</span>
          <span className="mx-8 inline-block">صنع في مصر 🇪🇬</span>
          <span className="mx-8 inline-block">توصيل مجاني للطلبات فوق ٣٠٠ جنيه 🚚</span>
          <span className="mx-8 inline-block">تشكيلة الشتاء متاحة الآن ❄️</span>
        </div>
      </div>
      {/* Back Button */}
      <div className="max-w-5xl mx-auto flex items-center pt-24 pb-4">
        <button
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-black dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white transition shadow mr-4"
          onClick={() => navigate('/men')}
        >
          &larr; Back
        </button>
      </div>
      <div className="max-w-5xl mx-auto bg-gray-800 rounded-xl shadow-lg p-8 flex flex-col md:flex-row gap-8">
        <div className="flex-1 flex flex-col items-center">
          <img
            src={mainImage}
            alt={product.name}
            className="w-full max-w-md aspect-square object-cover rounded-lg mb-4"
            onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/500x500?text=No+Image';
            }}
          />
          <div className="flex gap-2 mt-2">
            {images.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt={`Thumbnail ${idx + 1}`}
                className={`h-16 w-16 object-cover rounded border-2 cursor-pointer ${mainImage === img ? 'border-blue-500' : 'border-transparent'}`}
                onClick={() => setMainImage(img)}
                onError={e => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/100x100?text=No+Image';
                }}
              />
            ))}
          </div>
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2 text-black dark:text-white">{product.name}</h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4">{product.description}</p>
            <span className="font-bold text-blue-600 text-2xl mb-4 block">{product.price} EGP</span>
            {/* Size Selector */}
            <div className="mb-4">
              <div className="font-semibold text-gray-700 dark:text-gray-200 mb-2">Select Size:</div>
              <div className="flex gap-2 flex-wrap">
                {product.sizes && product.sizes.length > 0 ? product.sizes.map(sz => (
                  <button
                    key={sz.size}
                    disabled={!sz.available}
                    className={`px-4 py-2 rounded border text-sm font-semibold transition ${selectedSize === sz.size ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300'} ${!sz.available ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}`}
                    onClick={() => sz.available && setSelectedSize(sz.size)}
                    type="button"
                  >
                    {sz.size}
                  </button>
                )) : <span className="text-gray-400">No sizes available</span>}
              </div>
              {!selectedSize && <div className="text-xs text-red-500 mt-1">Please select a size.</div>}
            </div>
          </div>
          <button
            className="mt-8 w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:opacity-60 disabled:cursor-not-allowed"
            onClick={() => {
              if (!selectedSize) return;
              addToCart({
                id: product.id + '-' + selectedSize,
                name: product.name,
                price: product.price,
                image: images[0],
                quantity: 1,
                size: selectedSize
              });
              setAddedMsg('Added to cart!');
              setTimeout(() => setAddedMsg(''), 1500);
            }}
            disabled={!selectedSize}
          >
            Add to Cart
          </button>
          {addedMsg && <div className="text-green-600 dark:text-green-400 mt-2 text-center">{addedMsg}</div>}
        </div>
      </div>
      {/* You May Also Like Section */}
      <div className="max-w-5xl mx-auto mt-16">
        <h2 className="text-xl font-bold mb-6 text-black dark:text-white">You May Also Like</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
          {relatedProducts.length === 0 ? (
            <div className="text-gray-500 flex items-center justify-center min-w-[250px]">No related products found.</div>
          ) : (
            relatedProducts.map(rp => {
              const rpImages = Array.isArray(rp.imageUrl) ? rp.imageUrl : (rp.imageUrl ? [rp.imageUrl] : []);
              return (
                <div
                  key={rp.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col cursor-pointer min-w-[250px] max-w-[250px]"
                  onClick={() => navigate(`/product/${rp.id}`)}
                >
                  {rpImages.length > 0 && (
                    <div className="w-full aspect-square bg-gray-100 flex items-center justify-center overflow-hidden">
                      <img src={rpImages[0]} alt={rp.name} className="object-cover w-full h-full" onError={e => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x300?text=No+Image';
                      }} />
                    </div>
                  )}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold text-black dark:text-white mb-2">{rp.name}</h3>
                    <span className="font-bold text-blue-600 text-lg mb-2">{rp.price} EGP</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsPage; 