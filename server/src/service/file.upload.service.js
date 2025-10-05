import ImageKit from "imagekit";
import fs from "fs";
import config from "../config/config.js";

const imageKit = new ImageKit({
  publicKey: config.imageKit.IMAGEKIT_PUBLIC_KEY,
  privateKey: config.imageKit.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: config.imageKit.IMAGEKIT_URL_ENDPOINT,
});

const uploadOnImageKit = async (localFilePath, category) => {
  try {
    if (!localFilePath) {
      throw new Error("No file path provided");
    }

    if (!category) {
      throw new Error("No category/folder name provided");
    }

    // Check if file exists before reading
    if (!fs.existsSync(localFilePath)) {
      throw new Error(`File not found at path: ${localFilePath}`);
    }

    const folderPath = category.trim().toLowerCase();
    const file = fs.readFileSync(localFilePath);
    const fileName = localFilePath.split("/").pop();

    const response = await imageKit.upload({
      file: file,
      fileName: fileName,
      folder: folderPath,
      useUniqueFileName: true,
    });
    
    // Clean up the temporary file
    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading to ImageKit:", error.message);
    
    // Clean up the temporary file even on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

export { uploadOnImageKit };