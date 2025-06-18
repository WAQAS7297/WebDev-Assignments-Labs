const User = require('../models/users.model');

exports.getAccount = async (req, res, next) => {
    try {
        // Check if user is logged in
        if (!req.session.user) {
            return res.redirect('/login');
        }

        // Fetch user details from database
        const user = await User.findById(req.session.user.id);
        if (!user) {
            return res.redirect('/login');
        }

        // Fetch orders for this user
        const orders = await Order.find({ userId: user._id })
            .sort({ createdAt: -1 })
            .limit(5);

        // Fetch wishlist items
        const wishlist = await Product.find({ _id: { $in: user.wishlist } });

        // Fetch addresses
        const addresses = user.addresses || [];

        res.render('customer/account', {
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                createdAt: user.createdAt
            },
            orders,
            wishlist,
            addresses,
            layout: 'layout' // Use the main layout
        });
    } catch (error) {
        console.error('Error fetching user account:', error);
        next(error);
    }
};
