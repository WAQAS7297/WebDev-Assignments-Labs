// controllers/orderController.js
const express = require("express");
const controller = express.Router();
const Order = require('../models/Order.model');
const middleware = require('../middleware/middleware');

// Controller methods
const orderController = {
    /**
     * @desc    Place a new order
     * @route   POST /api/orders (or similar, this function will be called by your route)
     * @access  Private (User must be logged in)
     */
    placeOrder: async (req, res, next) => {
        // Assumes user and cart are already validated and available from session by the route handler
        const { user, cart } = req.session;
        const { phone, address, paymentMethod /* , cardNumber, cvv, expiry */ } = req.body;

        if (!cart || cart.length === 0) {
            // This check might also be done in the route before calling this controller
            return res.status(400).json({ success: false, message: 'Your cart is empty.' });
        }

        try {
            const orderItems = cart.map(item => ({
                productId: item.id, // Assuming 'id' is the productId from your client-side cart
                name: item.title,
                quantity: item.quantity,
                price: item.price,
                image: item.image,
            }));

            const totalAmount = cart.reduce((acc, item) => acc + item.quantity * item.price, 0);

            const newOrder = new Order({
                userId: user.id, // Assuming user object in session has an 'id'
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email,
                phone,
                address,
                paymentMethod,
                isCod: paymentMethod === 'cod',
                // Note: Storing raw card details is generally not recommended for PCI compliance.
                // cardNumber: paymentMethod === 'card' ? cardNumber : null,
                // cvv: paymentMethod === 'card' ? cvv : null,
                // expiry: paymentMethod === 'card' ? expiry : null,
                cartItems: orderItems,
                totalAmount: totalAmount,
                status: 'Pending', // Default status
            });

            const savedOrder = await newOrder.save();

            // Clear the cart from the session after successful order placement
            req.session.cart = [];
            req.session.save(err => {
                if (err) {
                    // Log the error but proceed as the order is already saved
                    console.error('Session save error after clearing cart:', err);
                }
                // It's better to respond with JSON if this is an API endpoint
                // and let the client handle redirection or UI update.
                res.status(201).json({
                    success: true,
                    message: 'Order placed successfully!',
                    order: savedOrder,
                });
            });

        } catch (error) {
            console.error('Error placing order:', error);
            next(error); // Pass to global error handler
        }
    },

    /**
     * @desc    Get all orders (for Admin)
     * @route   GET /api/orders/all (or similar)
     * @access  Private/Admin
     */
    getAllOrders: async (req, res, next) => {
        try {
            const orders = await Order.find({})
                .populate('userId', 'firstName lastName email') // Populate user details
                .sort({ orderDate: -1 }); // Sort by newest first
            res.json({ success: true, count: orders.length, orders });
        } catch (error) {
            console.error('Error fetching all orders:', error);
            next(error);
        }
    },

    /**
     * @desc    Get logged-in user's orders
     * @route   GET /api/orders/myorders (or similar)
     * @access  Private
     */
    getMyOrders: async (req, res, next) => {
        try {
            // Assuming user ID is available in req.session.user.id
            if (!req.session.user || !req.session.user.id) {
                return res.status(401).json({ success: false, message: 'Not authorized, no user session.' });
            }
            const orders = await Order.find({ userId: req.session.user.id }).sort({ orderDate: -1 });
            res.json({ success: true, count: orders.length, orders });
        } catch (error) {
            console.error('Error fetching user orders:', error);
            next(error);
        }
    },

    /**
     * @desc    Get order by ID
     * @route   GET /api/orders/:id (or similar)
     * @access  Private (User or Admin)
     */
    getOrderById: async (req, res, next) => {
        try {
            const order = await Order.findById(req.params.id).populate(
                'userId',
                'firstName lastName email'
            );

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            // Authorization: Check if the logged-in user is the owner or an admin
            if (req.session.user && (order.userId.toString() === req.session.user.id.toString() || req.session.user.isAdmin === 'admin')) {
                res.json({ success: true, order });
            } else {
                return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
            }

        } catch (error) {
            console.error('Error fetching order by ID:', error);
            if (error.kind === 'ObjectId') { // Handle invalid MongoDB ID format
                return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
            }
            next(error);
        }
    },

    /**
     * @desc    Update order status (e.g., to Shipped, Delivered - for Admin)
     * @route   PUT /api/orders/:id/status (or similar)
     * @access  Private/Admin
     */
    updateOrderStatus: async (req, res, next) => {
        const { status } = req.body;
        // You might want to validate the status against a predefined list
        const allowedStatuses = ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled', 'Not Completed'];
        if (!status || !allowedStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: `Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}` });
        }

        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            order.status = status;
            // if (status === 'Delivered') {
            //     order.deliveredAt = Date.now();
            // } // Example: set delivery date

            const updatedOrder = await order.save();
            res.json({ success: true, message: 'Order status updated.', order: updatedOrder });
        } catch (error) {
            console.error('Error updating order status:', error);
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
            }
            next(error);
        }
    },

    /**
     * @desc    Cancel an order (for User, if status allows)
     * @route   PUT /api/orders/:id/cancel
     * @access  Private
     */
    cancelOrder: async (req, res, next) => {
        try {
            const order = await Order.findById(req.params.id);

            if (!order) {
                return res.status(404).json({ success: false, message: 'Order not found.' });
            }

            // Check if the logged-in user is the owner
            if (!req.session.user || order.userId.toString() !== req.session.user.id.toString()) {
                return res.status(403).json({ success: false, message: 'Not authorized to cancel this order.' });
            }

            // Business logic: Only allow cancellation if order is in 'Pending' status (example)
            if (order.status !== 'Pending') {
                return res.status(400).json({ success: false, message: `Order cannot be cancelled. Current status: ${order.status}` });
            }

            order.status = 'Cancelled';
            const updatedOrder = await order.save();
            res.json({ success: true, message: 'Order cancelled successfully.', order: updatedOrder });

        } catch (error) {
            console.error('Error cancelling order:', error);
            if (error.kind === 'ObjectId') {
                return res.status(400).json({ success: false, message: 'Invalid order ID format.' });
            }
            next(error);
        }
    }
};

