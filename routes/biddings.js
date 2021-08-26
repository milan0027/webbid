const express = require('express');
const router = express.Router({ mergeParams: true });
const { biddingSchema } = require('../schemas.js');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Product = require('../models/product');
const Bidding = require('../models/biddings');

const validateBidding = (req, res, next) => {
    const { error } = biddingSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.post('/', validateBidding, catchAsync(async (req, res) => {
    const product = await Product.findById(req.params.id);
    const bidding = new Bidding(req.body.bidding);
    if(bidding.price<=product.lastbid) throw new ExpressError("bid value must be greater",400)
    product.biddings.push(bidding);
    product.lastbid = bidding.price
    await bidding.save();
    await product.save();
    //req.flash('success','Bid Added')
    res.redirect(`/products/${product._id}`);
}))

module.exports = router