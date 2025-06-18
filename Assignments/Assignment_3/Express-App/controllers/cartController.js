const express = require('express');
const router = express.Router();


// // Cart routes
router.get('/cart/items', (req, res) => {
    const cart = req.session.cart || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    res.json({ success: true, cart: cart, cartItemCount: totalItems });
});

router.post('/cart/add', (req, res) => {
    // Allow adding to cart even if not logged in; session will hold it.
    // If login is required for cart, uncomment and adjust the check:

    if (!req.session.user || req.session.user.isAdmin === 'admin') { // Allow 'user', disallow 'admin' or no user
        return res.status(401).json({ success: false, message: 'Please login to add items to your cart.', redirect: '/login' });
    }


    const { productId, productTitle, productPrice, productImage, quantity = 1 } = req.body;

    if (!productId || !productTitle || productPrice === undefined) {
        return res.status(400).json({ success: false, message: 'Missing product information.' });
    }

    if (!req.session.cart) {
        req.session.cart = [];
    }
    let cart = req.session.cart;
    const price = parseFloat(productPrice);
    const numQuantity = parseInt(quantity, 10);

    const existingItemIndex = cart.findIndex(item => item.id === productId);

    if (existingItemIndex > -1) {
        cart[existingItemIndex].quantity += numQuantity;
    } else {
        cart.push({
            id: productId,
            title: productTitle,
            price: price,
            image: productImage,
            quantity: numQuantity,
        });
    }

    req.session.save(err => {
        if (err) {
            console.error("Session save error on cart add:", err);
            return res.status(500).json({ success: false, message: 'Error saving cart to session.' });
        }
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        res.locals.cartItemCount = totalItems; // Update res.locals for subsequent requests in same cycle if needed
        res.json({ success: true, message: 'Item added to cart!', cartItemCount: totalItems, updatedCart: cart });
    });
});

// POST to update item quantity in cart
router.post('/cart/update', (req, res) => {
    const { productId, quantity } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }
    let cart = req.session.cart;
    const newQuantity = parseInt(quantity, 10);

    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        if (newQuantity > 0) {
            cart[itemIndex].quantity = newQuantity;
        } else {
            // If quantity is 0 or less, remove the item
            cart.splice(itemIndex, 1);
        }
        req.session.save(err => {
            if (err) {
                console.error("Session save error on cart update:", err);
                return res.status(500).json({ success: false, message: 'Error updating cart.' });
            }
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            res.locals.cartItemCount = totalItems;
            res.json({ success: true, message: 'Cart updated.', cartItemCount: totalItems, updatedCart: cart });
        });
    } else {
        res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }
});

// POST to remove item from cart
router.post('/cart/remove', (req, res) => {
    const { productId } = req.body;

    if (!req.session.cart) {
        req.session.cart = [];
    }
    let cart = req.session.cart;

    const itemIndex = cart.findIndex(item => item.id === productId);

    if (itemIndex > -1) {
        cart.splice(itemIndex, 1);
        req.session.save(err => {
            if (err) {
                console.error("Session save error on cart remove:", err);
                return res.status(500).json({ success: false, message: 'Error removing item from cart.' });
            }
            const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
            res.locals.cartItemCount = totalItems;
            res.json({ success: true, message: 'Item removed from cart.', cartItemCount: totalItems, updatedCart: cart });
        });
    } else {
        res.status(404).json({ success: false, message: 'Item not found in cart.' });
    }
});


router.get("/viewcart", (req, res) => {
    res.render("viewcart");
});

module.exports = router;