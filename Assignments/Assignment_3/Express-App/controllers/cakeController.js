const express = require("express");
const controller = express.Router();
const CakeProduct = require('../models/cakeProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Cakes", async (req, res) => {
    try {
        const existingCakes = await CakeProduct.find().sort({ name: 1 });
        return res.render("admin/Cakes", {
            layout: "admin/adminlayout",
            cakes: existingCakes,
            pageTitle: "Create Cake Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create cake page:", error);
        return res.render("admin/Cake", {
            layout: "admin/adminlayout",
            cakes: [],
            error: "Failed to load the create cake page. " + error.message,
            formData: {},
            pageTitle: "Create Cake Product"
        });
    }
});

controller.post("/admin/Cakes", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingCakes = await CakeProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Cakes", {
                layout: "admin/adminlayout",
                cakes: existingCakes,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Cake Product"
            });
        }

        const existingCake = await CakeProduct.findOne({ name: data.name });
        if (existingCake) {
            const existingCakes = await CakeProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Cake", {
                layout: "admin/adminlayout",
                cakes: existingCakes,
                error: `A cake product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Cake Product"
            });
        }

        let newCake = new CakeProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newCake.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating cake product:", error);
        let existingCakesForError = [];
        try {
            existingCakesForError = await CakeProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing cakes during error handling:", fetchErr);
        }

        return res.render("admin/Cake", {
            layout: "admin/adminlayout",
            cakes: existingCakesForError,
            error: "Failed to create cake product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Cake Product"
        });
    }
});

// Public routes and existing admin functions
// server.get('/categories/cakes', cakeController.getAllCake);
// server.get('/categories/cakes/:category', cakeController.getCakesByCategory);
// Get all bread products
controller.get('/categories/cakes', async (req, res, next) => {
    try {
        const products = await CakeProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/cakes', { 
            products: processedProducts,
            pageTitle: 'All Cakes Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/cakes/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Cakes Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await CakeProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/cakes', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

module.exports = controller;