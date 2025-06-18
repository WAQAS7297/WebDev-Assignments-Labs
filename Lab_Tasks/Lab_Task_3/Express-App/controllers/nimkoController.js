const express = require("express");
const controller = express.Router();
const NimkoProduct = require('../models/nimkoProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Nimko", async (req, res) => {
    try {
        const existingNimkos = await NimkoProduct.find().sort({ name: 1 });
        return res.render("admin/Nimko", {
            layout: "admin/adminlayout",
            nimkos: existingNimkos,
            pageTitle: "Create Nimko Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create nimko page:", error);
        return res.render("admin/Nimko", {
            layout: "admin/adminlayout",
            nimkos: [],
            error: "Failed to load the create nimko page. " + error.message,
            formData: {},
            pageTitle: "Create Nimko Product"
        });
    }
});

controller.post("/admin/Nimko", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingNimkos = await NimkoProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Nimko", {
                layout: "admin/adminlayout",
                nimkos: existingNimkos,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Nimko Product"
            });
        }

        const existingNimko = await NimkoProduct.findOne({ name: data.name });
        if (existingNimko) {
            const existingNimkos = await NimkoProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Nimko", {
                layout: "admin/adminlayout",
                nimkos: existingNimkos,
                error: `A nimko product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Nimko Product"
            });
        }

        let newNimko = new NimkoProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newNimko.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating nimko product:", error);
        let existingNimkosForError = [];
        try {
            existingNimkosForError = await NimkoProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing nimkos during error handling:", fetchErr);
        }

        return res.render("admin/Nimko", {
            layout: "admin/adminlayout",
            nimkos: existingNimkosForError,
            error: "Failed to create nimko product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Nimko Product"
        });
    }
});

// Public routes and existing admin functions

controller.get('/categories/nimko', async (req, res, next) => {
    try {
        const products = await NimkoProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/nimko', { 
            products: processedProducts,
            pageTitle: 'All Nimko Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/nimko/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Nimko Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await NimkoProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/nimko', { 
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