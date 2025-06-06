const express = require('express');
const router = express.Router();
const Category = require('../../models/categories.model');

// Add default categories route
router.get('/admin/categories/add-defaults', async (req, res) => {
    try {
        const defaultCategories = [
            {
                name: 'Bread',
                image: '/images/categories/bread.jpg',
                pagelink: '/categories/bread',
                alt_text: 'Fresh Bread',
                title: 'Fresh Bread Collection'
            },
            {
                name: 'Cakes',
                image: '/images/categories/cakes.jpg',
                pagelink: '/categories/cakes',
                alt_text: 'Delicious Cakes',
                title: 'Cake Collection'
            },
            {
                name: 'Pizza',
                image: '/images/categories/pizza.jpg',
                pagelink: '/categories/pizza',
                alt_text: 'Fresh Pizza',
                title: 'Pizza Collection'
            },
            {
                name: 'Salad',
                image: '/images/categories/salad.jpg',
                pagelink: '/categories/salad',
                alt_text: 'Fresh Salads',
                title: 'Salad Collection'
            },
            {
                name: 'Sandwich',
                image: '/images/categories/sandwich.jpg',
                pagelink: '/categories/sandwich',
                alt_text: 'Fresh Sandwiches',
                title: 'Sandwich Collection'
            },
            {
                name: 'Burger',
                image: '/images/categories/burger.jpg',
                pagelink: '/categories/burger',
                alt_text: 'Fresh Burgers',
                title: 'Burger Collection'
            },
            {
                name: 'Nimko',
                image: '/images/categories/nimko.jpg',
                pagelink: '/categories/nimko',
                alt_text: 'Fresh Nimko',
                title: 'Nimko Collection'
            },
            {
                name: 'Puff',
                image: '/images/categories/puff.jpg',
                pagelink: '/categories/puff',
                alt_text: 'Fresh Puffs',
                title: 'Puff Collection'
            },
            {
                name: 'Gifting',
                image: '/images/categories/gifting.jpg',
                pagelink: '/categories/gifting',
                alt_text: 'Gift Collections',
                title: 'Gift Collection'
            },
            {
                name: 'Kanas',
                image: '/images/categories/kanas.jpg',
                pagelink: '/categories/kanas',
                alt_text: 'Fresh Kanas',
                title: 'Kanas Collection'
            },
            {
                name: 'Ketchup',
                image: '/images/categories/ketchup.jpg',
                pagelink: '/categories/ketchup',
                alt_text: 'Ketchup Collection',
                title: 'Ketchup Collection'
            },
            {
                name: 'Packed Items',
                image: '/images/categories/packed.jpg',
                pagelink: '/categories/packed',
                alt_text: 'Packed Items',
                title: 'Packed Items Collection'
            }
        ];

        // Clear existing categories
        await Category.deleteMany({});
        
        // Add new categories
        await Category.insertMany(defaultCategories);

        res.json({ 
            success: true, 
            message: 'Default categories added successfully',
            categories: defaultCategories
        });
    } catch (error) {
        console.error('Error adding default categories:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error adding default categories',
            error: error.message
        });
    }
});

// Get all categories
router.get('/admin/categories', async (req, res) => {
    try {
        const categories = await Category.find();
        res.json(categories);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ error: 'Error fetching categories' });
    }
});

// Add new category
router.post('/admin/categories', async (req, res) => {
    try {
        const category = new Category(req.body);
        await category.save();
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error adding category:', error);
        res.status(500).json({ error: 'Error adding category' });
    }
});

// Update category
router.put('/admin/categories/:id', async (req, res) => {
    try {
        const category = await Category.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.json({ success: true, category });
    } catch (error) {
        console.error('Error updating category:', error);
        res.status(500).json({ error: 'Error updating category' });
    }
});

// Delete category
router.delete('/admin/categories/:id', async (req, res) => {
    try {
        await Category.findByIdAndDelete(req.params.id);
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ error: 'Error deleting category' });
    }
});

module.exports = router;