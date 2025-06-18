
function ensureAuthenticatedUser(req, res, next) {
    if (!req.session || !req.session.user) {
        console.log('No session or user in session');
        return res.redirect('/login');
    }

    if (!req.session.user.email) {
        console.log('Invalid user data in session');
        return res.redirect('/login');
    }

    next();
}

function ensureAdmin(req, res, next) {
    if (!req.session.user || req.session.user.isAdmin !== 'admin') {
        return res.redirect('/');
    }
    next();
}


module.exports = {
    ensureAuthenticatedUser,
    ensureAdmin
};