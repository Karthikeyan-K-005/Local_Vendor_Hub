import express from 'express';
import {
    getStores,
    getStoreById,
    requestNewStore,
    getMyStores,
    deleteStore,
    addProductToStore,
    deleteProductFromStore,
    createStoreReview,
    getProductsForStore,
} from '../controllers/storeController.js';
import { protect, isVendor } from '../middleware/authMiddleware.js';

const router = express.Router();


// --- Vendor Routes (Specific endpoints - Requires protect & isVendor middleware) ---

// 1. Store Request (POST /api/stores/request) - Specific path
router.route('/request').post(protect, isVendor, requestNewStore);

// 2. Get My Stores (GET /api/stores/my-stores) - Specific path
router.route('/my-stores').get(protect, isVendor, getMyStores); 

// --- Public Routes ---

// 3. Get All Stores (GET /api/stores)
router.route('/').get(getStores);

// 4. Get Store By ID (GET /api/stores/:id) - Generic path, now placed correctly after specific paths
router.route('/:id').get(getStoreById); 

// --- Other Vendor Routes (Specific to an ID but use different HTTP verbs or more segments) ---

// Store management (DELETE /api/stores/:id)
router.route('/:id').delete(protect, isVendor, deleteStore);

// Product management for a specific store
router
    .route('/:id/products')
    .post(protect, isVendor, addProductToStore) // POST /api/stores/:id/products
    .get(protect, isVendor, getProductsForStore); // GET /api/stores/:id/products

router
    .route('/:id/products/:productId')
    .delete(protect, isVendor, deleteProductFromStore); // DELETE /api/stores/:id/products/:productId

// --- Customer Routes (Requires protect middleware) ---

// Review management
router.route('/:id/reviews').post(protect, createStoreReview);


export default router;