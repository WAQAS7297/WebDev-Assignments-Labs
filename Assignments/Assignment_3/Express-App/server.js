let mongoose = require("mongoose");
let express = require("express");
let expressLayouts = require("express-ejs-layouts");
let server = express();
const session = require('express-session');
const path = require('path');
const breadController = require('./controllers/breadController');
const cakeController = require('./controllers/cakeController');
const snackController = require('./controllers/snackController');
const pizzaController = require('./controllers/pizzaController');
const biscuitController = require('./controllers/biscuitController');
const pastryController = require('./controllers/pastryController');
const donutController = require('./controllers/donutController');
const saladController = require('./controllers/saladController');
const sandwichController = require('./controllers/sandwichController');
const burgerController = require('./controllers/burgerController');
const nimkoController = require('./controllers/nimkoController');
const puffController = require('./controllers/puffController');
const giftingController = require('./controllers/giftingController');
const kanasController = require('./controllers/kanasController');
const packeditemController = require('./controllers/packeditemController');




// const authController = require('./controllers/admin/auth.controller');



server.use(express.static("public"));
server.use(expressLayouts);
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); // Add this for JSON parsing
server.set("view engine", "ejs");

// Set up session middleware
server.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

const Category = require("./models/categories.model"); 
const Gifting = require('./models/gifting.model'); 
const Carosel = require('./models/Carosel.model');
const User = require('./models/user.model');

// Import routes
server.use("/", require("./controllers/admin/admin.categories.controller"));
server.use("/", require("./controllers/admin/admin.carosel.controller"));
server.use("/", require("./controllers/admin/admin.gifting.controller"));
// server.use("/", require("./controllers/admin/auth.controller"));
server.use("/customer", require("./controllers/customer/customer.controller")); // Updated path

// Admin route
server.get("/admin", (req, res) => {
    res.render("admin/admin", { layout: "admin/adminlayout" });
});

server.get("/", async (req, res) => {
    try {
        let categories = await Category.find();
        let gifting = await Gifting.find();
        let fetchedCarouselItems = await Carosel.find(); 

        res.render("index", {
            categories,
            gifting,
            sliderItems: fetchedCarouselItems 
        });
    } catch (err) {
        console.error("❌ Error fetching data for homepage:", err);
        res.status(500).render("index", {
            categories: [],
            gifting: [], 
            sliderItems: [], 
            error: "Sorry, we couldn't load page content at the moment."
        });
    }
});

// server.get("/products", (req, res) => {
//     res.render("products", {
//         layout: false,
//         successMessage: req.query.successMessage || null,
//         errorMessage: req.query.errorMessage || null,
//         pageTitle: 'Admin Dashboard', 
//         pageTag: 'dashboard',
//     });
// });

server.get("/checkoutform", (req, res) => {
    res.render("checkoutform");
});

server.get("/cv", (req, res) => {
    res.render("cv");
});

server.get('/login', function(req, res) {
    
    res.render('login', { title: 'Login', layout: false });
});

/* GET register page */
server.get('/register', function(req, res) {
    res.render('register', { title: 'Register', layout: false });
});


mongoose.connect("mongodb://127.0.0.1:27017/Tehzeeb_Bakers").then(() => {
    console.log("connected to db");
});

server.listen(4000, () => {
    console.log("🚀 Server is running on http://localhost:4000");
});



// Register route
server.post('/register', async (req, res) => {
    try {
        console.log('Hello');
        if (req.body.password !== req.body.password_confirmation) {
            return res.render('register', {
                error: 'Passwords do not match',
                layout: false
            });
        }

        const existingUser = await User.findOne({ email: req.body.email });
        if (existingUser) {
            return res.render('register', {
                error: 'Email already registered',
                layout: false
            });
        }

        const user = new User({
            firstName: req.body.firstname,
            lastName: req.body.lastname,
            email: req.body.email,
            password: req.body.password,
            marketingConsent: req.body.marketing_consent === 'on'
        });

        await user.save();

        res.redirect('/login?success=Registration successful! Please login.');
    } catch (error) {
        console.error('Registration error:', error);
        res.render('register', {
            error: 'An error occurred during registration. Please try again.',
            layout: false
        });
    }
});

