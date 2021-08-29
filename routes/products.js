const express = require('express');
const router = express.Router();
const { productSchema } = require('../schemas.js');
const { isLoggedIn, validateProduct, isOwnerAndLimit} = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Product = require('../models/product');

router.route('/')
.get(catchAsync( async (req, res) => {
    const d = Date.now()
    const type = "All"
    const category = undefined;
    const products = await Product.find({endTime:{ $gt: d }});
    res.render('products/index', { products, category, type })
}))
.post( isLoggedIn, validateProduct, catchAsync( async (req, res,next) => {
    const product = new Product(req.body.product);
    if(Date.now()>=product.startTime){
        req.flash('error', 'Start Time must be greater than Present Time');
       return res.redirect(`/products/new`)

    }
   
    
    product.endTime = Date.parse(product.startTime)+product.duration*3600000 
    product.lastbid = product.price-1
    product.owner = req.user._id
    await product.save();
    req.flash('success','Successfully added a new item')
    res.redirect(`/products/${product._id}`)
}))

router.get('/new', isLoggedIn, catchAsync( async (req, res) => {
    res.render('products/new');
}))



router.route('/:id')
.get(isLoggedIn, catchAsync( async (req, res,) => {
    const product = await Product.findById(req.params.id).populate({
        path: 'biddings',
        populate: {
            path: 'owner',
            select: 'username'
        }
    }).populate('owner','username');
    if(!product)
    {
        req.flash('error','Item does not Exist or is Deleted')
        return res.redirect('/products')
    } 
    res.render('products/show', { product });
}))
.put( isLoggedIn,isOwnerAndLimit,validateProduct, catchAsync( async (req, res) => {
    const { id } = req.params;
   
    const inputs = req.body.product
    const val = Date.parse(inputs.startTime)
    if(Date.now() >= val){
        req.flash('error', 'Start Time must be greater than Present Time');
       return  res.redirect(`/products/${id}/edit`)
    }
    const endtime = val + inputs.duration*3600000
    const lastBid = inputs.price-1
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product , endTime: endtime, lastbid: lastBid});
    req.flash('success','Successfully Updated the item')
    res.redirect(`/products/${product._id}`)
}))
.delete(isLoggedIn,isOwnerAndLimit, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted the item')
    res.redirect('/products');
}))


router.get('/:id/edit',isLoggedIn,isOwnerAndLimit, catchAsync( async (req, res) => {
    const product = await Product.findById(req.params.id)
    if(!product)
    {
        req.flash('error','Item does not Exist or is Deleted')
        return res.redirect('/products')
    } 
    res.render('products/edit', { product });
}))

module.exports = router