const BreadProduct = require('../models/breadProduct');
const path = require('path');

// Get all bread products
exports.getAllBreads = async (req, res, next) => {
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
};

// Get bread products by category
exports.getBreadsByCategory = async (req, res, next) => {
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
};

// Add a new bread product (for admin use)
exports.addBreadProduct = async (req, res, next) => {
    try {
        const newProduct = new BreadProduct(req.body);
        await newProduct.save();
        res.status(201).json({ 
            success: true, 
            message: 'Product added successfully',
            product: newProduct 
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
};

// Update a bread product (for admin use)
exports.updateBreadProduct = async (req, res, next) => {
    try {
        const updatedProduct = await BreadProduct.findByIdAndUpdate(
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
};

// Delete a bread product (for admin use)
exports.deleteBreadProduct = async (req, res, next) => {
    try {
        const product = await BreadProduct.findByIdAndDelete(req.params.id);
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
}; 