const express = require("express");
const controller = express.Router();
const SaladProduct = require('../models/saladProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Salad", async (req, res) => {
    try {
        const existingSalads = await SaladProduct.find().sort({ name: 1 });
        return res.render("admin/Salad", {
            layout: "admin/adminlayout",
            salads: existingSalads,
            pageTitle: "Create Salad Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create salad page:", error);
        return res.render("admin/Salad", {
            layout: "admin/adminlayout",
            salads: [],
            error: "Failed to load the create salad page. " + error.message,
            formData: {},
            pageTitle: "Create Salad Product"
        });
    }
});

controller.post("/admin/Salad", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingSalads = await SaladProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Salad", {
                layout: "admin/adminlayout",
                salads: existingSalads,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Salad Product"
            });
        }

        const existingSalad = await SaladProduct.findOne({ name: data.name });
        if (existingSalad) {
            const existingSalads = await SaladProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Salad", {
                layout: "admin/adminlayout",
                salads: existingSalads,
                error: `A salad product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Salad Product"
            });
        }

        let newSalad = new SaladProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newSalad.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating salad product:", error);
        let existingSaladsForError = [];
        try {
            existingSaladsForError = await SaladProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing salads during error handling:", fetchErr);
        }

        return res.render("admin/Salad", {
            layout: "admin/adminlayout",
            salads: existingSaladsForError,
            error: "Failed to create salad product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Salad Product"
        });
    }
});

// Public routes and existing admin functions
controller.get('/categories/salad', async (req, res, next) => {
    try {
        const products = await SaladProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/salad', { 
            products: processedProducts,
            pageTitle: 'All Salad Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/salad/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Salad Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await SaladProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/salad', { 
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