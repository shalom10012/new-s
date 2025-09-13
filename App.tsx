import React, { useState } from 'react';
import TryAtHome from './components/TryAtHome';

const PRODUCT_IMAGE_URL = 'https://picsum.photos/seed/gardensale-chair/800/800';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          className="w-full h-64 object-cover"
          src={PRODUCT_IMAGE_URL}
          alt="Modern Armchair"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Modern Armchair</h1>
          <p className="text-gray-600 mb-4">
            A perfect blend of comfort and style, this armchair will elevate any living space.
          </p>
          <div className="flex justify-between items-center mb-6">
            <span className="text-3xl font-semibold text-gray-900">$299</span>
            <span className="text-sm text-green-500 font-medium">In Stock</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-slate-800 text-white py-3 rounded-lg font-semibold text-lg hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50"
          >
            נסה אצלך בבית
          </button>
        </div>
      </div>

      {isModalOpen && (
        <TryAtHome
          productImageUrl={PRODUCT_IMAGE_URL}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </div>
  );
};

export default App;