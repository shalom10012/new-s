import React, { useState } from 'react';
import TryAtHome from './components/TryAtHome';

// The product image URL is now dynamically found by a script in index.html.
// We provide a fallback for safety in case the script doesn't find an image.
const FALLBACK_PRODUCT_IMAGE_URL = 'https://picsum.photos/seed/gardensale-chair/800/800';
const PRODUCT_IMAGE_URL = (window as any).PRODUCT_IMAGE_URL || FALLBACK_PRODUCT_IMAGE_URL;


const App: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" dir="rtl">
      <div className="max-w-sm w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <img
          className="w-full h-64 object-cover"
          src={PRODUCT_IMAGE_URL}
          alt="כורסה מודרנית"
        />
        <div className="p-6">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">כורסה מודרנית</h1>
          <p className="text-slate-600 mb-4">
            שילוב מושלם של נוחות וסטייל, כורסה זו תשדרג כל חלל מגורים.
          </p>
          <div className="flex justify-between items-center mb-6">
            <span className="text-3xl font-semibold text-slate-900">$299</span>
            <span className="text-sm text-green-500 font-medium">במלאי</span>
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