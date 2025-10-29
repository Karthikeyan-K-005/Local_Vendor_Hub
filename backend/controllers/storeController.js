import asyncHandler from 'express-async-handler';
// REMOVED: import fs from 'fs';
// REMOVED: import path from 'path';
import Store from '../models/storeModel.js';
import Product from '../models/productModel.js';
import User from '../models/userModel.js';

// NEW IMPORTS for Cloudinary deletion helper
// This utility should be defined in backend/config/cloudinary.js
import { deleteCloudinaryImage } from '../config/cloudinary.js'; 

// REMOVED: getLocalImagePath and deleteFile helper functions as they are no longer needed.
// The new utility deleteCloudinaryImage is imported above.

// @desc    Get all approved stores with search
// @route   GET /api/stores
// @access  Public
const getStores = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const searchFilter = keyword
    ? {
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { category: { $regex: keyword, $options: 'i' } },
          { 'address.area': { $regex: keyword, $options: 'i' } },
          { 'address.city': { $regex: keyword, $options: 'i' } },
          { 'address.district': { $regex: keyword, $options: 'i' } },
        ],
      }
    : {};

  const stores = await Store.find({
    status: 'approved',
    ...searchFilter,
  }).sort({ rating: -1 }); 

  res.json(stores);
});

// @desc    Get a single store by ID and its products
// @route   GET /api/stores/:id
// @access  Public
const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (store) {
    const products = await Product.find({ store: store._id });
    res.json({ ...store.toObject(), products });
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Request a new store (by vendor)
// @route   POST /api/stores/request
// @access  Private/Vendor
const requestNewStore = asyncHandler(async (req, res) => {
  const { name, image, category, address } = req.body;
  // NOTE: 'image' is now expected to be the CLOUDINARY PUBLIC ID

  if (!name || !image || !category || !address) {
    res.status(400);
    throw new Error('Please provide all store details');
  }

  const store = new Store({
    vendor: req.user._id,
    name,
    image, // Store the Cloudinary Public ID
    category,
    address: {
      area: address.area,
      city: address.city,
      district: address.district,
    },
    status: 'pending', 
  });

  const createdStore = await store.save();
  res.status(201).json(createdStore);
});

// @desc    Get stores for the logged-in vendor (all statuses)
// @route   GET /api/stores/my-stores
// @access  Private/Vendor
const getMyStores = asyncHandler(async (req, res) => {
  const { keyword } = req.query;

  const searchFilter = keyword
    ? { name: { $regex: keyword, $options: 'i' } }
    : {};

  const stores = await Store.find({
    vendor: req.user._id,
    ...searchFilter,
  });

  res.json(stores);
});

// @desc    Delete a store (by vendor)
// @route   DELETE /api/stores/:id
// @access  Private/Vendor
const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  if (store.vendor.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized to delete this store');
  }

  // --- CASCADING DELETE LOGIC (Cloudinary Integration) ---
  
  // 1. Find products and delete their images (using Public IDs)
  const products = await Product.find({ store: store._id });
  for (const product of products) {
      // REPLACED: deleteFile(product.image);
      await deleteCloudinaryImage(product.image);
  }
  
  // 2. Delete the store's main image (using Public ID)
  // REPLACED: deleteFile(store.image);
  await deleteCloudinaryImage(store.image);

  // 3. Delete all products
  await Product.deleteMany({ store: store._id });

  // 4. Remove store from user favorites
  await User.updateMany(
    { favorites: store._id },
    { $pull: { favorites: store._id } }
  );

  // 5. Delete the store itself
  await store.deleteOne(); 

  res.json({ message: 'Store, associated products, and images removed' });
});

// @desc    Add a product to a store (by vendor)
// @route   POST /api/stores/:id/products
// @access  Private/Vendor
const addProductToStore = asyncHandler(async (req, res) => {
  const { name, image, description, price } = req.body;
  // NOTE: 'image' is now expected to be the CLOUDINARY PUBLIC ID
  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  if (store.vendor.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }
  if (store.status !== 'approved') {
    res.status(400);
    throw new Error('Cannot add products to a non-approved store');
  }

  const product = new Product({
    store: req.params.id,
    vendor: req.user._id,
    name,
    image, // Store the Cloudinary Public ID
    description,
    price,
  });

  const createdProduct = await product.save();
  res.status(201).json(createdProduct);
});

// @desc    Delete a product from a store (by vendor)
// @route   DELETE /api/stores/:id/products/:productId
// @access  Private/Vendor
const deleteProductFromStore = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (product.vendor.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  // 1. Delete the associated image file (using Public ID)
  // REPLACED: deleteFile(product.image);
  await deleteCloudinaryImage(product.image);

  // 2. Delete the product from the database
  await product.deleteOne(); 
  
  res.json({ message: 'Product and associated image removed' });
});

// @desc    Create a new review (by customer)
// @route   POST /api/stores/:id/reviews
// @access  Private
const createStoreReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const store = await Store.findById(req.params.id);

  if (store) {
    if (store.status !== 'approved') {
      res.status(400);
      throw new Error('Cannot review a non-approved store');
    }

    const alreadyReviewed = store.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      res.status(400);
      throw new Error('Store already reviewed');
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    store.reviews.push(review);
    store.numReviews = store.reviews.length;
    store.rating =
      store.reviews.reduce((acc, item) => item.rating + acc, 0) /
      store.reviews.length;

    await store.save();
    res.status(201).json({ message: 'Review added' });
  } else {
    res.status(404);
    throw new Error('Store not found');
  }
});

// @desc    Get products for a specific store with search (for vendor panel)
// @route   GET /api/stores/:id/products
// @access  Private/Vendor
const getProductsForStore = asyncHandler(async (req, res) => {
  const { keyword } = req.query;
  const store = await Store.findById(req.params.id);

  if (!store) {
    res.status(404);
    throw new Error('Store not found');
  }

  if (store.vendor.toString() !== req.user._id.toString()) {
    res.status(401);
    throw new Error('User not authorized');
  }

  const searchFilter = keyword
    ? { name: { $regex: keyword, $options: 'i' } }
    : {};

  const products = await Product.find({
    store: req.params.id,
    ...searchFilter,
  });

  res.json(products);
});

// Export all controller functions
export {
  getStores,
  getStoreById,
  requestNewStore,
  getMyStores,
  deleteStore,
  addProductToStore,
  deleteProductFromStore,
  createStoreReview,
  getProductsForStore,
};
