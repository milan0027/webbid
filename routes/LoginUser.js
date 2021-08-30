const express = require('express');
const router = express.Router();
const { isLoggedIn, validateWalletValue} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const Product = require('../models/product');
const User = require('../models/user')

router.route('/wallet')
.get(isLoggedIn, catchAsync( async(req, res) =>{
     res.render('products/wallet')
}))
.put( isLoggedIn, validateWalletValue, catchAsync( async(req,res) =>{
    const id = req.user._id
    const updateValue = parseInt(req.body.walletAdd.wallet) + req.user.wallet
    const user  = await User.findByIdAndUpdate(id, { wallet: updateValue});
    req.flash('success', 'Value Added Successfully')
    res.redirect('/user/wallet')
}))

module.exports = router

