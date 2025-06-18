// // product_server.js

// const express = require('express');
// const router = express.Router();
// const mongoose = require('mongoose');

// // Schema Definition
// const productSchema = new mongoose.Schema({
//     name: String,
//     price: Number,
//     description: String
// });

// // Model
// const Product = mongoose.model("Product", productSchema);

// // Display All Products
// router.get("/", async (req, res) => {
//     const products = await Product.find();
//     res.render("products", { products });
// });

// // Form to Add Product
// router.get("/new", (req, res) => {
//     res.render("new_product");
// });

// // Handle Form Submission
// router.post("/new", async (req, res) => {
//     const { name, price, description } = req.body;
//     const product = new Product({ name, price, description });
//     await product.save();
//     res.redirect("/products");
// });

// module.exports = router;
