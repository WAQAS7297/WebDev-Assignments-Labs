const express = require('express');
const router = express.Router();
const Category = require("../models/categories.model");
const Gifting = require('../models/gifting.model');
const Carosel = require('../models/Carosel.model');
const Order = require('../models/Order.model');
const middleware = require('../middleware/middleware');
const path = require('path');
const fs = require('fs');

// Homepage
router.get("/", async (req, res) => {
    try {
        let categories = await Category.find();
        let gifting = await Gifting.find();
        let fetchedCarouselItems = await Carosel.find();

        res.render("index", {
            categories,
            gifting,
            sliderItems: fetchedCarouselItems
        });
    } catch (err) {
        console.error("❌ Error fetching data for homepage:", err);
        res.status(500).render("index", {
            categories: [],
            gifting: [],
            sliderItems: [],
            error: "Sorry, we couldn't load page content at the moment."
        });
    }
});

// CV Page
router.get("/cv", (req, res) => {
    res.render("cv");
});

// Customer Account Page
router.get('/customer/account', async (req, res) => {
    try {
        if (!req.session.user) return res.redirect('/login');
        
        const userEmail = req.session.user.email?.trim().toLowerCase();
        const count = await Order.find({ userEmail }).countDocuments();
        res.render('customer/account', { order: count });
    } catch (error) {
        console.error('Error fetching order count:', error);
        res.status(500).send('Internal Server Error');
    }
});

// Checkout Form
router.get("/checkoutform", middleware.ensureAuthenticatedUser, async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect("/viewcart");
    }

    const userData = req.session.user;
    const cartItems = req.session.cart;
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0;
    const tax = subtotal * 0.17;
    const total = subtotal + shipping + tax;

    cartItems.forEach(item => {
        if (!item.image) {
            item.image = "https://tehzeeb.com/media/catalog/product/cache/6ae3a50c5c0313a15177419915526b1d/b/l/black_forest_cake_1.jpg";
        }
    });

    res.render("checkoutform", {
        layout: true,
        user: userData,
        cartItems,
        subtotal,
        shipping,
        tax,
        total
    });
});

// Dynamic Category Pages
router.get("/categories/:categoryName", async (req, res, next) => {
    const categoryName = req.params.categoryName;
    try {
        const viewPath = path.join(__dirname, "../views/categories", `${categoryName}.ejs`);
        if (!fs.existsSync(viewPath)) {
            return res.status(404).render("404", {
                pageTitle: "Page Not Found",
                message: "Category page not found."
            });
        }

        const pageTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1) + " Products";

        res.render(`categories/${categoryName}`, {
            pageTitle: pageTitle,
            currentCategory: 'all'
        });
    } catch (error) {
        console.error("Error loading category page:", error);
        next(error);
    }
});

module.exports = router;
