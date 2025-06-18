// ./models/Order.model.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true
    },
    userName: {
        type: String,
        required: true
    },
    userEmail: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true,
        enum: ['cod', 'card'] // Example payment methods
    },
    isCod: Boolean,
    cartItems: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' }, // Assuming a Product model
        name: String,
        quantity: Number,
        price: Number,
        image: String
    }],
    totalAmount: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        default: 'Pending',
        enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Not Completed']
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
    // ... any other fields relevant to an order
});

// The 'Order' model is created from the schema
const Order = mongoose.model('Order', orderSchema);

// Export the model so it can be used in other files (like server.js)
module.exports = Order;