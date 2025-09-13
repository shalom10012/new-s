export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // The result includes a prefix like "data:image/jpeg;base64,", we only need the part after the comma.
      const base64 = result.split(',')[1];
      if (base64) {
        resolve(base64);
      } else {
        reject(new Error("Failed to extract base64 from file reader result."));
      }
    };
    reader.onerror = (error) => reject(error);
  });
};

export const getMimeType = (file: File): string => {
  return file.type;
};
