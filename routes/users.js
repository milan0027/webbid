const express = require('express')
const router = express.Router()
const passport = require('passport')
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user')

router.get('/register', (req, res) =>{

    res.render('users/register')

})

router.post('/register',catchAsync( async (req, res, next) =>{
    //res.send(req.body)
try{
    const { username, email, password} = req.body;
    const user = new User({ email, username});
    const regUser = await User.register(user, password);
    req.login(regUser, err=>{
        if(err) return next(err)

        req.flash('success', 'Welcome '+username);
        res.redirect('/products')
    })
    


}catch(e){
    req.flash('error', e.message);
    res.redirect('/register');
}
    
}))

router.get('/login', (req,res) =>{
    res.render('users/login')
})

router.post('/login',passport.authenticate('local', { failureFlash: true, failureRedirect: '/login' }), (req,res)=>{
    req.flash('success', 'Welcome back, '+req.body.username);
    const redirectUrl = req.session.returnTo || '/products';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
})

router.get('/logout', (req, res) => {
    req.logout();
    req.flash('success', "Session Logged Out");
    res.redirect('/products');
})

module.exports = router