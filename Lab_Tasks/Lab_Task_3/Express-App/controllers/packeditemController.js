const express = require("express");
const controller = express.Router();
const PackedItemProduct = require('../models/packeditemsProduct');
const path = require('path');

// Admin routes
controller.get("/admin/PackedItem", async (req, res) => {
    try {
        const existingPackedItems = await PackedItemProduct.find().sort({ name: 1 });
        return res.render("admin/PackedItem", {
            layout: "admin/adminlayout",
            packeditems: existingPackedItems,
            pageTitle: "Create Packed Item Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create packed item page:", error);
        return res.render("admin/PackedItem", {
            layout: "admin/adminlayout",
            packeditems: [],
            error: "Failed to load the create packed item page. " + error.message,
            formData: {},
            pageTitle: "Create Packed Item Product"
        });
    }
});

controller.post("/admin/PackedItem", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingPackedItems = await PackedItemProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/PackedItem", {
                layout: "admin/adminlayout",
                packeditems: existingPackedItems,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Packed Item Product"
            });
        }

        const existingPackedItem = await PackedItemProduct.findOne({ name: data.name });
        if (existingPackedItem) {
            const existingPackedItems = await PackedItemProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/PackedItem", {
                layout: "admin/adminlayout",
                packeditems: existingPackedItems,
                error: `A packed item product with the name "${data.name}" already exists.`,
                formData: data,
                pageTitle: "Create Packed Item Product"
            });
        }

        let newPackedItem = new PackedItemProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newPackedItem.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating packed item product:", error);
        let existingPackedItemsForError = [];
        try {
            existingPackedItemsForError = await PackedItemProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing packed items during error handling:", fetchErr);
        }

        return res.render("admin/PackedItem", {
            layout: "admin/adminlayout",
            packeditems: existingPackedItemsForError,
            error: "Failed to create packed item product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Packed Item Product"
        });
    }
});

// Public routes and existing admin functions

// Get all bread products
controller.get('/categories/Packed_Items',async (req, res, next) => {
    try {
        console.log("hello ");
        const products = await PackedItemProduct.find();
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

        res.render('categories/Packed_Items', { 
            products: processedProducts,
            pageTitle: 'All Packed Items Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});
controller.get('/categories/Packed_Items/:category',async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All PackedItems Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await PackedItemProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/Packed_Items', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});



module.exports = controller;