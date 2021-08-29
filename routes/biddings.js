const express = require('express');
const router = express.Router({ mergeParams: true });
//const { biddingSchema } = require('../schemas.js');
const {validateBidding, isLoggedIn} = require('../middleware')
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Product = require('../models/product');
const Bidding = require('../models/biddings');

router.post('/',isLoggedIn, validateBidding, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const bidding = new Bidding(req.body.bidding);

    if(bidding.price>req.user.wallet)
    {
        req.flash('error', 'Insufficient Balance in Wallet')
        return res.redirect(`/products/${product._id}`);
    }
    if(bidding.price<=product.lastbid) {
        req.flash('error', 'Bid Value Must be Greater')
        return res.redirect(`/products/${product._id}`);
    }
    if(Date.now()<product.startTime || Date.now()>product.endTime){
        req.flash('error', 'Action Not Allowed!!!')
        return res.redirect(`/products/${product._id}`);
    }
    await product.biddings.push(bidding);
    product.lastbid = bidding.price
    bidding.owner = req.user._id;
    await bidding.save();
    await product.save();
    //req.flash('success','Bid Added')
    res.redirect(`/products/${product._id}`);
}))

module.exports = router