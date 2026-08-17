const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: [true, 'Email field is mandatory.'], 
        unique: true, 
        trim: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: [true, 'Password string validation required.'] 
    },
    role: { 
        type: String, 
        enum: ['user', 'fire_team', 'admin'], 
        default: 'user' 
    }
}, { timestamps: true });

UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    try {
        const saltFactor = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, saltFactor);
    } catch (error) {
        next(error);
    }
});

UserSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);