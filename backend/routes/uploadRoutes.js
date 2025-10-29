// backend/routes/uploadRoutes.js
import express from 'express';
import upload from '../middleware/uploadMiddleware.js'; // Multer memory storage

// 🛑 FIX: Changed from default import (import cloudinary) 
// to NAMED IMPORT because the config file uses 'export { cloudinary, ... }'
import { cloudinary } from '../config/cloudinary.js'; 

const router = express.Router();

// Helper function to convert buffer to a Base64 data URI string
const bufferToDataUri = (buffer, mimeType) =>
    `data:${mimeType};base64,${buffer.toString('base64')}`;


// @route POST /api/upload
// @desc Upload a single image file to Cloudinary
// @access Private (will be protected by calling controller/frontend)
router.post('/', upload.single('image'), async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error('No file uploaded');
    }

    try {
        // Convert the file buffer to a Base64 data URI string for Cloudinary upload
        const fileUri = bufferToDataUri(req.file.buffer, req.file.mimetype);

        // Upload to Cloudinary
        const uploadResult = await cloudinary.uploader.upload(fileUri, {
            folder: 'local_store_hub', // Optional: Organizes files in Cloudinary
            // You can use the filename as the Public ID if you prefer, but Cloudinary handles unique IDs well.
        });

        // Return the Public ID (which will be stored in the DB)
        // The frontend will then use this Public ID to construct the URL for display.
        res.json({
            // Frontend will need to store this:
            publicId: uploadResult.public_id, 
            // Optional: Also return the full URL for immediate use:
            imageUrl: uploadResult.secure_url, 
        });

    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500);
        throw new Error('Image upload failed to cloud platform');
    }
});

export default router;
