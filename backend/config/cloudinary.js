import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Helper function to safely delete an asset from Cloudinary.
 * @param {string} publicId - The Cloudinary public ID of the asset.
 */
const deleteCloudinaryImage = async (publicId) => { // <-- 1. Function must be defined with this exact name
    if (!publicId) {
        console.log('No Public ID provided for Cloudinary deletion. Skipping.');
        return;
    }

    try {
        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            console.log(`Successfully deleted Cloudinary asset: ${publicId}`);
        } else if (result.result === 'not found') {
            console.log(`Cloudinary asset not found: ${publicId}`);
        } else {
            console.error(`Cloudinary deletion failed for ${publicId}:`, result);
        }
    } catch (error) {
        console.error(`Error during Cloudinary deletion for ${publicId}:`, error.message);
    }
};

export {
    cloudinary, // Export the main Cloudinary object (used in upload routes)
    deleteCloudinaryImage // <-- 2. The function MUST be explicitly exported here
};