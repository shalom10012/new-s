import { GoogleGenAI, Modality } from "@google/genai";

// Access the API key from Vite's environment variables
const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  // Provide a helpful error message for developers
  throw new Error("VITE_API_KEY is not set. Please create a .env.local file in the root of your project and add VITE_API_KEY=<your_api_key>");
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
          throw new Error(`API returned text instead of an image: ${textResponse}`);
      }
      throw new Error("Could not extract the generated image from the API response.");
    }

  } catch (error) {
    console.error("Error in Gemini API call:", error);
    throw new Error("Failed to generate image with Gemini API.");
  }
};
