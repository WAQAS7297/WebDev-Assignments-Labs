const express = require("express");
const controller = express.Router();
const KanasProduct = require('../models/kanasProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Kanas", async (req, res) => {
    try {
        const existingKanas = await KanasProduct.find().sort({ name: 1 });
        return res.render("admin/Kanas", {
            layout: "admin/adminlayout",
            kanas: existingKanas,
            pageTitle: "Create Kanas Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create kanas page:", error);
        return res.render("admin/Kanas", {
            layout: "admin/adminlayout",
            kanas: [],
            error: "Failed to load the create kanas page. " + error.message,
            formData: {},
            pageTitle: "Create Kanas Product"
        });
    }
});

controller.post("/admin/Kanas", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingKanas = await KanasProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Kanas", {
                layout: "admin/adminlayout",
                kanas: existingKanas,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Kanas Product"
            });
        }

        const existingKana = await KanasProduct.findOne({ name: data.name });
        if (existingKana) {
            const existingKanas = await KanasProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Kanas", {
                layout: "admin/adminlayout",
                kanas: existingKanas,
                error: `A kanas product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Kanas Product"
            });
        }

        let newKana = new KanasProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newKana.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating kanas product:", error);
        let existingKanasForError = [];
        try {
            existingKanasForError = await KanasProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing kanas during error handling:", fetchErr);
        }

        return res.render("admin/Kanas", {
            layout: "admin/adminlayout",
            kanas: existingKanasForError,
            error: "Failed to create kanas product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Kanas Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/kanas_ketchup', async (req, res, next) => {
    try {
        const products = await KanasProduct.find();
        console.log("Length of products: " + products.length);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/kanas_ketchup', { 
            products: processedProducts,
            pageTitle: 'All Kanas Ketchup Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/kanas_ketchup/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Kanas Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await KanasProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/kanas_ketchup', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});



module.exports = controller;