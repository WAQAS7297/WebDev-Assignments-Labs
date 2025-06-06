// Authentication middleware
const isAuthenticated = (req, res, next) => {
    // Check if user is authenticated
    if (req.isAuthenticated && req.isAuthenticated()) {
        return next();
    }
    
    // If not authenticated, redirect to login page
    res.redirect('/login');
};

module.exports = {
    isAuthenticated
}; 