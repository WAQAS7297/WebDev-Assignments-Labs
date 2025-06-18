const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const Admin = require('../../models/admin.model');

router.get('/loginadmin', (req, res) => {
    res.render('admin/loginadmin',{ layout: false });
});

router.post('/loginadmin', async (req, res) => {
    const { email, password } = req.body;

    try {
        const admin = await Admin.findOne({ email });

        if (!admin) {
            return res.send('User not found');
        }

        const isMatch = await bcrypt.compare(password, admin.password);

        if (!isMatch) {
            return res.send('Incorrect password');
        }

        req.session.user = {
            id: admin._id,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            isAdmin: admin.isAdmin
        };
        return res.redirect('/admin');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server error');
    }
});

router.get('/logout', (req, res) => {
    const redirectPath = req.session?.user?.isAdmin === 'user' ? '/login' : '/loginadmin';

    req.session.destroy(err => {
        if (err) {
            console.error('Logout error:', err);
            return res.send('Error logging out');
        }
        res.redirect(redirectPath);
    });
});

module.exports = router;