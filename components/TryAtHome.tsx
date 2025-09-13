import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fuseImages } from '../services/geminiService';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { UploadIcon, SpinnerIcon, RedoIcon, DownloadIcon, CloseIcon } from './icons';

interface TryAtHomeProps {
  productImageUrl: string;
  onClose: () => void;
}

const loadingMessages = [
  "Analyzing your space...",
  "Placing the product...",
  "Adjusting lighting and shadows...",
  "Applying realistic textures...",
  "Finalizing your new room...",
];

const TryAtHome: React.FC<TryAtHomeProps> = ({ productImageUrl, onClose }) => {
  const [userImageFile, setUserImageFile] = useState<File | null>(null);
  const [userImageUrl, setUserImageUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMessage, setLoadingMessage] = useState(loadingMessages[0]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isLoading) {
      const interval = setInterval(() => {
        setLoadingMessage(prev => {
          const currentIndex = loadingMessages.indexOf(prev);
          const nextIndex = (currentIndex + 1) % loadingMessages.length;
          return loadingMessages[nextIndex];
        });
      }, 2500);
      return () => clearInterval(interval);
    }
  }, [isLoading]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUserImageFile(file);
      setUserImageUrl(URL.createObjectURL(file));
      setGeneratedImageUrl(null);
      setError(null);
    }
  };

  const handleGenerate = useCallback(async () => {
    if (!userImageFile) {
      setError("Please upload an image of your space first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      // Fetch the product image and convert to base64
      const productResponse = await fetch(productImageUrl);
      if (!productResponse.ok) throw new Error("Failed to fetch product image.");
      const productBlob = await productResponse.blob();
      const productBase64 = await fileToBase64(new File([productBlob], "product", { type: productBlob.type }));
      
      // Convert user image to base64
      const userImageBase64 = await fileToBase64(userImageFile);
      const userImageMimeType = getMimeType(userImageFile);

      const resultBase64 = await fuseImages(
        { base64: productBase64, mimeType: productBlob.type },
        { base64: userImageBase64, mimeType: userImageMimeType }
      );

      setGeneratedImageUrl(`data:${userImageMimeType};base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An unknown error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, [userImageFile, productImageUrl]);

  const handleTryAgain = () => {
    setUserImageFile(null);
    setUserImageUrl(null);
    setGeneratedImageUrl(null);
    setError(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-full max-h-[90vh] flex flex-col relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 p-2 rounded-full bg-white/50 hover:bg-white/80 transition-all"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {isLoading && (
          <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-20">
            <SpinnerIcon />
            <p className="text-lg text-gray-700 font-medium mt-4 animate-pulse">{loadingMessage}</p>
          </div>
        )}

        <div className="p-6 sm:p-8 flex-grow overflow-y-auto">
          {generatedImageUrl ? (
            <div className="flex flex-col items-center justify-center h-full">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 text-center">Here's how it looks!</h2>
              <div className="w-full max-w-2xl aspect-video bg-gray-100 rounded-lg overflow-hidden shadow-lg">
                <img src={generatedImageUrl} alt="Generated interior view" className="w-full h-full object-contain" />
              </div>
              <div className="mt-6 flex items-center space-x-4">
                 <button
                    onClick={handleTryAgain}
                    className="flex items-center justify-center px-5 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                >
                    <RedoIcon />
                    <span className="ml-2">Try Again</span>
                </button>
                <a
                    href={generatedImageUrl}
                    download="my-new-space.png"
                    className="flex items-center justify-center px-5 py-2.5 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
                >
                    <DownloadIcon />
                    <span className="ml-2">Download</span>
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-full">
                <div className="text-center mb-6">
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-800">See it in Your Space</h2>
                    <p className="text-gray-500 mt-1">Upload a photo of your room to see how this product fits.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow">
                    <div className="flex flex-col items-center justify-center text-center p-4 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Space</h3>
                        {userImageUrl ? (
                            <div className="w-full aspect-video rounded-md overflow-hidden relative group">
                                <img src={userImageUrl} alt="User's space" className="w-full h-full object-cover"/>
                                <button onClick={triggerFileUpload} className="absolute inset-0 bg-black/50 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                                    Change Image
                                </button>
                            </div>
                        ) : (
                            <button onClick={triggerFileUpload} className="w-full aspect-video flex flex-col items-center justify-center hover:bg-gray-100 rounded-md transition-colors">
                                <UploadIcon />
                                <p className="mt-2 text-gray-600">Click to upload image</p>
                                <p className="text-xs text-gray-400">PNG, JPG, WEBP</p>
                            </button>
                        )}
                         <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/png, image/jpeg, image/webp"
                            className="hidden"
                        />
                    </div>
                    <div className="flex flex-col items-center justify-center text-center p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Product Image</h3>
                        <div className="w-full aspect-video rounded-md overflow-hidden bg-gray-100">
                           <img src={productImageUrl} alt="Product" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                </div>
                {error && <p className="text-center text-red-500 mt-4">{error}</p>}
                <div className="mt-6 text-center">
                    <button
                        onClick={handleGenerate}
                        disabled={!userImageFile || isLoading}
                        className="w-full max-w-xs px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-lg hover:bg-slate-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                    >
                        Generate
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default TryAtHome;