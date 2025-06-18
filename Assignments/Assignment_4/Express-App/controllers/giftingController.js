const express = require("express");
const controller = express.Router();
const GiftingProduct = require('../models/giftingProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Gifting", async (req, res) => {
    try {
        const existingGifts = await GiftingProduct.find().sort({ name: 1 });
        return res.render("admin/Gifting", {
            layout: "admin/adminlayout",
            gifts: existingGifts,
            pageTitle: "Create Gifting Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create gifting page:", error);
        return res.render("admin/Gifting", {
            layout: "admin/adminlayout",
            gifts: [],
            error: "Failed to load the create gifting page. " + error.message,
            formData: {},
            pageTitle: "Create Gifting Product"
        });
    }
});

controller.post("/admin/Gifting", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingGifts = await GiftingProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Gifting", {
                layout: "admin/adminlayout",
                gifts: existingGifts,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Gifting Product"
            });
        }

        const existingGift = await GiftingProduct.findOne({ name: data.name });
        if (existingGift) {
            const existingGifts = await GiftingProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Gifting", {
                layout: "admin/adminlayout",
                gifts: existingGifts,
                error: `A gifting product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Gifting Product"
            });
        }

        let newGift = new GiftingProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newGift.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating gifting product:", error);
        let existingGiftsForError = [];
        try {
            existingGiftsForError = await GiftingProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing gifts during error handling:", fetchErr);
        }

        return res.render("admin/Gifting", {
            layout: "admin/adminlayout",
            gifts: existingGiftsForError,
            error: "Failed to create gifting product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Gifting Product"
        });
    }
});

// Public routes and existing admin functions
controller.get('/categories/gifting', async (req, res, next) => {
    try {
        const products = await GiftingProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/gifting', { 
            products: processedProducts,
            pageTitle: 'All Gifting Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/gifting/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Gifting Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await GiftingProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/gifting', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
// Get all bread products
// Get bread products by category


module.exports = controller;