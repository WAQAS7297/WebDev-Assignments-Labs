const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema({
    name: String,
    image: String,
    pagelink: String,
    alt_text:String,
    title:String,
});

module.exports = mongoose.model('Categories', CategorySchema);