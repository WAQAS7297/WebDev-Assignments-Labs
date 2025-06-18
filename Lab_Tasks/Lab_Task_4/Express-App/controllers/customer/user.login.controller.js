const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const User = require('../../models/users.model');

router.get('/login', (req, res) => {
    res.render('login', { layout: false });
});


// router.get('/customer/account', (req, res) => {
//     res.render('customer/account');
// });

router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.send('User not found');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.send('Incorrect password');
        }

        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            isAdmin: user.isAdmin
        };
        return res.redirect('/');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/logout', (req, res) => {
    const redirectPath = req.session?.user?.isAdmin === 'admin' ? '/loginadmin' : '/login';

    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.send('Error logging out');
        }
        res.redirect(redirectPath);
    });
});


module.exports = router;