const mongoose = require('mongoose');

const SliderItemSchema = new mongoose.Schema({
    heading:String,
    description: String,
    imageUrl:String,
    altText: String,
    productLink:String,
    isActive: Boolean,
    displayOrder:Number
}, {
    timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('Carosel', SliderItemSchema);