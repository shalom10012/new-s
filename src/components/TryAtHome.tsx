import React, { useState, useCallback, useEffect, useRef } from 'react';
import { fuseImages } from '../services/geminiService';
import { fileToBase64, getMimeType } from '../utils/fileUtils';
import { UploadIcon, SpinnerIcon, RedoIcon, DownloadIcon, CloseIcon, SparklesIcon } from './icons';

interface TryAtHomeProps {
  productImageUrl: string;
  onClose: () => void;
}

const loadingMessages = [
  "מנתח את החלל שלך...",
  "ממקם את המוצר...",
  "מתאים תאורה וצלליות...",
  "מוסיף טקסטורות ריאליסטיות...",
  "מסיים את העיצוב החדש שלך...",
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
      setError("אנא העלה תמונה של החלל שלך תחילה.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setGeneratedImageUrl(null);
    setLoadingMessage(loadingMessages[0]);

    try {
      const productResponse = await fetch(productImageUrl);
      if (!productResponse.ok) throw new Error("Failed to fetch product image.");
      const productBlob = await productResponse.blob();
      const productBase64 = await fileToBase64(new File([productBlob], "product", { type: productBlob.type }));
      
      const userImageBase64 = await fileToBase64(userImageFile);
      const userImageMimeType = getMimeType(userImageFile);

      const resultBase64 = await fuseImages(
        { base64: productBase64, mimeType: productBlob.type },
        { base64: userImageBase64, mimeType: userImageMimeType }
      );

      setGeneratedImageUrl(`data:${userImageMimeType};base64,${resultBase64}`);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "אירעה שגיאה לא צפויה. אנא נסה שוב.");
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

  const renderContent = () => {
    if (generatedImageUrl) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h2 className="text-3xl font-bold text-slate-800 mb-4">הנה התוצאה!</h2>
          <p className="text-slate-500 mb-6 max-w-lg">כך הכיסא החדש שלך יכול להיראות בחלל האירוח. ניתן להוריד את התמונה או לנסות שוב עם תמונה אחרת.</p>
          <div className="w-full max-w-3xl aspect-video bg-slate-100 rounded-xl overflow-hidden shadow-inner mb-8">
            <img src={generatedImageUrl} alt="Generated interior view" className="w-full h-full object-contain" />
          </div>
          <div className="flex items-center space-x-4">
              <button
                onClick={handleTryAgain}
                className="flex items-center justify-center px-6 py-3 bg-slate-200 text-slate-700 font-semibold rounded-lg hover:bg-slate-300 transition-colors"
              >
                  <RedoIcon />
                  <span className="ml-2">נסה שוב</span>
              </button>
              <a
                  href={generatedImageUrl}
                  download="my-new-space.png"
                  className="flex items-center justify-center px-6 py-3 bg-slate-800 text-white font-semibold rounded-lg hover:bg-slate-700 transition-colors"
              >
                  <DownloadIcon />
                  <span className="ml-2">הורד תמונה</span>
              </a>
          </div>
        </div>
      );
    }

    if (userImageUrl) {
        return (
            <div className="flex flex-col h-full">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-800">שלב 2: תצוגה מקדימה</h2>
                    <p className="text-slate-500 mt-2">ודא שהתמונות נראות טוב ולחץ על הכפתור כדי להתחיל את הקסם.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-grow my-6 content-center">
                    <div className="flex flex-col text-center">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">החלל שלך</h3>
                        <div className="w-full aspect-video rounded-xl overflow-hidden relative group shadow-md">
                            <img src={userImageUrl} alt="User's space" className="w-full h-full object-cover"/>
                            <button onClick={triggerFileUpload} className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                                החלף תמונה
                            </button>
                        </div>
                    </div>
                    <div className="flex flex-col text-center">
                        <h3 className="text-lg font-semibold text-slate-700 mb-3">המוצר</h3>
                        <div className="w-full aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-md">
                           <img src={productImageUrl} alt="Product" className="w-full h-full object-cover"/>
                        </div>
                    </div>
                </div>
                {error && <p className="text-center text-red-500 mb-4">{error}</p>}
                <div className="text-center">
                    <button
                        onClick={handleGenerate}
                        disabled={!userImageFile || isLoading}
                        className="w-full max-w-sm inline-flex items-center justify-center px-8 py-4 bg-slate-800 text-white font-bold text-lg rounded-lg hover:bg-slate-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        <SparklesIcon />
                        <span className="ml-3">הפק תמונה חדשה</span>
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center">
            <h2 className="text-3xl font-bold text-slate-800">שלב 1: העלאת תמונה</h2>
            <p className="text-slate-500 mt-2 mb-8 max-w-lg">העלה תמונה ברורה של החדר בו תרצה למקם את המוצר. לקבלת התוצאות הטובות ביותר, השתמש בתמונה מוארת היטב.</p>
            <div 
                onClick={triggerFileUpload}
                className="w-full max-w-2xl h-64 flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
            >
                <UploadIcon />
                <p className="mt-4 text-lg font-semibold text-slate-700">גרור לכאן קובץ או לחץ להעלאה</p>
                <p className="mt-1 text-sm text-slate-500">PNG, JPG, WEBP (עד 10MB)</p>
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
            />
        </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-full max-h-[95vh] flex flex-col relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-800 z-30 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200/90 transition-all"
          aria-label="Close"
        >
          <CloseIcon />
        </button>

        {isLoading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-md flex flex-col items-center justify-center z-20">
            <SpinnerIcon />
            <p className="text-lg text-slate-700 font-medium mt-6 animate-pulse">{loadingMessage}</p>
          </div>
        )}

        <div className="p-8 md:p-12 flex-grow overflow-y-auto">
          {renderContent()}
        </div>
      </div>
       <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
       `}</style>
    </div>
  );
};

export default TryAtHome;