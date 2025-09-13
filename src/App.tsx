import React, { useState } from 'react';
import TryAtHome from './components/TryAtHome';

const PRODUCT_IMAGE_URL = 'https://picsum.photos/seed/gardensale-chair/800/800';

const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden transition-shadow duration-300 hover:shadow-2xl">
        <img
          className="w-full h-72 object-cover"
          src={PRODUCT_IMAGE_URL}
          alt="Modern Armchair"
        />
        <div className="p-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Modern Armchair</h1>
          <p className="text-slate-600 mb-6 text-base">
            A perfect blend of comfort and style, this armchair will elevate any living space.
          </p>
          <div className="flex justify-between items-center mb-8">
            <span className="text-4xl font-semibold text-slate-900">$299</span>
            <span className="text-sm text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">In Stock</span>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-semibold text-lg hover:bg-slate-800 transition-all duration-300 focus:outline-none focus:ring-4 focus:ring-slate-300 shadow-md shadow-slate-900/10"
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