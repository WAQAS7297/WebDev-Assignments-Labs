const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

// Define the Bread Product Schema
const breadProductSchema = new mongoose.Schema({
    name: String,
    description: String,
    price: Number,
    category: String,
    image: String,
    inStock: Boolean
});

// Create the model
const BreadProduct = mongoose.model('BreadProduct', breadProductSchema, 'bread_products');

// Import any required models
// const Product = require('../models/product');

// Bread category routes
router.get('/bread', async (req, res) => {
    try {
        const products = await BreadProduct.find();
        res.render('categories/bread', { products });
    } catch (error) {
        console.error('Error fetching bread products:', error);
        res.render('categories/bread', { 
            products: [],
            error: 'Unable to fetch products at this time.'
        });
    }
});

router.get('/bread/:category', async (req, res) => {
    try {
        const category = req.params.category;
        let query = {};
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
        }

        const products = await BreadProduct.find(query);
        res.render('categories/bread', { products });
    } catch (error) {
        console.error('Error fetching bread products:', error);
        res.render('categories/bread', { 
            products: [],
            error: 'Unable to fetch products at this time.'
        });
    }
});

// Cakes category routes
router.get('/cakes', (req, res) => {
    // TODO: Fetch cake products from database
    res.render('categories/cakes', {
        products: [], // Replace with actual products from database
        title: 'Cake Collection'
    });
});

router.get('/cakes/:subcategory', (req, res) => {
    const { subcategory } = req.params;
    // TODO: Fetch cake products by subcategory
    res.render('categories/cakes', {
        products: [], // Replace with filtered products
        title: `${subcategory.charAt(0).toUpperCase() + subcategory.slice(1)} Cakes`
    });
});

router.get('/cakes/filter', (req, res) => {
    const { price } = req.query;
    // TODO: Filter cake products by price range
    res.render('categories/cakes', {
        products: [], // Replace with filtered products
        title: 'Filtered Cakes'
    });
});

// Pizza category routes
router.get('/pizza', (req, res) => {
    // TODO: Fetch pizza products from database
    res.render('categories/pizza', {
        products: [], // Replace with actual products from database
        title: 'Pizza Collection'
    });
});

router.get('/pizza/filter', (req, res) => {
    const { sizes, crusts, price } = req.query;
    // TODO: Filter pizza products by size, crust type, and price range
    res.render('categories/pizza', {
        products: [], // Replace with filtered products
        title: 'Filtered Pizza'
    });
});

// Add routes for other categories (biscuits, pastry, snacks) following the same pattern

module.exports = router; 