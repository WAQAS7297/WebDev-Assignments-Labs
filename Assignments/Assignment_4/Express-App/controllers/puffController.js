const express = require("express");
const controller = express.Router();
const PuffProduct = require('../models/puffProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Puff", async (req, res) => {
    try {
        const existingPuffs = await PuffProduct.find().sort({ name: 1 });
        return res.render("admin/Puff", {
            layout: "admin/adminlayout",
            puffs: existingPuffs,
            pageTitle: "Create Puff Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create puff page:", error);
        return res.render("admin/Puff", {
            layout: "admin/adminlayout",
            puffs: [],
            error: "Failed to load the create puff page. " + error.message,
            formData: {},
            pageTitle: "Create Puff Product"
        });
    }
});

controller.post("/admin/Puff", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingPuffs = await PuffProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Puff", {
                layout: "admin/adminlayout",
                puffs: existingPuffs,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Puff Product"
            });
        }

        const existingPuff = await PuffProduct.findOne({ name: data.name });
        if (existingPuff) {
            const existingPuffs = await PuffProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Puff", {
                layout: "admin/adminlayout",
                puffs: existingPuffs,
                error: `A puff product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Puff Product"
            });
        }

        let newPuff = new PuffProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newPuff.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating puff product:", error);
        let existingPuffsForError = [];
        try {
            existingPuffsForError = await PuffProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing puffs during error handling:", fetchErr);
        }

        return res.render("admin/Puff", {
            layout: "admin/adminlayout",
            puffs: existingPuffsForError,
            error: "Failed to create puff product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Puff Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/puff', async (req, res, next) => {
    try {
        const products = await PuffProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/puff', { 
            products: processedProducts,
            pageTitle: 'All Puff Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/puff/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Puff Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await PuffProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/puff', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});



module.exports = controller;