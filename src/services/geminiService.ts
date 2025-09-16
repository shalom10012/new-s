import { GoogleGenAI, Modality } from "@google/genai";

// The build environment will replace process.env.API_KEY with the actual API key.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  // This error is for the developer during build time if the key isn't set.
  throw new Error("API_KEY environment variable not set. Please ensure it is configured in your environment.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

type ImageData = {
  base64: string;
  mimeType: string;
};

export const fuseImages = async (productImage: ImageData, spaceImage: ImageData): Promise<string> => {
  try {
    const model = 'gemini-2.5-flash-image-preview';

    const productPart = {
      inlineData: {
        data: productImage.base64,
        mimeType: productImage.mimeType,
      },
    };

    const spacePart = {
      inlineData: {
        data: spaceImage.base64,
        mimeType: spaceImage.mimeType,
      },
    };

    const textPart = {
      text: `You are an expert interior designer. Take the product in the first image and realistically place it within the scene of the second image. Ensure the product's scale is appropriate for the space, and adjust lighting and shadows to make it blend in seamlessly and look natural. Do not add any extra text or commentary, only output the final composed image.`,
    };

    const response = await ai.models.generateContent({
        model: model,
        contents: {
            // The order is important: product, then space, then prompt
            parts: [productPart, spacePart, textPart],
        },
        config: {
            responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
    });
    
    // Find the image part in the response
    const imagePart = response.candidates?.[0]?.content?.parts.find(part => part.inlineData);

    if (imagePart && imagePart.inlineData) {
      return imagePart.inlineData.data;
    } else {
      // Check if the response was blocked or had another issue
      const textResponse = response.text;
      if (textResponse) {
          throw new Error(`שירות ה-AI החזיר טקסט במקום תמונה: ${textResponse}`);
      }
      throw new Error("לא ניתן היה לחלץ את התמונה שנוצרה מתגובת ה-API.");
    }

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    if (error instanceof Error && (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('permission denied'))) {
        throw new Error("מפתח ה-API חסר או לא תקין. אנא ודא/י שהוא מוגדר כראוי בסביבת הפרויקט שלך.");
    }
    // Provide a more detailed error message for better debugging.
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`אירעה שגיאה ביצירת התמונה: ${errorMessage}`);
  }
};