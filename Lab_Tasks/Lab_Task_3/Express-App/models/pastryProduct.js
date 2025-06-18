const mongoose = require('mongoose');

const pastryProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true,
        enum: ['BROWNIES','BUTTERCREAM PASTRY','CHEESECAKE PASTRY','DRY PASTERY','FRESH CREAM PASTRY','MOUSSE PASTERY','SUNDAE CUPS','all']
    },
    image: {
        type: String,
        required: true
    },
    inStock: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PastryProduct', pastryProductSchema, 'pastery_products'); 