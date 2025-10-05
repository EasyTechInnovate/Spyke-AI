import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const tempDir = path.resolve(__dirname, '../../public/temp');

        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir, { recursive: true });
        }

        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

export const upload = multer({ 
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increase to 10MB for videos
        fieldSize: 10 * 1024 * 1024 
    },
    fileFilter: (req, file, cb) => {
        // Allowed file extensions
        const allowedExtensions = /\.(jpeg|jpg|png|gif|webp|mp4|avi|mov|wmv|flv|mkv|webm)$/i;
        
        // Allowed MIME types
        const allowedMimeTypes = /^(image\/(jpeg|jpg|png|gif|webp)|video\/(mp4|avi|mov|wmv|flv|mkv|webm|quicktime|x-msvideo))$/i;
        
        const extname = allowedExtensions.test(file.originalname);
        const mimetype = allowedMimeTypes.test(file.mimetype);
        
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only images and videos are allowed'));
        }
    }
});

export const uploadFiles = upload.single('file');