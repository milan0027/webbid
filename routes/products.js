const express = require('express');
const router = express.Router();
const { productSchema } = require('../schemas.js');
const { isLoggedIn } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Product = require('../models/product');


const validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

router.get('/', catchAsync( async (req, res) => {
    const products = await Product.find({});
    res.render('products/index', { products })
}));

router.get('/new', isLoggedIn, catchAsync( async (req, res) => {
    res.render('products/new');
}))

router.post('/', isLoggedIn, validateProduct, catchAsync( async (req, res,next) => {
   
    const product = new Product(req.body.product);
    product.endTime = Date.parse(product.startTime)+product.duration*3600000 
    product.lastbid = product.price-1
    await product.save();
    req.flash('success','Successfully added a new item')
    res.redirect(`/products/${product._id}`)
}))

router.get('/:id', catchAsync( async (req, res,) => {
    const product = await Product.findById(req.params.id).populate('biddings')
    if(!product)
    {
        req.flash('error','Item does not Exist or is Deleted')
        return res.redirect('/products')
    } 
    res.render('products/show', { product });
}));

router.get('/:id/edit',isLoggedIn, catchAsync( async (req, res) => {
    const product = await Product.findById(req.params.id)
    if(!product)
    {
        req.flash('error','Item does not Exist or is Deleted')
        return res.redirect('/products')
    } 
    res.render('products/edit', { product });
}))

router.put('/:id', isLoggedIn, validateProduct, catchAsync( async (req, res) => {
    const { id } = req.params;
    const inputs = req.body.product
    const endtime = Date.parse(inputs.startTime)+inputs.duration*3600000
    const lastBid = inputs.price-1
    const product = await Product.findByIdAndUpdate(id, { ...req.body.product , endTime: endtime, lastbid: lastBid});
    req.flash('success','Successfully Updated the item')
    res.redirect(`/products/${product._id}`)
}));

router.delete('/:id',isLoggedIn, catchAsync(async (req, res) => {
    const { id } = req.params;
    await Product.findByIdAndDelete(id);
    req.flash('success','Successfully Deleted the item')
    res.redirect('/products');
}))

module.exports = router