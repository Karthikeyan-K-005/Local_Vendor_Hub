import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        email: {
            type: String,
            required: true,
            unique: true,
        },
        password: {
            type: String,
            required: true,
        },
        phone: {
            type: String, 
            // Required ONLY for vendors, not required for customers or admins
            required: function() { return this.role === 'vendor'; }, 
        },
        role: {
            type: String,
            required: true,
            enum: ['customer', 'vendor', 'admin'],
            default: 'customer',
        },
        favorites: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Store',
            },
        ],
    },
    {
        timestamps: true,
    }
);

// Method to check if entered password matches hashed password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Middleware to hash password before saving a new user
userSchema.pre('save', async function (next) {
    // Only run if the password field is being modified (or created)
    if (!this.isModified('password')) {
        return next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

const User = mongoose.model('User', userSchema);

export default User;