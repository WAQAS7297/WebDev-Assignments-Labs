const express = require("express");
const controller = express.Router();
const BreadProduct = require("../models/breadProduct");

// Admin routes
controller.get("/admin/Bread", async (req, res) => {
    try {
        const existingBreads = await BreadProduct.find().sort({ name: 1 });
        return res.render("admin/Bread", {
            layout: "admin/adminlayout",
            breads: existingBreads,
            pageTitle: "Create Bread Product",
            formData: {},
            error: null
        });
    } catch (error) {
        console.error("Error preparing create bread page:", error);
        return res.render("admin/Bread", {
            layout: "admin/adminlayout",
            breads: [],
            error: "Failed to load the create bread page. " + error.message,
            formData: {},
            pageTitle: "Create Bread Product"
        });
    }
});

controller.post("/admin/Bread", async (req, res) => {
    let data = req.body;
    try {
        if (!data.name || !data.image || !data.price) {
            const existingBreads = await BreadProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Bread", {
                layout: "admin/adminlayout",
                breads: existingBreads,
                error: "Name, Image URL, and Price are required.",
                formData: data,
                pageTitle: "Create Bread Product"
            });
        }

        const existingBread = await BreadProduct.findOne({ name: data.name });
        if (existingBread) {
            const existingBreads = await BreadProduct.find().sort({ name: 1 }).catch(() => []);
            return res.render("admin/Bread", {
                layout: "admin/adminlayout",
                breads: existingBreads,
                error: "A bread product with the name " + data.name + " already exists.",
                formData: data,
                pageTitle: "Create Bread Product"
            });
        }

        let newBread = new BreadProduct({
            name: data.name,
            image: data.image,
            price: data.price,
            description: data.description,
            category: data.category
        });

        await newBread.save();
        return res.redirect("/admin");

    } catch (error) {
        console.error("Error creating bread product:", error);
        let existingBreadsForError = [];
        try {
            existingBreadsForError = await BreadProduct.find().sort({ name: 1 });
        } catch (fetchErr) {
            console.error("Error fetching existing breads during error handling:", fetchErr);
        }

        return res.render("admin/Bread", {
            layout: "admin/adminlayout",
            breads: existingBreadsForError,
            error: "Failed to create bread product. Please try again. " + error.message,
            formData: data,
            pageTitle: "Create Bread Product"
        });
    }
});


// Public routes


controller.get('/categories/bread',async (req, res, next) => {
    try {
        const products = await BreadProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/bread', { 
            products: processedProducts,
            pageTitle: 'All Bread Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});

controller.get('/categories/bread/:category', async (req, res, next) => {
    try {
        const category = req.params.category;
        // const product = req.params.product;
        let query = {};
        let pageTitle = 'All Bread Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await BreadProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/bread', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
});




module.exports = controller;




