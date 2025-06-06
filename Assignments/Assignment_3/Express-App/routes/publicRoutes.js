// routes/publicRoutes.js
const express = require('express');
const router = express.Router();
const Product = require('../models/productsmodel'); // Assuming models is one level up from routes

// Homepage route
router.get("/", async (req, res) => {
    try {
        let products = await Product.find().limit(8);
        console.log(`Fetched ${products.length} products for homepage.`);
        res.render("index", { // Assuming index.ejs is your homepage
            products: products,
            error: req.flash('error_msg')[0] || null, // Pass flash error if any
            layout: false // If index.ejs is a full HTML page
        });
    } catch (err) {
        console.error("❌ Error fetching products for homepage:", err);
        req.flash('error_msg', "Sorry, we couldn't load our products at the moment.");
        res.redirect('/'); // Or render an error page
    }
});

router.get("/checkoutform", (req, res) => {
    res.render("checkoutform", { layout: false }); // Assuming full page
});

router.get("/cv", (req, res) => {
    res.render("cv", { layout: false }); // Assuming full page
});

router.get("/index_without_bootstrap", (req, res) => {
    res.render("index_without_bootstrap", { layout: false }); // Assuming full page
});

// Add other public routes here

module.exports = router;