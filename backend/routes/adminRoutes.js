import express from 'express';
import {
  getStoreRequests,
  manageStoreRequest,
  getAllVendors,
  deleteVendor,
  getAllStores,
  deleteStoreByAdmin,
} from '../controllers/adminController.js';
import { protect, isAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply protect and isAdmin middleware to all subsequent admin routes
router.use(protect, isAdmin);

// Store Requests Management
router.route('/requests').get(getStoreRequests);
router.route('/requests/:id').put(manageStoreRequest);

// Vendor Management
router.route('/vendors').get(getAllVendors);
router.route('/vendors/:id').delete(deleteVendor);

// Store Management (Admin view/delete)
router.route('/stores').get(getAllStores);
router.route('/stores/:id').delete(deleteStoreByAdmin);

export default router;