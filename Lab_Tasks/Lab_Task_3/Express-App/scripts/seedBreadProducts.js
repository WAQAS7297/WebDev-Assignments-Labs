const mongoose = require('mongoose');
const BreadProduct = require('../models/breadProduct');

mongoose.connect('mongodb://127.0.0.1:27017/Tehzeeb_Bakers')
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB:', err));

const sampleProducts = [
    {
        name: 'Classic White Bread',
        description: 'Soft and fluffy white bread, perfect for sandwiches',
        price: 100,
        category: 'all',
        image: '/images/products/bread/white-bread.jpg',
        inStock: true
    },
    {
        name: 'Whole Wheat Buns',
        description: 'Healthy whole wheat burger buns',
        price: 120,
        category: 'buns',
        image: '/images/products/bread/wheat-buns.jpg',
        inStock: true
    },
    {
        name: 'Butter Croissant',
        description: 'Flaky and buttery French croissants',
        price: 150,
        category: 'croissant',
        image: '/images/products/bread/croissant.jpg',
        inStock: true
    },
    {
        name: 'Tea Rusk',
        description: 'Crispy tea rusks, perfect with your evening chai',
        price: 80,
        category: 'rusk',
        image: '/images/products/bread/tea-rusk.jpg',
        inStock: true
    },
    {
        name: 'Breakfast Roll',
        description: 'Soft breakfast rolls with sesame seeds',
        price: 90,
        category: 'breakfast',
        image: '/images/products/bread/breakfast-roll.jpg',
        inStock: true
    }
];

async function seedProducts() {
    try {
        // Clear existing products
        await BreadProduct.deleteMany({});
        
        // Insert new products
        const insertedProducts = await BreadProduct.insertMany(sampleProducts);
        console.log('Sample bread products inserted successfully:', insertedProducts);
    } catch (error) {
        console.error('Error seeding bread products:', error);
    } finally {
        mongoose.disconnect();
    }
}

seedProducts(); 