let mongoose = require("mongoose");
let express = require("express");
let expressLayouts = require("express-ejs-layouts");
let server = express();
const session = require('express-session');
const path = require('path');
const Order = require('./models/Order.model');
const middleware = require('./middleware/middleware');

server.use(express.static("public"));
server.use(expressLayouts);
server.use(express.urlencoded({ extended: true }));
server.use(express.json()); 
server.set("view engine", "ejs");

server.use(session({
    secret: process.env.SESSION_SECRET || 'SecretKey123', 
    resave: false,
    saveUninitialized: false, 
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

server.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cartItemCount = (req.session.cart && req.session.cart.reduce((sum, item) => sum + item.quantity, 0)) || 0;
    next();
});


const Category = require("./models/categories.model");
const Gifting = require('./models/gifting.model');
const Carosel = require('./models/Carosel.model');


server.use("/", require("./controllers/customer/user.register.controller"));
server.use("/", require("./controllers/customer/user.login.controller"));
server.use("/", require("./controllers/admin/admin.login.controller"));
server.use("/", require("./controllers/admin/admin.register.controller"));
server.use("/", require("./controllers/admin/admin.categories.controller"));
server.use("/", require("./controllers/admin/admin.carosel.controller"));
server.use("/", require("./controllers/breadController"));
server.use("/", require("./controllers/cakeController"));
server.use("/", require("./controllers/snackController"));
server.use("/", require("./controllers/sandwichController"));
server.use("/", require("./controllers/pizzaController"));
server.use("/", require("./controllers/burgerController"));
server.use("/", require("./controllers/biscuitController"));
server.use("/", require("./controllers/pastryController"));
server.use("/", require("./controllers/donutController"));
server.use("/", require("./controllers/saladController"));
server.use("/", require("./controllers/nimkoController"));
server.use("/", require("./controllers/puffController"));
server.use("/", require("./controllers/giftingController"));
server.use("/", require("./controllers/kanasController"));
server.use("/", require("./controllers/packeditemController"));
server.use("/", require("./controllers/orderController"));
server.use("/", require("./controllers/admin/admin.gifting.controller"));
const cartController = require('./controllers/cartController');
server.use("/", cartController);
const adminController = require('./controllers/admin/adminorder.controller');
server.use("/", adminController);

server.get("/admin", (req, res) => {
    res.render("admin/admin", { layout: "admin/adminlayout" });
});


server.get('/customer/account', async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect('/login');
        }
        const userEmail = req.session.user.email?.trim().toLowerCase();
        console.log('User email:', userEmail);
        const count = await Order.find({ userEmail: req.session.user.email }).countDocuments();
        console.log('Order count:', count);
        res.render('customer/account', { order: count });
    } catch (error) {
        console.error('Error fetching order count:', error);
        res.status(500).send('Internal Server Error');
    }
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

server.get("/checkoutform", middleware.ensureAuthenticatedUser, async (req, res) => {
    if (!req.session.cart || req.session.cart.length === 0) {
        return res.redirect("/viewcart");
    }

    // Get user data and cart items
    const userData = req.session.user;
    const cartItems = req.session.cart;

    // Calculate totals
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = 0; // You can implement shipping calculation here
    const tax = subtotal * 0.17; // 17% tax
    const total = subtotal + shipping + tax;

    // Add image URLs to cart items if they don't exist
    cartItems.forEach(item => {
        if (!item.image) {
            // Add a default image URL or fetch from your database
            item.image = "https://tehzeeb.com/media/catalog/product/cache/6ae3a50c5c0313a15177419915526b1d/b/l/black_forest_cake_1.jpg";
        }
    });

    res.render("checkoutform", {
        layout: true,
        user: userData,
        cartItems,
        subtotal,
        shipping,
        tax,
        total
    });
});


server.get("/cv", (req, res) => {
    res.render("cv");
});


mongoose.connect("mongodb://127.0.0.1:27017/Tehzeeb_Bakers").then(() => {
    console.log("connected to db");
});

server.listen(4000, () => {
    console.log("🚀 Server is running on http://localhost:4000");
});


server.get("/categories/:categoryName", async (req, res, next) => {
    const categoryName = req.params.categoryName;
    try {
        const viewPath = path.join(__dirname, "../views/categories", `${categoryName}.ejs`);
        if (!fs.existsSync(viewPath)) {
            return res.status(404).render("404", {
                pageTitle: "Page Not Found",
                message: "Category page not found."
            });
        }

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
        layout: 'layout',
        title: 'Page Not Found',
        message: 'Page not found',
        pageTitle: 'Page Not Found'  
    });
});

server.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        layout: 'layout',
        title: 'Error',
        message: err.message || 'Something broke!',
        error: process.env.NODE_ENV === 'development' ? err : {},
        pageTitle: 'Error'
    });
});