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

router.route('/favorites')
.get(isLoggedIn, catchAsync( async(req, res) =>{

    const user = await User.findById(req.user._id).populate('favorites');
    const products = user.favorites;
    res.render('products/favorites',{ products})

}))

router.put('/:id/remove', isLoggedIn, catchAsync( async(req, res)=>{
    const user = await User.findById(req.user._id);
    const {id} = req.params;
    const product = await Product.findById(id);
    const ind  = await user.favorites.indexOf(id);
        await user.favorites.splice(ind,1);
        product.favCount--;
       
    await user.save();
    await product.save();
    req.flash('success','Item Removed from Favorites');
    res.redirect(`/user/favorites`);

    
}))

router.get('/itemsadded', isLoggedIn, catchAsync( async(req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsAdded')
    const products = user.itemsAdded;
    const type = "All"
    await products.reverse()
    
    res.render('products/itemsadded',{ products, type })

}))

router.get('/itemsadded/live', isLoggedIn, catchAsync( async(req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsAdded')
    const d = Date.now();
    const products = user.itemsAdded.filter( e=> d>=e.startTime&&d<=e.endTime );
    const type = "Live"
    
    res.render('products/itemsadded',{ products, type })

}))

router.get('/itemsadded/scheduled', isLoggedIn, catchAsync( async(req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsAdded')
    const d = Date.now();
    const products = user.itemsAdded.filter( e=> d<e.startTime );
    const type = "Scheduled"
    
    res.render('products/itemsadded',{ products, type })

}))

router.get('/itemsadded/biddingover', isLoggedIn, catchAsync( async(req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsAdded')
    const d = Date.now();
    const products = user.itemsAdded.filter( e=> d>=e.endTime&&!e.sold);
    const type = "BiddingOver"
    
    res.render('products/itemsadded',{ products, type })

}))

router.get('/itemsadded/sold', isLoggedIn, catchAsync( async(req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsAdded')
    const products = user.itemsAdded.filter( e=> e.sold );
    const type = "Sold"
    await products.reverse()
    
    res.render('products/itemsadded',{ products, type })

}))

router.get('/itemswon', isLoggedIn, catchAsync( async( req, res)=>{

    const user = await User.findById(req.user._id).populate('itemsWon')
    const products = user.itemsWon;
    
    res.render('products/itemswon',{ products })

}))

module.exports = router

