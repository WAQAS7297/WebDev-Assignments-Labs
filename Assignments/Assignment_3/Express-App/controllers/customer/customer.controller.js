const express = require('express');
const router = express.Router();

// Example route for customer home page
router.get('/', (req, res) => {
    res.render('customer/home', { 
        layout: 'layout',
        user: req.session.user || null
    });
});

// Customer account page route
router.get('/account', (req, res) => {
    res.render('customer/account', { 
        layout: 'layout',
        user: req.session.user || null
    });
});

// Add more customer routes as needed

module.exports = router; 