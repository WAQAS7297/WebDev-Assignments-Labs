const express = require('express');
const router = express.Router();
const middleware = require('../../middleware/middleware');
const Order = require('../../models/Order.model');
const orderController = require('../../controllers/orderController');


router.get('/admin/adminmyorders', middleware.ensureAdmin, async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/loginadmin');
        }

        const orders = await Order.find()
            .sort({ orderDate: -1 })
            .populate('userId', 'firstName lastName email');

        res.render('admin/adminmyorders', {
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
            pageTitle: 'Error'
        });
    }
});

router.get('/admin/adminmyorders', async (req, res) => {
    if (!req.session.user || req.session.user.isAdmin !== 'admin') {
      return res.redirect('/loginadmin');
    }
  
    try {
      const orders = await Order.find();
      res.render('admin/adminmyorders', { orders });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });
  
  router.post('/admin/adminmyorders/status/:id', async (req, res) => {
    const { status } = req.body;
    try {
      await Order.findByIdAndUpdate(req.params.id, { status });
      res.redirect('/admin/adminmyorders');
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  });

router.post('/admin/adminmyorders/status/:id', middleware.ensureAdmin, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        
        // Call the controller method to update order status
        await orderController.updateOrderStatus({ params: { id: orderId }, body: { status } }, res);
    } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ success: false, message: 'Failed to update order status' });
    }
});


module.exports = router;