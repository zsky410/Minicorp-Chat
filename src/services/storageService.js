import * as ImageManipulator from "expo-image-manipulator";

// Convert image to base64 and compress
// Firestore has 1MB limit per document, so we compress images
export const uploadChatImage = async (imageUri) => {
  try {
    // Resize and compress image
    // Max width/height: 800px, quality: 0.7, format: JPEG
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 800 } }], // Resize to max 800px width (maintains aspect ratio)
      {
        compress: 0.7, // 70% quality
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Convert to base64
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        // Remove data:image/jpeg;base64, prefix if present
        const base64Data = base64String.includes(",")
          ? base64String.split(",")[1]
          : base64String;

        // Check size (Firestore limit is 1MB, but base64 increases size by ~33%)
        // So we limit to ~750KB base64 (which is ~560KB actual)
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;

        if (sizeInKB > 750) {
          resolve({
            success: false,
            error: "Ảnh quá lớn. Vui lòng chọn ảnh nhỏ hơn.",
          });
          return;
        }

        resolve({
          success: true,
          data: base64Data, // Return base64 string
          size: sizeInKB,
        });
      };
      reader.onerror = (error) => {
        console.error("Error converting image to base64:", error);
        reject({
          success: false,
          error: "Không thể xử lý ảnh",
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error uploading chat image:", error);
    return {
      success: false,
      error: error.message || "Không thể xử lý ảnh",
    };
  }
};

// Upload avatar (for user profile)
// Also saves as base64 in Firestore
export const uploadAvatarImage = async (userId, imageUri) => {
  try {
    // Resize avatar to smaller size (200x200 max)
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      imageUri,
      [{ resize: { width: 200, height: 200 } }],
      {
        compress: 0.8,
        format: ImageManipulator.SaveFormat.JPEG,
      }
    );

    // Convert to base64
    const response = await fetch(manipulatedImage.uri);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const base64Data = base64String.includes(",")
          ? base64String.split(",")[1]
          : base64String;

        // Avatar should be smaller, limit to 200KB
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;

        if (sizeInKB > 200) {
          resolve({
            success: false,
            error: "Ảnh đại diện quá lớn. Vui lòng chọn ảnh nhỏ hơn.",
          });
          return;
        }

        resolve({
          success: true,
          data: base64Data,
          size: sizeInKB,
        });
      };
      reader.onerror = (error) => {
        console.error("Error converting avatar to base64:", error);
        reject({
          success: false,
          error: "Không thể xử lý ảnh",
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error uploading avatar:", error);
    return {
      success: false,
      error: error.message || "Không thể xử lý ảnh",
    };
  }
};

// Upload file (convert to base64)
// Supports: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, etc.
export const uploadFile = async (fileUri, fileName, mimeType) => {
  try {
    // Read file
    const response = await fetch(fileUri);
    const blob = await response.blob();

    // Convert blob to base64
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const base64Data = base64String.includes(",")
          ? base64String.split(",")[1]
          : base64String;

        // Check size (Firestore limit is 1MB, but base64 increases size by ~33%)
        // So we limit to ~750KB base64 (which is ~560KB actual)
        const sizeInBytes = (base64Data.length * 3) / 4;
        const sizeInKB = sizeInBytes / 1024;

        if (sizeInKB > 750) {
          resolve({
            success: false,
            error: "File quá lớn. Vui lòng chọn file nhỏ hơn 750KB.",
          });
          return;
        }

        resolve({
          success: true,
          data: base64Data,
          fileName: fileName,
          mimeType: mimeType,
          size: sizeInKB,
        });
      };
      reader.onerror = (error) => {
        console.error("Error converting file to base64:", error);
        reject({
          success: false,
          error: "Không thể xử lý file",
        });
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    return {
      success: false,
      error: error.message || "Không thể xử lý file",
    };
  }
};

