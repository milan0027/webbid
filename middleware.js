module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;
        req.flash('error', 'Sign in to continue');

        return res.redirect('/login');

    }
    next();
}