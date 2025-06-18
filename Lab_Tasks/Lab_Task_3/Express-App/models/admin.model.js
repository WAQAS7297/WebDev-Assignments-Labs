const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    email: String,
    password: String,
    isAdmin: String,
});

adminSchema.pre('save', async function (next) {
  // Only hash if password is modified or new
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(10); // Generate salt
        this.password = await bcrypt.hash(this.password, salt); // Hash password
        next();
    } catch (err) {
        next(err);
    }
});

const adminModel = mongoose.model('admin', adminSchema);
module.exports = adminModel;