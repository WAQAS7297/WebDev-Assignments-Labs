// const User = require('../models/users.model');
// const bcrypt = require('bcryptjs');

// exports.getLogin = (req, res) => {
//     res.render('login', {
//         layout: 'layout'
//     });
// };

// exports.postLogin = async (req, res) => {
//     try {
//         const { email, password } = req.body;

//         // Find user by email
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(401).render('login', {
//                 layout: 'layout',
//                 error: 'Invalid email or password'
//             });
//         }

//         // Verify password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             return res.status(401).render('login', {
//                 layout: 'layout',
//                 error: 'Invalid email or password'
//             });
//         }

//         // Set session
//         req.session.user = {
//             id: user._id,
//             name: user.name,
//             email: user.email,
//             phone: user.phone,
//             isAdmin: user.isAdmin
//         };

//         // Redirect to appropriate page based on user role
//         if (user.isAdmin === 'admin') {
//             res.redirect('/admin/dashboard');
//         } else {
//             res.redirect('/customer/account');
//         }
//     } catch (error) {
//         console.error('Login error:', error);
//         res.status(500).render('login', {
//             layout: 'layout',
//             error: 'An error occurred during login'
//         });
//     }
// };
