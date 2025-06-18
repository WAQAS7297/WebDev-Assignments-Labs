const express = require("express");
const controller = express.Router();
const SandwichProduct = require('../models/sandwichProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Sandwich", async (req, res) => {
    try {
        const existingSandwiches = await SandwichProduct.find().sort({ name: 1 });
        return res.render("admin/Sandwich", {
            layout: "admin/adminlayout",
            sandwiches: existingSandwiches,
            pageTitle: "Create Sandwich Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create sandwich page:", error);
        return res.render("admin/Sandwich", {
            layout: "admin/adminlayout",
            sandwiches: [],
            error: "Failed to load the create sandwich page. " + error.message,
            formData: {},
            pageTitle: "Create Sandwich Product"
        });
    }
});

controller.post("/admin/Sandwich", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingSandwiches = await SandwichProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Sandwich", {
                layout: "admin/adminlayout",
                sandwiches: existingSandwiches,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Sandwich Product"
            });
        }

        const existingSandwich = await SandwichProduct.findOne({ name: data.name });
        if (existingSandwich) {
            const existingSandwiches = await SandwichProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Sandwich", {
                layout: "admin/adminlayout",
                sandwiches: existingSandwiches,
                error: `A sandwich product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Sandwich Product"
            });
        }

        let newSandwich = new SandwichProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newSandwich.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating sandwich product:", error);
        let existingSandwichesForError = [];
        try {
            existingSandwichesForError = await SandwichProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing sandwiches during error handling:", fetchErr);
        }

        return res.render("admin/Sandwich", {
            layout: "admin/adminlayout",
            sandwiches: existingSandwichesForError,
            error: "Failed to create sandwich product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Sandwich Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/sandwich', async (req, res, next) => {
    try {
        const products = await SandwichProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/sandwich', { 
            products: processedProducts,
            pageTitle: 'All Sandwich Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/sandwich/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Sandwich Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await SandwichProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/sandwich', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Add a new bread product (for admin use)
controller.post('/admin/sandwich', async (req, res, next) => {
    try {
        const newProduct = new SandwichProduct(req.body);
        await newProduct.save();
        res.status(201).json({ 
            success: true, 
            message: 'Product added successfully',
            product: newProduct 
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Update a bread product (for admin use)
controller.put('/admin/sandwich/:id', async (req, res, next) => {
    try {
        const updatedProduct = await SandwichProduct.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updatedProduct) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: 'Product updated successfully',
            product: updatedProduct 
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Delete a bread product (for admin use)
controller.delete('/admin/sandwich/:id', async (req, res, next) => {
    try {
        const product = await SandwichProduct.findByIdAndDelete(req.params.id);
        if (!product) {
            return res.status(404).json({ 
                success: false, 
                message: 'Product not found' 
            });
        }
        res.status(200).json({ 
            success: true, 
            message: 'Product deleted successfully' 
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
}); 

module.exports = controller;