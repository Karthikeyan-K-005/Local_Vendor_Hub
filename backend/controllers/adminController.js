import asyncHandler from 'express-async-handler';
// import fs from 'fs'; // REMOVED: No longer using local filesystem
import Store from '../models/storeModel.js';
import User from '../models/userModel.js';
import Product from '../models/productModel.js';
import sendEmail from '../config/email.js';

// 🛑 FIX: Use NAMED IMPORT for the cloudinary object (if needed) 
// AND the deleteCloudinaryImage helper function.
import { deleteCloudinaryImage } from '../config/cloudinary.js'; 

// REMOVED: The entire block for the local deleteCloudinaryImage helper function 
// is removed because it is now imported from '../config/cloudinary.js'.

// @desc    Get all pending store requests
// @route   GET /api/admin/requests
// @access  Private/Admin
const getStoreRequests = asyncHandler(async (req, res) => {
  const stores = await Store.find({ status: 'pending' }).populate(
    'vendor',
    'name email phone' 
  );
  res.json(stores);
});

// @desc    Approve or reject a store request
// @route   PUT /api/admin/requests/:id
// @access  Private/Admin
const manageStoreRequest = asyncHandler(async (req, res) => {
  const { status } = req.body; // 'approved' or 'rejected'

  if (status !== 'approved' && status !== 'rejected') {
    res.status(400);
    throw new Error('Invalid status provided.');
  }

  const store = await Store.findById(req.params.id).populate(
    'vendor',
    'name email'
  );

  if (store) {
    store.status = status;
    const updatedStore = await store.save();

    // Send email notification
    const emailSubject = `Your Store Request has been ${status}`;
    const emailMessage = `Hello ${store.vendor.name},\n\nYour request for the store "${store.name}" has been ${status}.\n\nThank you,\nAdmin`;
    await sendEmail(store.vendor.email, emailSubject, emailMessage);

    res.json(updatedStore);
  } else {
    res.status(404);
    throw new Error('Store request not found');
  }
});

// @desc    Get all vendors
// @route   GET /api/admin/vendors
// @access  Private/Admin
const getAllVendors = asyncHandler(async (req, res) => {
  const vendors = await User.find({ role: 'vendor' }).select('-password');
  res.json(vendors);
});

// @desc    Delete a vendor and all their associated data
// @route   DELETE /api/admin/vendors/:id
// @access  Private/Admin
const deleteVendor = asyncHandler(async (req, res) => {
    const vendor = await User.findById(req.params.id);

    if (!vendor || vendor.role !== 'vendor') {
        res.status(404);
        throw new Error('Vendor not found');
    }

    // 1. Find associated data (Stores and Products)
    const stores = await Store.find({ vendor: vendor._id });
    const storeIds = stores.map((s) => s._id);
    const products = await Product.find({ store: { $in: storeIds } });

    // 2. Cloudinary Deletion (Crucial Cleanup)
    // NOTE: The helper function is now imported and used here.
    products.forEach(product => deleteCloudinaryImage(product.image));
    stores.forEach(store => deleteCloudinaryImage(store.image));

    // 3. Database Deletion Logic
    // ... (rest of DB logic remains unchanged)
    await Product.deleteMany({ store: { $in: storeIds } });

    // Remove from user favorites lists
    await User.updateMany(
        { favorites: { $in: storeIds } },
        { $pull: { favorites: { $in: storeIds } } }
    );

    // Delete all stores
    await Store.deleteMany({ vendor: vendor._id });

    // Delete the vendor
    await vendor.deleteOne();

    // 4. Send email notification
    const subject = `Your Account has been Deleted`;
    const message = `Hello ${vendor.name},\n\nYour vendor account and all associated stores have been deleted by the administrator.\n\nThank you,\nAdmin`;
    await sendEmail(vendor.email, subject, message);

    res.json({ message: 'Vendor and all associated data deleted' });
});

// @desc    Get all stores (for management)
// @route   GET /api/admin/stores
// @access  Private/Admin
const getAllStores = asyncHandler(async (req, res) => {
  const stores = await Store.find({}).populate('vendor', 'name email');
  res.json(stores);
});

// @desc    Delete a store (by admin)
// @route   DELETE /api/admin/stores/:id
// @access  Private/Admin
const deleteStoreByAdmin = asyncHandler(async (req, res) => {
    const store = await Store.findById(req.params.id).populate(
        'vendor',
        'name email'
    );

    if (!store) {
        res.status(404);
        throw new Error('Store not found');
    }

    // 1. Find associated products
    const products = await Product.find({ store: store._id });

    // 2. Cloudinary Deletion
    products.forEach(product => deleteCloudinaryImage(product.image));
    deleteCloudinaryImage(store.image); // Delete store image

    // 3. Database Deletion Logic
    // ... (rest of DB logic remains unchanged)
    await Product.deleteMany({ store: store._id });

    // Remove from favorites
    await User.updateMany(
        { favorites: store._id },
        { $pull: { favorites: store._id } }
    );

    // Delete the store
    await store.deleteOne();

    // 4. Send email
    const subject = `Your Store has been Deleted`;
    const message = `Hello ${store.vendor.name},\n\nYour store "${store.name}" has been deleted by the administrator.\n\nThank you,\nAdmin`;
    await sendEmail(store.vendor.email, subject, message);

    res.json({ message: 'Store and associated data removed' });
});

export {
    getStoreRequests,
    manageStoreRequest,
    getAllVendors,
    deleteVendor,
    getAllStores,
    deleteStoreByAdmin,
};

