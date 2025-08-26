import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
// Adjust import paths as needed
// import { fetchProducts, addProduct, updateProduct, deleteProduct } from '../store/slices/productSlice';
// import { RootState } from '../store/store';

const AdminPanel: React.FC = () => {

  // Get user from auth state
  const user = useSelector((state: any) => state.auth.user);
  const navigate = useNavigate();

  // Local state for form
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    image: null as File | null,
    category: '',
    _id: '', // for edit
  });
  const [products, setProducts] = useState<any[]>([]); // Replace with your product type
  const [editing, setEditing] = useState(false);


  // Redirect if not admin
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Fetch products (replace with Redux or API call)
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetch('/api/products')
        .then(res => res.json())
        .then(data => setProducts(data));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as any;
    setForm(prev => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', form.name);
    formData.append('price', form.price);
    formData.append('description', form.description);
    formData.append('category', form.category);
    if (form.image) formData.append('image', form.image);

    if (editing) {
      // Update product
      await fetch(`/api/products/${form._id}`, {
        method: 'PUT',
        body: formData,
      });
    } else {
      // Add product
      await fetch('/api/products', {
        method: 'POST',
        body: formData,
      });
    }
    // Refresh list
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data));
    setForm({ name: '', price: '', description: '', image: null, category: '', _id: '' });
    setEditing(false);
  };

  const handleEdit = (product: any) => {
    setForm({ ...product, image: null });
    setEditing(true);
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/products/${id}`, { method: 'DELETE' });
    setProducts(products.filter(p => p._id !== id));
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Admin Panel - Product Management</h1>
      <form onSubmit={handleSubmit} className="mb-8 space-y-2">
        <input name="name" value={form.name} onChange={handleChange} placeholder="Name" className="border p-2 w-full" required />
        <input name="price" value={form.price} onChange={handleChange} placeholder="Price" className="border p-2 w-full" required />
        <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description" className="border p-2 w-full" required />
        <input name="category" value={form.category} onChange={handleChange} placeholder="Category" className="border p-2 w-full" required />
        <input name="image" type="file" accept="image/*" onChange={handleChange} className="border p-2 w-full" />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">
          {editing ? 'Update Product' : 'Add Product'}
        </button>
        {editing && (
          <button type="button" onClick={() => { setEditing(false); setForm({ name: '', price: '', description: '', image: null, category: '', _id: '' }); }} className="ml-2 px-4 py-2 border rounded">
            Cancel
          </button>
        )}
      </form>
      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th>Name</th>
            <th>Price</th>
            <th>Category</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(product => (
            <tr key={product._id} className="border-t">
              <td>{product.name}</td>
              <td>{product.price}</td>
              <td>{product.category}</td>
              <td>
                <button onClick={() => handleEdit(product)} className="text-blue-600 mr-2">Edit</button>
                <button onClick={() => handleDelete(product._id)} className="text-red-600">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default AdminPanel;
