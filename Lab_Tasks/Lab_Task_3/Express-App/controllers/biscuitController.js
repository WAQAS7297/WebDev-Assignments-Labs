const BiscuitProduct = require('../models/BiscuitProduct');
const path = require('path');
const express = require("express");
const controller = express.Router();


controller.get("/admin/Biscuit", async (req, res) => {
    try {
        const existingBiscuits = await BiscuitProduct.find().sort({ name: 1 });
        return res.render("admin/Biscuit", {
            layout: "admin/adminlayout",
            biscuits: existingBiscuits,
            pageTitle: "Create Biscuit Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create biscuit page:", error);
        return res.render("admin/Biscuit", {
            layout: "admin/adminlayout",
            biscuits: [],
            error: "Failed to load the create biscuit page. " + error.message,
            formData: {},
            pageTitle: "Create Biscuit Product"
        });
    }
});

controller.post("/admin/Biscuit", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingBiscuits = await BiscuitProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Biscuit", {
                layout: "admin/adminlayout",
                biscuits: existingBiscuits,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Biscuit Product"
            });
        }

        const existingBiscuit = await BiscuitProduct.findOne({ name: data.name });
        if (existingBiscuit) {
            const existingBiscuits = await BiscuitProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Biscuit", {
                layout: "admin/adminlayout",
                biscuits: existingBiscuits,
                error: `A biscuit product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Biscuit Product"
            });
        }

        let newBiscuit = new BiscuitProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newBiscuit.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating biscuit product:", error);
        let existingBiscuitsForError = [];
        try {
            existingBiscuitsForError = await BiscuitProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing biscuits during error handling:", fetchErr);
        }

        return res.render("admin/Biscuit", {
            layout: "admin/adminlayout",
            biscuits: existingBiscuitsForError,
            error: "Failed to create biscuit product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Biscuit Product"
        });
    }
});


controller.get('/categories/biscuit', async (req, res, next) => {
    try {
        const products = await BiscuitProduct.find();
        console.log("Length of products: " + products.length);

        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/biscuit', { 
            products: processedProducts,
            pageTitle: 'All Biscuit Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/biscuit/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Biscuit Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await BiscuitProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/biscuit', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
// Get bread products by category

module.exports = controller;