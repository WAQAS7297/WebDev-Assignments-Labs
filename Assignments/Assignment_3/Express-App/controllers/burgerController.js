const BurgerProduct = require('../models/burgerProduct');
const path = require('path');

// Get all bread products
exports.getAllBurger = async (req, res, next) => {
    try {
        const products = await BurgerProduct.find();
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/burger', { 
            products: processedProducts,
            pageTitle: 'All Burger Products',
            currentCategory: 'all'
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
};

// Get bread products by category
exports.getBurgerByCategory = async (req, res, next) => {
    try {
        const category = req.params.category;
        let query = {};
        let pageTitle = 'All Burger Products';
        
        // If category is not 'all', filter by category
        if (category !== 'all') {
            query = { category: category };
            // Capitalize first letter of category for title
            pageTitle = category.charAt(0).toUpperCase() + category.slice(1) + ' Products';
        }

        const products = await BurgerProduct.find(query);
        
        // Process products to ensure image paths are correct
        const processedProducts = products.map(product => {
            const productObj = product.toObject();
            // Ensure image path starts with /
            if (productObj.image && !productObj.image.startsWith('/')) {
                productObj.image = '/' + productObj.image;
            }
            return productObj;
        });

        res.render('categories/burger', { 
            products: processedProducts,
            pageTitle,
            currentCategory: category
        });
    } catch (error) {
        next(error); // Pass error to express error handler
    }
};

// Add a new bread product (for admin use)
exports.addBurgerProduct = async (req, res, next) => {
    try {
        const newProduct = new BurgerProduct(req.body);
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
exports.updateBurgerProduct = async (req, res, next) => {
    try {
        const updatedProduct = await BurgerProduct.findByIdAndUpdate(
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
exports.deleteBurgerProduct = async (req, res, next) => {
    try {
        const product = await BurgerProduct.findByIdAndDelete(req.params.id);
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