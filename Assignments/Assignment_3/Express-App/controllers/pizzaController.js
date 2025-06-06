const PizzaProduct = require('../models/pizzaProduct');
const path = require('path');

// Get all bread products
exports.getAllPizza = async (req, res, next) => {
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
};

// Get bread products by category
exports.getPizzaByCategory = async (req, res, next) => {
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
};

// Add a new bread product (for admin use)
exports.addPizzaProduct = async (req, res, next) => {
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
};

// Update a bread product (for admin use)
exports.updatePizzaProduct = async (req, res, next) => {
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
};

// Delete a bread product (for admin use)
exports.deletePizzaProduct = async (req, res, next) => {
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
}; 