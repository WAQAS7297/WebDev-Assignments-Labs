// routes/adminRoutes.js
const express = require('express');
const router = express.Router();
const adminProductController = require('../controllers/admin/adminProductController'); // Adjust path

// Middleware to protect admin routes (Example - implement actual auth later)
// const isAdmin = (req, res, next) => {
//     if (req.isAuthenticated() && req.user.role === 'admin') { // Example with Passport.js
//         return next();
//     }
//     req.flash('error_msg', 'Please log in as an admin to view this resource.');
//     res.redirect('/login'); // Or your admin login page
// };
// router.use(isAdmin); // Apply to all admin routes

// Product Management Routes
// GET /admin/products - Main admin page (list and add/edit form)
router.get('/products', adminProductController.getProductsPage);

// POST /admin/products - Add a new product
router.post('/products', adminProductController.postAddProduct);

// POST /admin/products/edit/:productId - Update an existing product
router.post('/products/edit/:productId', adminProductController.postEditProduct);

// POST /admin/products/delete/:productId - Delete a product
router.post('/products/delete/:productId', adminProductController.postDeleteProduct);

// Default admin route, could redirect to products or show a dashboard
router.get('/', (req, res) => {
    res.redirect('/admin/products');
});

module.exports = router;