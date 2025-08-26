import React from 'react';

const Cart: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-600">Your cart is empty</p>
      </div>
    </div>
  );
};

export default Cart;
