const express = require("express");
const controller = express.Router();
const SnackProduct = require('../models/snackProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Snack", async (req, res) => {
    try {
        const existingSnacks = await SnackProduct.find().sort({ name: 1 });
        return res.render("admin/Snack", {
            layout: "admin/adminlayout",
            snacks: existingSnacks,
            pageTitle: "Create Snack Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create snack page:", error);
        return res.render("admin/Snack", {
            layout: "admin/adminlayout",
            snacks: [],
            error: "Failed to load the create snack page. " + error.message,
            formData: {},
            pageTitle: "Create Snack Product"
        });
    }
});

controller.post("/admin/Snack", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingSnacks = await SnackProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Snack", {
                layout: "admin/adminlayout",
                snacks: existingSnacks,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Snack Product"
            });
        }

        const existingSnack = await SnackProduct.findOne({ name: data.name });
        if (existingSnack) {
            const existingSnacks = await SnackProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Snack", {
                layout: "admin/adminlayout",
                snacks: existingSnacks,
                error: `A snack product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Snack Product"
            });
        }

        let newSnack = new SnackProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newSnack.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating snack product:", error);
        let existingSnacksForError = [];
        try {
            existingSnacksForError = await SnackProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing snacks during error handling:", fetchErr);
        }

        return res.render("admin/Snack", {
            layout: "admin/adminlayout",
            snacks: existingSnacksForError,
            error: "Failed to create snack product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Snack Product"
        });
    }
});

// Public routes and existing admin functions
// Get all bread products
controller.get('/categories/snack', async (req, res, next) => {
    try {
        const products = await SnackProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/snack', { 
            products: processedProducts,
            pageTitle: 'All Snack Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/snack/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Snack Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await SnackProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/snack', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Add a new bread product (for admin use)
controller.post('/admin/snack', async (req, res, next) => {
    try {
        const newProduct = new SnackProduct(req.body);
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
controller.put('/admin/snack/:id', async (req, res, next) => {
    try {
        const updatedProduct = await SnackProduct.findByIdAndUpdate(
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
controller.delete('/admin/snack/:id', async (req, res, next) => {
    try {
        const product = await SnackProduct.findByIdAndDelete(req.params.id);
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