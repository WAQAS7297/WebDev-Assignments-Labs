const express = require("express");
const controller = express.Router();
const PizzaProduct = require('../models/pizzaProduct');
const path = require('path');

// Admin routes
controller.get("/admin/Pizza", async (req, res) => {
    try {
        const existingPizzas = await PizzaProduct.find().sort({ name: 1 });
        return res.render("admin/Pizza", {
            layout: "admin/adminlayout",
            pizzas: existingPizzas,
            pageTitle: "Create Pizza Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create pizza page:", error);
        return res.render("admin/Pizza", {
            layout: "admin/adminlayout",
            pizzas: [],
            error: "Failed to load the create pizza page. " + error.message,
            formData: {},
            pageTitle: "Create Pizza Product"
        });
    }
});

controller.post("/admin/Pizza", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingPizzas = await PizzaProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Pizza", {
                layout: "admin/adminlayout",
                pizzas: existingPizzas,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Pizza Product"
            });
        }

        const existingPizza = await PizzaProduct.findOne({ name: data.name });
        if (existingPizza) {
            const existingPizzas = await PizzaProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Pizza", {
                layout: "admin/adminlayout",
                pizzas: existingPizzas,
                error: `A pizza product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Pizza Product"
            });
        }

        let newPizza = new PizzaProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newPizza.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating pizza product:", error);
        let existingPizzasForError = [];
        try {
            existingPizzasForError = await PizzaProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing pizzas during error handling:", fetchErr);
        }

        return res.render("admin/Pizza", {
            layout: "admin/adminlayout",
            pizzas: existingPizzasForError,
            error: "Failed to create pizza product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Pizza Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/pizza', async (req, res, next) => {
    try {
        const products = await PizzaProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/pizza', { 
            products: processedProducts,
            pageTitle: 'All Pizza Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Get bread products by category
controller.get('/categories/pizza/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Pizza Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await PizzaProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/pizza', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

// Add a new bread product (for admin use)
controller.post('/admin/pizza', async (req, res, next) => {
    try {
        const newProduct = new PizzaProduct(req.body);
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
controller.put('/admin/pizza/:id', async (req, res, next) => {
    try {
        const updatedProduct = await PizzaProduct.findByIdAndUpdate(
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
controller.delete('/admin/pizza/:id', async (req, res, next) => {
    try {
        const product = await PizzaProduct.findByIdAndDelete(req.params.id);
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