// Login route
server.post('/login', async (req, res) => {
    try {
        console.log('Hy')
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            return res.render('login', {
                error: 'Invalid email or password',
                layout: false
            });
        }

        const isMatch = await user.comparePassword(req.body.password);
        if (!isMatch) {
            return res.render('login', {
                error: 'Invalid email or password',
                layout: false
            });
        }

        req.session.user = {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email
        };

        res.redirect('/customer/account');
    } catch (error) {
        console.error('Login error:', error);
        res.render('login', {
            error: 'An error occurred during login. Please try again.',
            layout: false
        });
    }
});

// Cart routes
server.post('/cart/add', async (req, res) => {
    try {
        const { productId } = req.body;
        // TODO: Implement cart functionality
        // For now, just send success response
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error adding to cart:', error);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Bread Routes - SPECIFIC ROUTES FIRST
// server.get('/categories/:product/:category')
server.get('/categories/bread', breadController.getAllBreads);
server.get('/categories/bread/:category', breadController.getBreadsByCategory);
server.get('/categories/cakes', cakeController.getAllCake);
server.get('/categories/cakes/:category', cakeController.getCakesByCategory);
server.get('/categories/snack', snackController.getAllSnack);
server.get('/categories/snack/:category', snackController.getSnackByCategory);
server.get('/categories/pizza', pizzaController.getAllPizza);
server.get('/categories/pizza/:category', pizzaController.getPizzaByCategory);
server.get('/categories/biscuit', biscuitController.getAllBiscuit);
server.get('/categories/biscuit/:category', biscuitController.getBiscuitByCategory);
server.get('/categories/pastry', pastryController.getAllPastry);
server.get('/categories/pastry/:category', pastryController.getPastryByCategory);
server.get('/categories/donut', donutController.getAlldonut);
server.get('/categories/donut/:category', donutController.getDonutByCategory);
server.get('/categories/salad', saladController.getAllSalad);
server.get('/categories/salad/:category', saladController.getSaladByCategory);
server.get('/categories/sandwich', sandwichController.getAllSandwich);
server.get('/categories/sandwich/:category', sandwichController.getSandwichByCategory);
server.get('/categories/burger', burgerController.getAllBurger);
server.get('/categories/burger/:category', burgerController.getBurgerByCategory);
server.get('/categories/nimko', nimkoController.getAllNimko);
server.get('/categories/nimko/:category', nimkoController.getNimkoByCategory);
server.get('/categories/puff', puffController.getAllPuff);
server.get('/categories/puff/:category', puffController.getPuffByCategory);
server.get('/categories/gifting', giftingController.getAllGifting);
server.get('/categories/gifting/:category', giftingController.getGiftingByCategory);
server.get('/categories/Kanas Ketchup', kanasController.getAllKanas);
server.get('/categories/Kanas Ketchup/:category', kanasController.getKanasByCategory);
server.get('/categories/Packed Items', packeditemController.getAllPacked);
server.get('/categories/Packed Items/:category', packeditemController.getPackedItemsByCategory);




// Generic category route - AFTER SPECIFIC ROUTES
server.get("/categories/:categoryName", async (req, res) => {
    const categoryName = req.params.categoryName;

    try {
        // Check if view file exists in views/categories folder
        const viewPath = path.join(__dirname, "views", "categories", `${categoryName}.ejs`);
        const fs = require("fs");

        if (!fs.existsSync(viewPath)) {
            return res.status(404).render("404", { 
                pageTitle: "Page Not Found",
                message: "Category page not found." 
            });
        }

        // Capitalize category name for the title
        const pageTitle = categoryName.charAt(0).toUpperCase() + categoryName.slice(1) + " Products";
        
        res.render(`categories/${categoryName}`, {
            pageTitle: pageTitle,
            currentCategory: 'all'
        });
    } catch (error) {
        console.error("Error loading category page:", error);
        next(error);
    }
});

// Admin Routes for Bread Products
server.post('/admin/bread', breadController.addBreadProduct);
server.put('/admin/bread/:id', breadController.updateBreadProduct);
server.delete('/admin/bread/:id', breadController.deleteBreadProduct);


// Error handling middleware
server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', { 
        message: 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {},
        pageTitle: 'Error'
    });
});

// 404 handler
server.use((req, res) => {
    res.status(404).render('404', { 
        message: 'Page not found',
        pageTitle: 'Page Not Found'
    });
});
