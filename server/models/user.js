import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: 
    {
        type: String,
        required: [true, "Please provide a name"]
    },

    email: {
        type: String,
        required: [true, "Please provide an email"],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please provide a valid email address'
        ]
    },

    password: {
        type: String,
        required: [true, "please provide a password"],
        minLength: [6,'Password must be at least 6 characters'],
        select: false
    },
    
    role: {
        type:String,
        enum: ['staff','manager','admin'],
        default: 'staff'
    }
}, { timestamps: true });
 
// Mongoose Middleware: Encrypt password before saving
userSchema.pre('save', async function(next) {
    // If the password wasn't modified, skip the encryption
    if (!this.isModified('password')) {
        return next();
    }
    
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to check if typed password matches the encrypted database password
userSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

// Create the User model
const User = mongoose.model('User',userSchema)

export default User;