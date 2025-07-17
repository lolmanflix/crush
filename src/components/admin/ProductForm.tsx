import React, { useEffect, useState } from 'react';
import { useProducts, Product, ProductCategory, supabase } from '../../context/ProductContext';
interface ProductFormProps {
  product?: Product;
  onComplete: () => void;
}
export const ProductForm: React.FC<ProductFormProps> = ({
  product,
  onComplete
}) => {
  const {
    addProduct,
    updateProduct
  } = useProducts();
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    category: 'men' as ProductCategory,
    description: '',
    imageFiles: [] as File[],
    imagePreviews: [] as string[],
    inStock: true,
    quantity: '0',
    sizes: [
      { size: 'S', available: true },
      { size: 'M', available: true },
      { size: 'L', available: true },
      { size: 'XL', available: true }
    ]
  });
  const [errors, setErrors] = useState({
    name: '',
    price: '',
    image: '',
    quantity: ''
  });
  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        price: product.price.toString(),
        category: product.category,
        description: product.description,
        imageFiles: [],
        imagePreviews: product.imageUrl ? (Array.isArray(product.imageUrl) ? product.imageUrl : [product.imageUrl]) : [],
        inStock: product.inStock,
        quantity: product.quantity.toString(),
        sizes: product.sizes || [
          { size: 'S', available: true },
          { size: 'M', available: true },
          { size: 'L', available: true },
          { size: 'XL', available: true }
        ]
      });
    } else {
      setFormData({
        name: '',
        price: '',
        category: 'men',
        description: '',
        imageFiles: [],
        imagePreviews: [],
        inStock: true,
        quantity: '0',
        sizes: [
          { size: 'S', available: true },
          { size: 'M', available: true },
          { size: 'L', available: true },
          { size: 'XL', available: true }
        ]
      });
    }
  }, [product]);
  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: '',
      price: '',
      image: '',
      quantity: ''
    };
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
      isValid = false;
    }
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
      isValid = false;
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
      isValid = false;
    }
    if (formData.imagePreviews.length === 0 && formData.imageFiles.length === 0) {
      newErrors.image = 'At least one product image is required';
      isValid = false;
    }
    if (!formData.quantity.trim()) {
      newErrors.quantity = 'Quantity is required';
      isValid = false;
    } else if (isNaN(parseInt(formData.quantity)) || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a non-negative number';
      isValid = false;
    }
    setErrors(newErrors);
    return isValid;
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const {
      name,
      value,
      type
    } = e.target as HTMLInputElement;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setFormData(prev => ({
        ...prev,
        imageFiles: files,
        imagePreviews: files.map(file => URL.createObjectURL(file))
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    let imageUrls = formData.imagePreviews;
    // Upload images to Supabase Storage if new files are selected
    if (formData.imageFiles.length > 0) {
      imageUrls = [];
      for (const file of formData.imageFiles) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `products/${fileName}`;
        const { error: uploadError } = await supabase.storage
          .from('product_images')
          .upload(filePath, file);
        if (uploadError) {
          setErrors(prev => ({ ...prev, image: 'Failed to upload image' }));
          return;
        }
        const { data: publicUrlData } = supabase.storage
          .from('product_images')
          .getPublicUrl(filePath);
        imageUrls.push(publicUrlData.publicUrl);
      }
    }
    const productData = {
      name: formData.name,
      price: parseFloat(formData.price),
      category: formData.category as ProductCategory,
      description: formData.description,
      imageUrl: imageUrls, // now an array
      inStock: formData.inStock,
      quantity: parseInt(formData.quantity),
      sizes: formData.sizes
    };
    if (product) {
      updateProduct({
        ...productData,
        id: product.id
      });
    } else {
      addProduct(productData);
    }
    // Reset form and notify parent
    setFormData({
      name: '',
      price: '',
      category: 'men',
      description: '',
      imageFiles: [],
      imagePreviews: [],
      inStock: true,
      quantity: '0',
      sizes: [
        { size: 'S', available: true },
        { size: 'M', available: true },
        { size: 'L', available: true },
        { size: 'XL', available: true }
      ]
    });
    onComplete();
  };
  const handleCancel = () => {
    setFormData({
      name: '',
      price: '',
      category: 'men',
      description: '',
      imageFiles: [],
      imagePreviews: [],
      inStock: true,
      quantity: '0',
      sizes: [
        { size: 'S', available: true },
        { size: 'M', available: true },
        { size: 'L', available: true },
        { size: 'XL', available: true }
      ]
    });
    onComplete();
  };
  return <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Product Name
        </label>
        <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>
      <div>
        <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-1">
          Price (EGP)
        </label>
        <input type="text" id="price" name="price" value={formData.price} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
        {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price}</p>}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="inStock" className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <input type="checkbox" id="inStock" name="inStock" checked={formData.inStock} onChange={handleChange} className="mr-2 h-4 w-4" />
            In Stock
          </label>
        </div>
        <div>
          <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-1">
            Quantity
          </label>
          <input type="number" id="quantity" name="quantity" value={formData.quantity} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" min="0" />
          {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity}</p>}
        </div>
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
          Category
        </label>
        <select id="category" name="category" value={formData.category} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black">
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea id="description" name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
      </div>
      <div>
        <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-1">
          Product Images
        </label>
        <input type="file" id="image" name="image" accept="image/*" multiple onChange={handleImageChange} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black" />
        {errors.image && <p className="text-red-500 text-xs mt-1">{errors.image}</p>}
        {formData.imagePreviews.length > 0 && <div className="mt-2 grid grid-cols-2 gap-2">
          {formData.imagePreviews.map((src, idx) => (
            <img key={idx} src={src} alt={`Product preview ${idx + 1}`} className="h-32 object-cover border border-gray-200" onError={e => {
              (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=Invalid+Image';
            }} />
          ))}
        </div>}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Sizes</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {formData.sizes.map((sz, idx) => (
            <div key={idx} className="flex items-center gap-1 border rounded px-2 py-1 bg-gray-50">
              <input
                type="text"
                value={sz.size}
                onChange={e => {
                  const newSizes = [...formData.sizes];
                  newSizes[idx].size = e.target.value;
                  setFormData(prev => ({ ...prev, sizes: newSizes }));
                }}
                className="w-12 px-1 py-0.5 border rounded text-xs"
              />
              <label className="flex items-center gap-1 text-xs">
                <input
                  type="checkbox"
                  checked={sz.available}
                  onChange={e => {
                    const newSizes = [...formData.sizes];
                    newSizes[idx].available = e.target.checked;
                    setFormData(prev => ({ ...prev, sizes: newSizes }));
                  }}
                />
                Available
              </label>
              <button
                type="button"
                className="text-red-500 hover:text-red-700 text-xs ml-1"
                onClick={() => setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }))}
                disabled={formData.sizes.length <= 1}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs border border-blue-300 hover:bg-blue-200"
            onClick={() => setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { size: '', available: true }] }))}
          >
            + Add Size
          </button>
        </div>
      </div>
      <div className="flex justify-between pt-4">
        {product && <button type="button" onClick={handleCancel} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Cancel
          </button>}
        <button type="submit" className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 ${product ? '' : 'w-full'}`}>
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>;
};