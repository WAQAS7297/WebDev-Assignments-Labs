const mongoose = require('mongoose');
const BreadProduct = require('../models/breadProduct');

mongoose.connect('mongodb://127.0.0.1:27017/Tehzeeb_Bakers')
    .then(async () => {
        console.log('Connected to MongoDB');
        try {
            const products = await BreadProduct.find();
            console.log('Found products:', products);
            console.log('Total products:', products.length);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            mongoose.disconnect();
        }
    })
    .catch(err => console.error('Could not connect to MongoDB:', err)); 