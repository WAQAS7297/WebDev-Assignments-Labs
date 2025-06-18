const express = require("express");
const controller = express.Router();
const donutProduct = require('../models/donutProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Donut", async (req, res) => {
    try {
        const existingDonuts = await donutProduct.find().sort({ name: 1 });
        return res.render("admin/Donut", {
            layout: "admin/adminlayout",
            donuts: existingDonuts,
            pageTitle: "Create Donut Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create donut page:", error);
        return res.render("admin/Donut", {
            layout: "admin/adminlayout",
            donuts: [],
            error: "Failed to load the create donut page. " + error.message,
            formData: {},
            pageTitle: "Create Donut Product"
        });
    }
});

controller.post("/admin/Donut", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingDonuts = await donutProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Donut", {
                layout: "admin/adminlayout",
                donuts: existingDonuts,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Donut Product"
            });
        }

        const existingDonut = await donutProduct.findOne({ name: data.name });
        if (existingDonut) {
            const existingDonuts = await donutProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Donut", {
                layout: "admin/adminlayout",
                donuts: existingDonuts,
                error: `A donut product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Donut Product"
            });
        }

        let newDonut = new donutProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newDonut.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating donut product:", error);
        let existingDonutsForError = [];
        try {
            existingDonutsForError = await donutProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing donuts during error handling:", fetchErr);
        }

        return res.render("admin/Donut", {
            layout: "admin/adminlayout",
            donuts: existingDonutsForError,
            error: "Failed to create donut product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Donut Product"
        });
    }
});

// Public routes and existing admin functions

controller.get('/categories/donut', async (req, res, next) => {
    try {
        const products = await donutProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/donut', { 
            products: processedProducts,
            pageTitle: 'All Donut Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/donut/:category',async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Donut Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await donutProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/donut', { 
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