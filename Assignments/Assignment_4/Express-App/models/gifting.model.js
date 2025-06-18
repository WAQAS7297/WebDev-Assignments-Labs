const mongoose = require('mongoose');

const GiftingSchema = new mongoose.Schema({
    title: String,
    description: String,
    name: String,
    imageUrl: String,
    altText: String,
    linkUrl: String
    
});

module.exports = mongoose.model('Gifting', GiftingSchema);