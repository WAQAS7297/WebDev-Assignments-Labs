const mongoose = require('mongoose');

const donutProductSchema = new mongoose.Schema({
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
        enum: ['all']
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

module.exports = mongoose.model('DonutProduct', donutProductSchema, 'donut_products'); 