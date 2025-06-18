const mongoose = require('mongoose');

const CakeProductSchema = new mongoose.Schema({
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
        enum: ['butter cream cake','cheese cakes','dry cake','fresh cream cake','mousse cake', 'tea cake',  'all']
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

module.exports = mongoose.model('CakeProduct', CakeProductSchema, 'cake_products'); 