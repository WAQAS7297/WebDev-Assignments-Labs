const express = require("express");
const controller = express.Router();
const BurgerProduct = require('../models/burgerProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Burger", async (req, res) => {
    try {
        const existingBurgers = await BurgerProduct.find().sort({ name: 1 });
        return res.render("admin/Burger", {
            layout: "admin/adminlayout",
            burgers: existingBurgers,
            pageTitle: "Create Burger Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create burger page:", error);
        return res.render("admin/Burger", {
            layout: "admin/adminlayout",
            burgers: [],
            error: "Failed to load the create burger page. " + error.message,
            formData: {},
            pageTitle: "Create Burger Product"
        });
    }
});

controller.post("/admin/Burger", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingBurgers = await BurgerProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Burger", {
                layout: "admin/adminlayout",
                burgers: existingBurgers,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Burger Product"
            });
        }

        const existingBurger = await BurgerProduct.findOne({ name: data.name });
        if (existingBurger) {
            const existingBurgers = await BurgerProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Burger", {
                layout: "admin/adminlayout",
                burgers: existingBurgers,
                error: `A burger product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Burger Product"
            });
        }

        let newBurger = new BurgerProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newBurger.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating burger product:", error);
        let existingBurgersForError = [];
        try {
            existingBurgersForError = await BurgerProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing burgers during error handling:", fetchErr);
        }

        return res.render("admin/Burger", {
            layout: "admin/adminlayout",
            burgers: existingBurgersForError,
            error: "Failed to create burger product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Burger Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/burger', async (req, res, next) => {
    try {
        const products = await BurgerProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/burger', { 
            products: processedProducts,
            pageTitle: 'All Burger Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/burger/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Burger Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await BurgerProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/burger', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});


module.exports = controller;