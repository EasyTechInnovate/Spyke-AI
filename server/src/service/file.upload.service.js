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
    const folderPath = category.trim().toLowerCase();

    const file = fs.readFileSync(localFilePath);

    const response = await imageKit.upload({
      file: file,
      fileName: localFilePath.split("/").pop(),
      folder: folderPath,
      useUniqueFileName: true,
    });

    fs.unlinkSync(localFilePath);
    return response;
  } catch (error) {
    console.error("Error uploading to ImageKit:", error.message);
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    throw error;
  }
};

export { uploadOnImageKit };