const express = require("express");
const controller = express.Router();
const PastryProduct = require('../models/pastryProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Pastry", async (req, res) => {
    try {
        const existingPastries = await PastryProduct.find().sort({ name: 1 });
        return res.render("admin/Pastry", {
            layout: "admin/adminlayout",
            pastries: existingPastries,
            pageTitle: "Create Pastry Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create pastry page:", error);
        return res.render("admin/Pastry", {
            layout: "admin/adminlayout",
            pastries: [],
            error: "Failed to load the create pastry page. " + error.message,
            formData: {},
            pageTitle: "Create Pastry Product"
        });
    }
});

controller.post("/admin/Pastry", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingPastries = await PastryProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Pastry", {
                layout: "admin/adminlayout",
                pastries: existingPastries,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Pastry Product"
            });
        }

        const existingPastry = await PastryProduct.findOne({ name: data.name });
        if (existingPastry) {
            const existingPastries = await PastryProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Pastry", {
                layout: "admin/adminlayout",
                pastries: existingPastries,
                error: `A pastry product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Pastry Product"
            });
        }

        let newPastry = new PastryProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newPastry.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating pastry product:", error);
        let existingPastriesForError = [];
        try {
            existingPastriesForError = await PastryProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing pastries during error handling:", fetchErr);
        }

        return res.render("admin/Pastry", {
            layout: "admin/adminlayout",
            pastries: existingPastriesForError,
            error: "Failed to create pastry product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Pastry Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/pastry', async (req, res, next) => {
    try {
        const products = await PastryProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/pastry', { 
            products: processedProducts,
            pageTitle: 'All Pastry Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/pastry/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Pastry Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await PastryProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/pastry', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Add a new bread product (for admin use)
controller.post('/admin/pastry', async (req, res, next) => {
    try {
        const newProduct = new PastryProduct(req.body);
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
controller.put('/admin/pastry/:id', async (req, res, next) => {
    try {
        const updatedProduct = await PastryProduct.findByIdAndUpdate(
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
controller.delete('/admin/pastry/:id', async (req, res, next) => {
    try {
        const product = await PastryProduct.findByIdAndDelete(req.params.id);
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