// Mount routes using the controller methods
controller.post('/api/orders', orderController.placeOrder);
controller.get('/api/orders/all', orderController.getAllOrders);
controller.get('/api/orders/myorders', orderController.getMyOrders);
controller.get('/api/orders/:id', orderController.getOrderById);
controller.put('/api/orders/:id/status', orderController.updateOrderStatus);
controller.put('/api/orders/:id/cancel', orderController.cancelOrder);

// Admin routes
controller.get("/admin/orders", async (req, res) => {
    try {
        const allOrders = await Order.find({}).populate('userId', 'firstName lastName email').sort({ orderDate: -1 });
        res.render('admin/allOrdersPage', {
            layout: "admin/adminlayout",
            orders: allOrders,
            pageTitle: "Manage Orders"
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).render('error', { error: "Failed to fetch orders" });
    }
});


controller.post("/placeOrder", async (req, res) => {
    try {
        // Ensure user is logged in
        if (!req.session.user) {
            return res.status(401).json({
                success: false,
                message: "Please login to place an order"
            });
        }

        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            paymentMethod,
            cardNumber,
            expiry,
            cvv
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !phone || !address) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be filled"
            });
        }

        // Validate payment method
        if (paymentMethod !== 'card' && paymentMethod !== 'cod') {
            return res.status(400).json({
                success: false,
                message: "Invalid payment method"
            });
        }

        // Get cart from session
        const cart = req.session.cart || [];
        if (cart.length === 0) {
            return res.status(400).json({
                success: false,
                message: "Cart is empty"
            });
        }

        // Calculate totals
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = 0; // Free shipping
        const tax = subtotal * 0.17; // 17% tax
        const total = subtotal + shipping + tax;

        // Validate card details if payment method is card
        if (paymentMethod === 'card') {
            if (!cardNumber || !expiry || !cvv) {
                return res.status(400).json({
                    success: false,
                    message: "Card details are required for card payment"
                });
            }
        }

        // Create order
        const newOrder = new Order({
            userId: req.session.user.id,
            userName: `${firstName} ${lastName}`,
            userEmail: email,
            phone,
            address,
            paymentMethod,
            isCod: paymentMethod === 'cod',
            cartItems: cart.map(item => ({
                productId: item.productId,
                name: item.name,
                quantity: item.quantity,
                price: item.price,
                image: item.image || "default-product.png"
            })),
            totalAmount: total,
            status: "Processing"
        });

        // Save order to database
        const savedOrder = await newOrder.save();

        // Clear cart from session
        req.session.cart = [];

        // Send success response
        res.json({
            success: true,
            message: "Order placed successfully!",
            orderId: savedOrder._id,
            paymentMethod: paymentMethod
        });

    } catch (error) {
        console.error("Error placing order:", error);
        res.status(500).json({
            success: false,
            message: "An error occurred while placing your order"
        });
    }
});

controller.get('/order/success', (req, res) => {
    // Clear cart from session
    req.session.cart = [];

    // Get order details from query parameters
    const orderId = req.query.orderId;
    const paymentMethod = req.query.paymentMethod;

    // Render success page
    res.render("ordersuccess", {
        layout: false,
        title: "Order Success",
        user: req.session.user,
        orderId: orderId,
        paymentMethod: paymentMethod
    });
});

controller.get('/myorders', middleware.ensureAuthenticatedUser, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }

        const orders = await Order.find({ userId: req.session.user.id })
            .sort({ orderDate: -1 })
            .populate('userId', 'firstName lastName email'); // Changed from 'User' to 'Users'

        res.render('myorders', {
            layout: false,
            title: 'My Orders',
            user: req.session.user,
            orders: orders
        });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).render('error', {
            layout: false,
            title: 'Error',
            message: 'Error fetching your orders',
            error: error,
            pageTitle: 'Error'  // Add pageTitle for error page
        });
    }
});

module.exports = controller;
