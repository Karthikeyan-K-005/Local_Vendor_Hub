import mongoose from 'mongoose';

const reviewSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true }, 
    rating: { type: Number, required: true }, // 1-5 stars
    comment: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const storeSchema = mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      // Stores the path/filename for the store's main image
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    address: {
      area: { type: String, required: true },
      city: { type: String, required: true },
      district: { type: String, required: true },
    },
    status: {
      type: String,
      required: true,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviews: [reviewSchema],
    rating: {
      type: Number,
      required: true,
      default: 0,
    },
    numReviews: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const Store = mongoose.model('Store', storeSchema);

export default Store;